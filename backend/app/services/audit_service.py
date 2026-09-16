from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.models.audit import CaseAuditEvent
from app.models.base import utc_now


def create_audit_event(
    db: Session,
    case_id: str,
    event_type: str,
    actor_type: str,
    actor_name: str,
    title: str,
    description: str,
    previous_state: Optional[str] = None,
    new_state: Optional[str] = None,
    event_metadata: Optional[Dict[str, Any]] = None,
) -> CaseAuditEvent:
    """
    Appends an immutable audit event for an emergency case.
    Case_id must be the primary key UUID of the EmergencyCase.
    """
    event = CaseAuditEvent(
        case_id=case_id,
        timestamp=utc_now(),
        event_type=event_type,
        actor_type=actor_type,
        actor_name=actor_name,
        previous_state=previous_state,
        new_state=new_state,
        title=title,
        description=description,
        event_metadata=event_metadata or {},
    )
    db.add(event)
    return event
