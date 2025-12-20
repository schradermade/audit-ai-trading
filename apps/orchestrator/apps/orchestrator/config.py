from pydantic import BaseModel
import os

class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "dev")
    audit_mcp_base_url: str = os.getenv("AUDIT_MCP_BASE_URL", "http://audit-mcp:8010")
    risk_mcp_base_url: str = os.getenv("RISK_MCP_BASE_URL", "http://risk-mcp:8020")
    
    require_trace_id: bool = os.getenv("ORCH_REQUIRE_TRACE_ID", "true").lower() == "true"
    anthropic_api_key: str | None = os.getenv("ANTHROPIC_API_KEY")
    claude_primary_model: str = os.getenv(
        "CLAUDE_PRIMARY_MODEL",
        "claude-3-haiku-20240307"
    )

    claude_fallback_model: str = os.getenv(
        "CLAUDE_FALLBACK_MODEL",
        "claude-3-5-haiku-20241022"
    )
    
settings = Settings()
