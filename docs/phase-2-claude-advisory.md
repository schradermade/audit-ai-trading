# Phase 2: Claude Advisory (Non-Authoritative)

## Goal

Add an LLM advisory step that can improve explanations and surface risks,
without having authority to approve/reject trades or override policies.

## Safety invariants

1. Risk MCP remains the sole policy authority (hard enforcement).
2. Orchestrator is the sole owner of outcomes delivered externally.
3. Claude outputs are advisory-only and must not change the final decision.
4. No decision leaves the system unless it is audited (fail-closed).
5. Claude must never be able to call execution tools directly.

## Updated request flow (high level)

Client -> Orchestrator

1. audit: request_received
2. Risk MCP evaluate (hard pass/reject)
3. Claude advisory (optional, bounded)
4. audit: advisory_generated
5. audit: decision_forwarded
6. return response

## Where Claude runs

Claude is called only by Orchestrator.
Risk MCP remains deterministic and does not call Claude.

## Claude inputs (allowed)

- actor (desk/role)
- trade (symbol, qty, side, order_type, limit_price if present)
- as_of timestamp
- risk_result (pass/reject + policy refs)
- policy summary (optional, read-only)

## Claude outputs (contract)

Claude returns JSON with:

- recommendation: "proceed" | "caution" | "reject" (advisory only)
- rationale: short explanation (no prohibited content)
- risk_flags: array of strings
- confidence: 0.0-1.0
- suggested_next_steps: array of strings

## Audit events added

- advisory_generated (orchestrator)
  payload includes:
  - model + version
  - input hash / prompt id
  - advisory output (sanitized)
  - eval results (pass/fail + reasons)

## Evals required (minimum)

- Output schema validation (JSON contract)
- "No policy override" check (Claude cannot change risk_result)
- Hallucination guardrails (no invented policy IDs / no fabricated facts)
- Safety classifier (no disallowed instructions)
- Length + redaction limits (no secrets / no PII leakage)
