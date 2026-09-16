from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.case import CaseDetailResponse
from app.schemas.ems import (
    EMSVerificationCreate,
    EMSVerificationResponse,
    EMSVitalsCreate,
    EMSVitalsResponse,
    EMSTransportStatusUpdate,
    EMSHandoverCompleteRequest,
)
from app.services.ems_service import (
    list_ems_cases,
    record_ems_verification,
    record_ems_vitals,
    update_transport_status,
    complete_handover,
)
from app.services.case_service import get_case_by_identifier
from app.services.state_machine import InvalidStateTransitionError

router = APIRouter()


@router.get("/cases", response_model=List[CaseDetailResponse], summary="List EMS emergency cases")
def get_ems_cases(
    unit_id: Optional[str] = Query(None, description="Filter by assigned unit ID, e.g. ALS-04"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by case status"),
    db: Session = Depends(get_db),
):
    """
    Retrieve active or assigned emergency cases for EMS crews.
    """
    cases = list_ems_cases(db=db, unit_id=unit_id, status=status_filter)
    return cases


@router.get("/cases/{case_id}", response_model=CaseDetailResponse, summary="Get EMS case detail")
def get_ems_case(
    case_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve comprehensive details for an assigned EMS case.
    """
    case = get_case_by_identifier(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency case '{case_id}' not found.",
        )
    return case


@router.post(
    "/cases/{case_id}/verify",
    response_model=EMSVerificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record paramedic clinical verification",
)
def verify_scene_assessment(
    case_id: str,
    verification_in: EMSVerificationCreate,
    db: Session = Depends(get_db),
):
    """
    Store verified on-scene ABC clinical observations with explicit EMS_VERIFIED source tag.
    """
    try:
        verification = record_ems_verification(
            db=db,
            case_identifier=case_id,
            verification=verification_in,
        )
        return verification
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/cases/{case_id}/vitals",
    response_model=EMSVitalsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record streamed vital signs",
)
def stream_patient_vitals(
    case_id: str,
    vitals_in: EMSVitalsCreate,
    db: Session = Depends(get_db),
):
    """
    Record and stream vital signs with strict EMS_VERIFIED provenance.
    """
    try:
        vitals = record_ems_vitals(
            db=db,
            case_identifier=case_id,
            vitals=vitals_in,
        )
        return vitals
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/cases/{case_id}/status",
    response_model=CaseDetailResponse,
    summary="Update EMS transport status",
)
def update_ems_case_status(
    case_id: str,
    status_in: EMSTransportStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Update paramedic transport progression state with lifecycle validation.
    """
    try:
        updated_case = update_transport_status(
            db=db,
            case_identifier=case_id,
            status_update=status_in,
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


@router.post(
    "/cases/{case_id}/handover",
    response_model=CaseDetailResponse,
    summary="Complete clinical handover at hospital",
)
def complete_case_handover(
    case_id: str,
    handover_in: EMSHandoverCompleteRequest,
    db: Session = Depends(get_db),
):
    """
    Formal clinical sign-off and transfer of care at the receiving hospital.
    """
    try:
        case = complete_handover(
            db=db,
            case_identifier=case_id,
            handover_data=handover_in,
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
