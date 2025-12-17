from fastapi import FastAPI
from datetime import datetime, timezone
import requests

from .policy_loader import load_policies

AUDIT_MCP_URL = "http://audit-mcp:8010"

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok", "service": "risk-mcp"}


@app.post("/evaluate")
def evaluate(payload: dict):
    as_of = datetime.fromisoformat(payload["as_of"].replace("Z", "+00:00"))
    policies = load_policies(as_of)

    trade = payload["trade"]
    actor = payload["actor"]
    trace_id = payload["trace_id"]

    for policy in policies:
        if (
            policy["rule"]["type"] == "max_position"
            and trade["symbol"] == policy["scope"]["symbol"]
            and actor["desk"] == policy["scope"]["desk"]
        ):
            if trade["quantity"] > policy["rule"]["max_shares"]:
                _emit_audit(
                    trace_id,
                    "decision_made",
                    {
                        "decision": "reject",
                        "reason": "policy_violation",
                        "policy_id": policy["policy_id"],
                        "version": policy["version"],
                        "requested": trade["quantity"],
                        "max_allowed": policy["rule"]["max_shares"],
                    },
                )
                
                return {
                    "result": "reject",
                    "policy_id": policy["policy_id"],
                    "policy_version": policy["version"],
                    "reason": "position limit exceeded",
                }

    _emit_audit(
        trace_id,
        "policy_evaluated",
        {"result": "pass"},
    )

    return {"result": "pass"}


def _emit_audit(trace_id: str, event_type: str, payload: dict):
    try:
        r = requests.post(
            f"{AUDIT_MCP_URL}/audit/log",
            json={
                "trace_id": trace_id,
                "event_type": event_type,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "payload": payload,
            },
            timeout=2,
        )

        if r.status_code >= 400:
            print("[AUDIT ERROR]", r.status_code, r.text)

        r.raise_for_status()

    except Exception as e:
        print(f"[AUDIT EMIT FAILED] {e}")

