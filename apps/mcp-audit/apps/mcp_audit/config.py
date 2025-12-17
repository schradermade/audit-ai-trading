from pydantic import BaseModel
import os

class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "dev")
    db_path: str = os.getenv("AUDIT_DB_PATH", "/data/audit.db")
    hash_chain: bool = os.getenv("AUDIT_HASH_CHAIN", "true").lower() == "true"

settings = Settings()
