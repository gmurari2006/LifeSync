import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from app.models.emergency_case import EmergencyCase
from app.models.base import utc_now
from app.services.state_machine import validate_transition, InvalidStateTransitionError
from app.services.audit_service import create_audit_event


def get_case_by_identifier(db: Session, identifier: str) -> Optional[EmergencyCase]:
    """
    Look up an EmergencyCase by primary UUID (id) or human-readable code (case_id).
    Eagerly loads related citizen_reports, ems_verifications, ems_vitals, and audit_events.
    """
    case = db.query(EmergencyCase).options(
        joinedload(EmergencyCase.citizen_reports),
        joinedload(EmergencyCase.ems_verifications),
        joinedload(EmergencyCase.ems_vitals),
        joinedload(EmergencyCase.audit_events),
    ).filter(
        (EmergencyCase.id == identifier) | (EmergencyCase.case_id == identifier)
    ).first()
    return case


def list_cases(
    db: Session,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    hospital_id: Optional[str] = None,
    unit_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> Tuple[int, List[EmergencyCase]]:
    """
    Query emergency cases with optional filtering and pagination.
    """
    query = db.query(EmergencyCase).options(
        joinedload(EmergencyCase.citizen_reports),
        joinedload(EmergencyCase.ems_verifications),
        joinedload(EmergencyCase.ems_vitals),
        joinedload(EmergencyCase.audit_events),
    )

    if status:
        query = query.filter(EmergencyCase.status == status.upper())
    if priority:
        query = query.filter(EmergencyCase.operational_priority == priority.upper())
    if hospital_id:
        query = query.filter(EmergencyCase.destination_hospital_id == hospital_id)
    if unit_id:
        query = query.filter(EmergencyCase.assigned_unit_id == unit_id)

    total = query.count()
    cases = query.order_by(EmergencyCase.time_reported.desc()).offset(offset).limit(limit).all()
    return total, cases


def update_case_lifecycle_state(
    db: Session,
    case_identifier: str,
    target_status: str,
    actor_type: str = "EMS",
    actor_name: str = "Paramedic Team Alpha",
    notes: Optional[str] = None,
) -> EmergencyCase:
    """
    Deterministic lifecycle state transition with strict state machine validation and audit logging.
    """
    case = get_case_by_identifier(db, case_identifier)
    if not case:
        raise ValueError(f"Emergency case '{case_identifier}' not found.")

    target_status_upper = target_status.upper()
    previous_status = case.status

    # Validate state transition
    validate_transition(previous_status, target_status_upper)

    case.status = target_status_upper

    now = utc_now()
    if target_status_upper == "HOSPITAL_ALERTED":
        case.time_alerted = now
    elif target_status_upper == "HOSPITAL_ACKNOWLEDGED":
        case.time_acknowledged = now
        case.acknowledged_state = "ACKNOWLEDGED"
    elif target_status_upper == "ARRIVED":
        case.time_arrived = now
    elif target_status_upper in ("CLOSED", "HANDOVER_COMPLETE"):
        if target_status_upper == "CLOSED":
            case.time_closed = now

    event_title = f"Status Changed: {previous_status} -> {target_status_upper}"
    desc = notes or f"Case transitioned from {previous_status} to {target_status_upper} by {actor_name}."

    create_audit_event(
        db=db,
        case_id=case.id,
        event_type=f"STATE_{target_status_upper}",
        actor_type=actor_type,
        actor_name=actor_name,
        previous_state=previous_status,
        new_state=target_status_upper,
        title=event_title,
        description=desc,
        event_metadata={"notes": notes} if notes else {},
    )

    db.commit()
    db.refresh(case)
    return case
