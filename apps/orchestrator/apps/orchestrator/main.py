from fastapi import FastAPI, Header, HTTPException
from shared.schemas.trade import TradeRecommendationRequest, TradeRecommendationResponse, ComplianceResult, RiskFlag
from shared.schemas.audit import AuditEventType
from .config import settings
from .audit_client import AuditClient
import uuid
import requests


RISK_MCP_URL = "http://risk-mcp:8020"

app = FastAPI(title="AITDP Orchestrator", version="0.1.0")
audit = AuditClient()

@app.get("/health")
async def health():
    return {"status": "ok", "env": settings.app_env}

def require_trace_id(x_trace_id: str | None) -> str:
    if settings.require_trace_id and not x_trace_id:
        raise HTTPException(status_code=400, detail="Missing required header: X-Trace-Id")
    return x_trace_id or f"trace-{uuid.uuid4()}"

@app.post("/trade/recommendation", response_model=TradeRecommendationResponse)
async def trade_recommendation(req: TradeRecommendationRequest, x_trace_id: str | None = Header(default=None, alias="X-Trace-Id")):
    trace_id = require_trace_id(x_trace_id)

    await audit.log(trace_id, AuditEventType.REQUEST_RECEIVED, {
        "request_id": req.request_id,
        "actor": req.actor.model_dump(),
        "trade": req.trade.model_dump(),
        "intent": req.intent,
        "as_of": req.as_of.isoformat(),
    })

    # deterministic placeholder logic
    if req.trade.quantity > 100_000:
        resp = TradeRecommendationResponse(
            recommendation="escalate",
            modified_trade=None,
            rationale="Quantity exceeds desk threshold; escalation required.",
            risk_flags=[RiskFlag(type="size", severity="high", evidence_ref="mock:size_gate")],
            compliance=ComplianceResult(status="needs_review", policy_refs=["RISK-012"], evidence_refs=["mock:size_gate"]),
            confidence=0.9,
            next_steps=["escalate_to_risk"],
            audit_id="pending",
        )
    else:
        resp = TradeRecommendationResponse(
            recommendation="proceed",
            modified_trade=None,
            rationale="Trade passes mock checks. Replace with tool-gated risk checks and Claude workflow.",
            risk_flags=[],
            compliance=ComplianceResult(status="pass", policy_refs=["RISK-000"], evidence_refs=["mock"]),
            confidence=0.75,
            next_steps=["create_execution_ticket"],
            audit_id="pending",
        )

    decision_evt = await audit.log(trace_id, AuditEventType.DECISION_MADE, resp.model_dump(mode="json"))
    return resp.model_copy(update={"audit_id": decision_evt.audit_id})


@app.post("/trade/decision")
async def trade_decision(payload: dict):
    trace_id = payload["trace_id"]

    await audit.log(
        trace_id,
        AuditEventType.REQUEST_RECEIVED,
        {
            "source": "orchestrator",
            "actor": payload.get("actor"),
            "trade": payload.get("trade"),
            "as_of": payload.get("as_of"),
        },
    )
    
    risk_result = call_risk_evaluate(payload)
    advisory = generate_advisory_stub(payload, risk_result)

    await audit.log(
        trace_id,
        AuditEventType.ADVISORY_GENERATED,
        {
            "advisory": advisory,
            "risk_result": risk_result
        },
    )
    
    decision = "reject" if risk_result.get("result") == "reject" else "proceed"

    await audit.log(
        trace_id,
        AuditEventType.DECISION_FORWARDED,
        {
            "source": "orchestrator",
            "decision": decision,
            "risk_result": risk_result,
        },
    )
    
    return {
        "trace_id": trace_id,
        "decision": decision,
        "risk": risk_result,
    }

def generate_advisory_stub(payload: dict, risk_result: dict) -> dict:
    return {
        "recommendation": "caution" if risk_result.get("result") == "reject" else "proceed",
        "rationale": "Stub advisory: risk evaluation completed.",
        "risk_flags": ["position_limit_check"],
        "confidence": 0.5,
        "suggested_next_steps": ["review_position_size"],
        "model": "stub",
        "model_version": "v0"
    }


def call_risk_evaluate(payload: dict) -> dict:
    try:
        r = requests.post(
            f"{RISK_MCP_URL}/evaluate",
            json=payload,
            timeout=5,
        )
        r.raise_for_status()
        return r.json()
    except requests.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail="Risk MCP unavailable (fail-closed)",
        ) from e