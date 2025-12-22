from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

class AuditEventType(str, Enum):
    REQUEST_RECEIVED = "request_received"
    DECISION_MADE = "decision_made"
    DECISION_FORWARDED = "decision_forwarded"
    ADVISORY_GENERATED = "advisory_generated"
    ADVISORY_FAILED = "advisory_failed"
    ERROR = "error"

class AuditEvent(BaseModel):
    audit_id: str = Field(..., description="Server-generated audit id")
    trace_id: str
    event_type: AuditEventType
    timestamp: datetime
    payload: Dict[str, Any]
    prev_hash: Optional[str] = None
    event_hash: Optional[str] = None

class AuditWriteRequest(BaseModel):
    trace_id: str = Field(..., min_length=1)
    event_type: AuditEventType
    timestamp: datetime
    payload: Dict[str, Any] = Field(default_factory=dict)

class AuditWriteResponse(BaseModel):
    audit_id: str
    event_hash: str
    prev_hash: Optional[str] = None
