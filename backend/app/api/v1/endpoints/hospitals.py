from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.hospital import (
    HospitalResponse,
    HospitalAcknowledgeRequest,
    HospitalDivertRequest,
)
from app.schemas.case import CaseDetailResponse
from app.services.hospital_service import (
    list_hospitals,
    get_hospital_by_id,
    list_hospital_cases,
    acknowledge_incoming_case,
    divert_incoming_case,
)
from app.services.state_machine import InvalidStateTransitionError

router = APIRouter()


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


@router.get("/{hospital_id}/cases", response_model=List[CaseDetailResponse], summary="List hospital inbound cases")
def get_hospital_cases(
    hospital_id: str,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """
    List emergency cases directed to or inbound at a specific hospital emergency department.
    """
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
    db: Session = Depends(get_db),
):
    """
    Hospital clinical team acknowledges pre-arrival alert and optionally reserves an ED bay.
    """
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
    "/{hospital_id}/cases/{case_id}/divert",
    response_model=CaseDetailResponse,
    summary="Divert incoming emergency case",
)
def divert_case(
    hospital_id: str,
    case_id: str,
    divert_in: HospitalDivertRequest,
    db: Session = Depends(get_db),
):
    """
    Hospital issues diversion for incoming emergency with mandatory structured reason code.
    """
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
