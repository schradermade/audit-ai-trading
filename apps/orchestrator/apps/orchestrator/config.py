from pydantic import BaseModel
from shared.config_utils import get_env

class Settings(BaseModel):
    app_env: str = get_env(
        "APP_ENV", 
        "dev"
    )
    
    app_version: str = get_env(
        "APP_VERSION", 
        "dev"
    )

    audit_mcp_base_url: str = get_env(
        "AUDIT_MCP_BASE_URL",
        "http://audit-mcp:8020"
    )

    risk_mcp_base_url: str = get_env(
        "RISK_MCP_BASE_URL",
        "http://risk-mcp:8020"
    )

    
    require_trace_id: bool = get_env(
        "ORCH_REQUIRE_TRACE_ID", 
        "true"
    ).lower() == "true"
    
    anthropic_api_key: str | None = get_env(
        "ANTHROPIC_API_KEY"
    )

    claude_primary_model: str = get_env(
        "CLAUDE_PRIMARY_MODEL",
        "claude-3-haiku-20240307"
    )

    claude_fallback_model: str = get_env(
        "CLAUDE_FALLBACK_MODEL",
        "claude-3-5-haiku-20241022"
    )
    
settings = Settings()

