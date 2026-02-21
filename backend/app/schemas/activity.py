from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ActivityLogRead(BaseModel):
    id: UUID
    user_id: int
    action: str
    entity_type: str
    entity_id: UUID
    extra_data: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}

