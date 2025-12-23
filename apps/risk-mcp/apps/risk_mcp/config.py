from shared.config_utils import get_env

class Settings:
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
      "http://audit-mcp"
    )

settings = Settings()
