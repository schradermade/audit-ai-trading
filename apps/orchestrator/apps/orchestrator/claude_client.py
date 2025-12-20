from __future__ import annotations

import json
from typing import Any
from anthropic import AsyncAnthropic
from .config import settings


class AdvisoryParseError(Exception):
    pass


SYSTEM_PROMPT = """
You are an advisory system in a financial trading platform.

You MUST respond with ONLY a valid JSON object.
Do NOT include markdown, code fences, explanations, or prose.
Do NOT include extra fields.
Do NOT include null values.

If you cannot produce a valid advisory, return EXACTLY:
{"error":"advisory_unavailable"}

Failure to follow these rules will cause the response to be rejected.
"""


def build_user_prompt(trade: dict, risk_result: dict) -> str:
    return f"""
Produce an advisory that matches this exact schema:

{{
  "recommendation": "proceed" | "caution" | "reject",
  "rationale": string,
  "risk_flags": string[],
  "confidence": number (0.0 to 1.0),
  "suggested_next_steps": string[]
}}

Trade:
{json.dumps(trade, indent=2)}

Risk Result:
{json.dumps(risk_result, indent=2)}
"""


def parse_claude_json(raw: str) -> dict:
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise AdvisoryParseError(f"Invalid JSON from Claude: {e}") from e


def extract_json_object(text: str) -> str:
    """
    Extract the first JSON object from a string.
    """
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise AdvisoryParseError("No JSON object found in Claude response")
    return text[start : end + 1]


class ClaudeClient:
    def __init__(self) -> None:
        if not settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY not set")

        self.client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    async def generate_advisory(
        self,
        payload: dict,
        risk_result: dict,
    ) -> dict[str, Any]:
        trade = payload.get("trade") or {}

        user_prompt = build_user_prompt(trade, risk_result)

        resp = await self.client.messages.create(
            model=settings.claude_primary_model,
            system=SYSTEM_PROMPT,
            max_tokens=400,
            temperature=0,
            messages=[
                {"role": "user", "content": user_prompt},
            ],
        )

        # Fail closed on unexpected or empty responses
        if not resp.content or resp.content[0].type != "text":
            return {
                "recommendation": "caution",
                "rationale": "Advisory unavailable: empty model response",
                "risk_flags": ["advisory_error"],
                "confidence": 0.0,
                "suggested_next_steps": ["review_manually"],
                "model": "claude",
                "model_version": "error",
            }

        raw_text = resp.content[0].text

        try:
            json_text = extract_json_object(raw_text)
            advisory = parse_claude_json(json_text)
        except AdvisoryParseError:
            return {
                "recommendation": "caution",
                "rationale": "Advisory unavailable: invalid model output",
                "risk_flags": ["advisory_error"],
                "confidence": 0.0,
                "suggested_next_steps": ["review_manually"],
                "model": "claude",
                "model_version": "error",
            }

        # Normalize explicit error responses
        if advisory.get("error"):
            return {
                "recommendation": "caution",
                "rationale": "Advisory unavailable",
                "risk_flags": ["advisory_error"],
                "confidence": 0.0,
                "suggested_next_steps": ["review_manually"],
                "model": "claude",
                "model_version": "error",
            }

        # Defensive confidence clamp
        advisory["confidence"] = max(
            0.0, min(1.0, float(advisory.get("confidence", 0.0)))
        )

        advisory["model"] = "claude"
        advisory["model_version"] = settings.claude_primary_model
        return advisory
