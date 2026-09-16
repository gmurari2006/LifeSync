from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class CaseAuditEventItem(BaseModel):
    """
    Structured representation of a single immutable audit timeline event.
    """
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
    event_metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        from_attributes = True


class CaseAuditTimelineResponse(BaseModel):
    """
    Chronological immutable audit timeline for an emergency case.
    """
    case_id: str
    case_code: str
    total_events: int
    current_status: str
    events: List[CaseAuditEventItem]


# Backwards compatibility alias
TimelineEventResponse = CaseAuditEventItem

