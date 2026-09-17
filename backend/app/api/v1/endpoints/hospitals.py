from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Header, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.hospital import (
    HospitalResponse,
    HospitalAcknowledgeRequest,
    HospitalDivertRequest,
    HospitalSettingsUpdate,
    HospitalBayAllocationRequest,
)
from app.schemas.case import CaseDetailResponse
from app.schemas.escalation import HospitalAlertEscalationsResponse
from app.services.hospital_service import (
    list_hospitals,
    get_hospital_by_id,
    list_hospital_cases,
    acknowledge_incoming_case,
    divert_incoming_case,
    allocate_bay_to_case,
    update_hospital_settings,
    resolve_hospital_id,
)
from app.services.escalation_service import escalation_service
from app.services.state_machine import InvalidStateTransitionError

router = APIRouter()

AUTHORIZED_FACILITY_SWITCH_ROLES = {"HOSPITAL_ADMIN", "REGIONAL_DISPATCHER", "DEMO_ADMIN", "SYSTEM"}


def enforce_hospital_rbac(
    hospital_id: str,
    actor_role: Optional[str],
    actor_hospital_id: Optional[str],
):
    """
    Enforces cross-facility security isolation:
    - If user has an administrative / switcher role (DEMO_ADMIN, HOSPITAL_ADMIN, REGIONAL_DISPATCHER, SYSTEM), access is granted across facilities.
    - If user is regular hospital staff and provides X-Actor-Hospital-Id, access is forbidden (403) if attempting to access another hospital's data or actions.
    """
    if actor_role and actor_role.upper() in AUTHORIZED_FACILITY_SWITCH_ROLES:
        return

    if actor_hospital_id:
        req_norm = resolve_hospital_id(hospital_id)
        actor_norm = resolve_hospital_id(actor_hospital_id)
        if req_norm != actor_norm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Cross-facility access denied: Staff assigned to '{actor_hospital_id}' cannot access facility '{hospital_id}'.",
            )


@router.get("", response_model=List[HospitalResponse], summary="List all hospital facilities")
def get_hospitals(
    db: Session = Depends(get_db),
):
    """
    Retrieve registered hospital facilities and operational capabilities.
    """
    return list_hospitals(db)


