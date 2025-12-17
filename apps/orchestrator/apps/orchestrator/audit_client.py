from datetime import datetime, timezone
import httpx
from .config import settings
from shared.schemas.audit import AuditWriteRequest, AuditWriteResponse, AuditEventType

class AuditClient:
    def __init__(self, base_url: str | None = None):
        self.base_url = (base_url or settings.audit_mcp_base_url).rstrip("/")

    async def log(self, trace_id: str, event_type: AuditEventType, payload: dict) -> AuditWriteResponse:
        req = AuditWriteRequest(
            trace_id=trace_id,
            event_type=event_type,
            timestamp=datetime.now(timezone.utc),
            payload=payload,
        )
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{self.base_url}/audit/log", json=req.model_dump(mode="json"))
            resp.raise_for_status()
            return AuditWriteResponse(**resp.json())
