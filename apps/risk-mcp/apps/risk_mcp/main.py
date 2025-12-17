from fastapi import FastAPI
from datetime import datetime, timezone
import requests
import time

from .policy_loader import load_policies

AUDIT_MCP_URL = "http://audit-mcp:8010"

class AuditWriteError(RuntimeError):
    """Raised when an audit event cannot be persisted."""

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
        "decision_made",
        {
            "decision": "pass",
            "reason": "policy_clear",
        },
    )

    return {"result": "pass"}


def _emit_audit(
    trace_id: str,
    event_type: str,
    payload: dict,
    *,
    retries: int = 3,
    backoff_seconds: float = 0.5,
):
    last_error = None

    for attempt in range(1, retries + 1):
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
                print(
                    "[AUDIT ERROR]",
                    {
                        "status": r.status_code,
                        "body": r.text,
                        "attempt": attempt,
                    },
                )

            r.raise_for_status()

            # Success
            return

        except Exception as e:
            last_error = e
            print(
                "[AUDIT RETRY FAILED]",
                {
                    "attempt": attempt,
                    "error": str(e),
                },
            )

            if attempt < retries:
                time.sleep(backoff_seconds * attempt)

    # Fail closed
    raise AuditWriteError(
        f"Failed to write audit event after {retries} attempts"
    ) from last_error
