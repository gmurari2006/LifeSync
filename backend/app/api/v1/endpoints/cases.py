from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.case import CaseDetailResponse, CaseListResponse, CaseCreate, CaseStatusUpdate
from app.services.case_service import (
    get_case_by_identifier,
    list_cases,
    update_case_lifecycle_state,
)
from app.services.state_machine import InvalidStateTransitionError
from app.models.emergency_case import EmergencyCase
from app.models.base import utc_now
from app.services.citizen_service import generate_human_case_id
from app.services.audit_service import create_audit_event

router = APIRouter()


@router.get("", response_model=CaseListResponse, summary="List emergency cases")
def get_cases(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    hospital_id: Optional[str] = None,
    unit_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    Retrieve paginated list of emergency cases with optional filtering.
    """
    total, cases = list_cases(
        db=db,
        status=status_filter,
        priority=priority_filter,
        hospital_id=hospital_id,
        unit_id=unit_id,
        limit=limit,
        offset=offset,
    )
    return CaseListResponse(total=total, cases=cases)


@router.get("/{case_id}", response_model=CaseDetailResponse, summary="Get emergency case detail")
def get_case(
    case_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve full details of an emergency case by UUID or human-readable case ID (e.g., LS-2026-001).
    """
    case = get_case_by_identifier(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency case '{case_id}' not found.",
        )
    return case


@router.post("", response_model=CaseDetailResponse, status_code=status.HTTP_201_CREATED, summary="Create emergency case")
def create_case(
    case_in: CaseCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new emergency case.
    """
    case_code = generate_human_case_id(db)
    new_case = EmergencyCase(
        case_id=case_code,
        incident_type=case_in.incident_type,
        operational_priority=case_in.operational_priority,
        status="REPORTED",
        patient_count=case_in.patient_count,
        patient_age=case_in.patient_age,
        patient_sex=case_in.patient_sex,
        reported_location=case_in.reported_location,
        landmark=case_in.landmark,
        latitude=case_in.latitude,
        longitude=case_in.longitude,
        destination_hospital_id=case_in.destination_hospital_id,
        assigned_unit_id=case_in.assigned_unit_id,
        time_reported=utc_now(),
    )
    db.add(new_case)
    db.flush()

    create_audit_event(
        db=db,
        case_id=new_case.id,
        event_type="CASE_INITIALIZED",
        actor_type="SYSTEM",
        actor_name="Dispatcher System",
        title="Emergency Case Created",
        description=f"Case initialized for '{case_in.incident_type}' at {case_in.reported_location}.",
    )
    db.commit()
    db.refresh(new_case)
    return new_case


@router.patch("/{case_id}/status", response_model=CaseDetailResponse, summary="Update case lifecycle status")
def update_case_status(
    case_id: str,
    status_update: CaseStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Advance or update emergency case lifecycle status with strict state machine validation.
    Returns HTTP 409 Conflict if transition is prohibited.
    """
    try:
        updated_case = update_case_lifecycle_state(
            db=db,
            case_identifier=case_id,
            target_status=status_update.status,
            actor_type=status_update.actor_type,
            actor_name=status_update.actor_name,
            notes=status_update.notes,
        )
        return updated_case
    except InvalidStateTransitionError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
