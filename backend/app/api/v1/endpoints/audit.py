from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.emergency_case import EmergencyCase
from app.models.audit import CaseAuditEvent
from app.schemas.audit import CaseAuditTimelineResponse, CaseAuditEventItem
from app.services.case_service import get_case_by_identifier

router = APIRouter()


@router.get(
    "/{case_id}/audit-timeline",
    response_model=CaseAuditTimelineResponse,
    summary="Get authoritative immutable audit timeline for an emergency case",
)
def get_case_audit_timeline(
    case_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve chronological immutable audit events for an emergency case,
    including AI extraction logs, deterministic rule screenings, human decisions, and clinical handovers.
    """
    case = get_case_by_identifier(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency case '{case_id}' not found.",
        )

    events = (
        db.query(CaseAuditEvent)
        .filter(CaseAuditEvent.case_id == case.id)
        .order_by(CaseAuditEvent.timestamp.asc())
        .all()
    )

    event_items = [
        CaseAuditEventItem(
            id=e.id,
            case_id=case.case_id,
            timestamp=e.timestamp,
            event_type=e.event_type,
            actor_type=e.actor_type,
            actor_name=e.actor_name,
            previous_state=e.previous_state,
            new_state=e.new_state,
            title=e.title,
            description=e.description,
            event_metadata=e.event_metadata or {},
        )
        for e in events
    ]

    return CaseAuditTimelineResponse(
        case_id=case.id,
        case_code=case.case_id,
        total_events=len(event_items),
        current_status=case.status,
        events=event_items,
    )
