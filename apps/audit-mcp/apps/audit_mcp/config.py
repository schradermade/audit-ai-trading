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
    
    db_path: str = get_env(
        "AUDIT_DB_PATH", 
        "/data/audit.db"
    )
    
    hash_chain: bool = get_env(
        "AUDIT_HASH_CHAIN", 
        "true"
    ).lower() == "true"

settings = Settings()

