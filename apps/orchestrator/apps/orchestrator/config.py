from pydantic import BaseModel
import os

class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "dev")
    audit_mcp_base_url: str = os.getenv("AUDIT_MCP_BASE_URL", "http://localhost:8010")
    require_trace_id: bool = os.getenv("ORCH_REQUIRE_TRACE_ID", "true").lower() == "true"

settings = Settings()
