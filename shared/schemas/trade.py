from datetime import datetime
from typing import Literal, Optional, Dict, Any, List
from pydantic import BaseModel, Field
from .common import Actor

class TradeIntent(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=16)
    side: Literal["buy", "sell"]
    quantity: int = Field(..., gt=0)
    order_type: Literal["market", "limit"]
    limit_price: Optional[float] = Field(default=None, gt=0)

    def model_post_init(self, __context: Any) -> None:
        if self.order_type == "limit" and self.limit_price is None:
            raise ValueError("limit_price is required when order_type == 'limit'")
        if self.order_type == "market" and self.limit_price is not None:
            raise ValueError("limit_price must be omitted when order_type == 'market'")

class TradeRecommendationRequest(BaseModel):
    request_id: str = Field(..., description="Client idempotency key (UUID recommended)")
    actor: Actor
    trade: TradeIntent
    intent: str = Field(..., min_length=1)
    constraints: Dict[str, Any] = Field(default_factory=dict)
    as_of: datetime

class RiskFlag(BaseModel):
    type: str = Field(..., min_length=1)
    severity: Literal["low", "medium", "high"]
    evidence_ref: str = Field(..., min_length=1)

class ComplianceResult(BaseModel):
    status: Literal["pass", "fail", "needs_review"]
    policy_refs: List[str] = Field(default_factory=list)
    evidence_refs: List[str] = Field(default_factory=list)

class TradeRecommendationResponse(BaseModel):
    recommendation: Literal["proceed", "modify", "deny", "escalate"]
    modified_trade: Optional[TradeIntent] = None
    rationale: str
    risk_flags: List[RiskFlag] = Field(default_factory=list)
    compliance: ComplianceResult
    confidence: float = Field(..., ge=0.0, le=1.0)
    next_steps: List[str] = Field(default_factory=list)
    audit_id: str
