from pydantic import BaseModel, Field
from typing import Literal

class Actor(BaseModel):
    user_id: str = Field(..., min_length=1)
    desk: str = Field(..., min_length=1)
    role: Literal["trader", "risk_manager", "compliance", "ops"] = "trader"
