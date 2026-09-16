from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any


class TimelineEventResponse(BaseModel):
    id: str
    case_id: str
    timestamp: datetime
    event_type: str
    actor_type: str
    actor_name: str
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    title: str
    description: str
    event_metadata: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)