@router.get("/{hospital_id}", response_model=HospitalResponse, summary="Get hospital profile")
def get_hospital(
    hospital_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve single hospital details by ID.
    """
    hospital = get_hospital_by_id(db, hospital_id)
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital '{hospital_id}' not found.",
        )
    return hospital


@router.patch("/{hospital_id}/settings", response_model=HospitalResponse, summary="Update hospital operational settings")
def patch_hospital_settings(
    hospital_id: str,
    settings: HospitalSettingsUpdate,
    x_actor_role: Optional[str] = Header(None, alias="X-Actor-Role"),
    x_actor_hospital_id: Optional[str] = Header(None, alias="X-Actor-Hospital-Id"),
    db: Session = Depends(get_db),
):
    """
    Update facility operational status, diversion toggle, surge level, and bay counts.
    """
    enforce_hospital_rbac(hospital_id, x_actor_role, x_actor_hospital_id)
    updated = update_hospital_settings(db, hospital_id=hospital_id, settings=settings)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital '{hospital_id}' not found.",
        )
    return updated


@router.get("/{hospital_id}/alerts/escalations", response_model=HospitalAlertEscalationsResponse, summary="Get active hospital alert escalations")
def get_hospital_alert_escalations(
    hospital_id: str,
    x_actor_role: Optional[str] = Header(None, alias="X-Actor-Role"),
    x_actor_hospital_id: Optional[str] = Header(None, alias="X-Actor-Hospital-Id"),
    db: Session = Depends(get_db),
):
    """
    Retrieve unacknowledged emergency alert aging and multi-tier escalation status for a hospital.
    """
    enforce_hospital_rbac(hospital_id, x_actor_role, x_actor_hospital_id)
    hospital = get_hospital_by_id(db, hospital_id)
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital '{hospital_id}' not found.",
        )
    return escalation_service.list_hospital_escalations(db, hospital_id=hospital_id)


@router.get("/{hospital_id}/cases", response_model=List[CaseDetailResponse], summary="List hospital inbound cases")
def get_hospital_cases(
    hospital_id: str,
    status_filter: Optional[str] = Query(None, alias="status"),
    x_actor_role: Optional[str] = Header(None, alias="X-Actor-Role"),
    x_actor_hospital_id: Optional[str] = Header(None, alias="X-Actor-Hospital-Id"),
    db: Session = Depends(get_db),
):
    """
    List emergency cases directed to or inbound at a specific hospital emergency department.
    Enforces cross-facility RBAC isolation.
    """
    enforce_hospital_rbac(hospital_id, x_actor_role, x_actor_hospital_id)
    hospital = get_hospital_by_id(db, hospital_id)
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital '{hospital_id}' not found.",
        )
    return list_hospital_cases(db, hospital_id=hospital_id, status=status_filter)


@router.post(
    "/{hospital_id}/cases/{case_id}/acknowledge",
    response_model=CaseDetailResponse,
    summary="Acknowledge incoming emergency case",
)
def acknowledge_case(
    hospital_id: str,
    case_id: str,
    ack_in: HospitalAcknowledgeRequest,
    x_actor_role: Optional[str] = Header(None, alias="X-Actor-Role"),
    x_actor_hospital_id: Optional[str] = Header(None, alias="X-Actor-Hospital-Id"),
    db: Session = Depends(get_db),
):
    """
    Hospital clinical team acknowledges pre-arrival alert and optionally reserves an ED bay.
    """
    enforce_hospital_rbac(hospital_id, x_actor_role, x_actor_hospital_id)
    try:
        case = acknowledge_incoming_case(
            db=db,
            hospital_id=hospital_id,
            case_identifier=case_id,
            ack_data=ack_in,
        )
        return case
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


@router.post(
    "/{hospital_id}/cases/{case_id}/bay",
    response_model=CaseDetailResponse,
    summary="Allocate emergency bay to inbound case",
)
def allocate_bay(
    hospital_id: str,
    case_id: str,
    allocation_in: HospitalBayAllocationRequest,
    x_actor_role: Optional[str] = Header(None, alias="X-Actor-Role"),
    x_actor_hospital_id: Optional[str] = Header(None, alias="X-Actor-Hospital-Id"),
    db: Session = Depends(get_db),
):
    """
    Allocates an available resuscitation or emergency bay with conflict prevention.
    """
    enforce_hospital_rbac(hospital_id, x_actor_role, x_actor_hospital_id)
    try:
        case = allocate_bay_to_case(
            db=db,
            hospital_id=hospital_id,
            case_identifier=case_id,
            allocation_data=allocation_in,
        )
        return case
    except ValueError as e:
        if "cannot be assigned" in str(e).lower() or "conflict" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e),
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/{hospital_id}/cases/{case_id}/divert",
    response_model=CaseDetailResponse,
    summary="Divert incoming emergency case",
)
def divert_case(
    hospital_id: str,
    case_id: str,
    divert_in: HospitalDivertRequest,
    x_actor_role: Optional[str] = Header(None, alias="X-Actor-Role"),
    x_actor_hospital_id: Optional[str] = Header(None, alias="X-Actor-Hospital-Id"),
    db: Session = Depends(get_db),
):
    """
    Hospital issues diversion for incoming emergency with mandatory structured reason code.
    """
    enforce_hospital_rbac(hospital_id, x_actor_role, x_actor_hospital_id)
    try:
        case = divert_incoming_case(
            db=db,
            hospital_id=hospital_id,
            case_identifier=case_id,
            divert_data=divert_in,
        )
        return case
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


