from fastapi import FastAPI, Query
from shared.schemas.audit import AuditWriteRequest, AuditWriteResponse, AuditEvent
from .config import settings
from .storage import AuditStore

app = FastAPI(title="AITDP Audit MCP Server", version="0.1.0")
store = AuditStore(db_path=settings.db_path, hash_chain=settings.hash_chain)

@app.get("/health")
async def health():
    return {"status": "ok", "env": settings.app_env, "hash_chain": settings.hash_chain}

@app.post("/audit/log", response_model=AuditWriteResponse)
async def log_event(req: AuditWriteRequest):
    return store.write(req)

@app.get("/audit/events", response_model=list[AuditEvent])
async def list_events(trace_id: str = Query(..., min_length=1)):
    return store.list_by_trace(trace_id)
