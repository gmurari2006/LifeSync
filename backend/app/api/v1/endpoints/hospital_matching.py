from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.hospital_matching.service import HospitalMatchingService
from app.hospital_matching.schemas import (
    HospitalMatchingResult,
    DestinationConfirmRequest,
    DestinationRejectRequest,
    HospitalDivertRequest,
    HospitalMatchingHistoryResponse,
)

router = APIRouter()
matching_service = HospitalMatchingService()


@router.post(
    "/cases/{case_id}/calculate",
    response_model=HospitalMatchingResult,
    summary="Run deterministic hospital matching algorithm for an emergency case",
)
def calculate_case_matching(
    case_id: str,
    db: Session = Depends(get_db),
):
    try:
        return matching_service.calculate_matching(db, case_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Matching calculation failed: {str(e)}")


@router.get(
    "/cases/{case_id}",
    response_model=HospitalMatchingResult,
    summary="Get current hospital matching recommendation and candidate evaluations",
)
def get_latest_matching(
    case_id: str,
    db: Session = Depends(get_db),
):
    result = matching_service.get_latest_matching(db, case_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency case '{case_id}' not found or matching not calculated.",
        )
    return result


@router.post(
    "/cases/{case_id}/confirm",
    response_model=HospitalMatchingResult,
    summary="Human confirmation of destination hospital",
)
def confirm_destination(
    case_id: str,
    payload: DestinationConfirmRequest,
    db: Session = Depends(get_db),
):
    try:
        return matching_service.confirm_destination(
            db=db,
            case_id_or_uuid=case_id,
            hospital_id=payload.hospital_id,
            actor_name=payload.actor_name,
            actor_role=payload.actor_role,
            notes=payload.notes,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Confirmation failed: {str(e)}")


@router.post(
    "/cases/{case_id}/reject",
    response_model=HospitalMatchingResult,
    summary="Human rejection of destination recommendation with mandatory reason code",
)
def reject_destination(
    case_id: str,
    payload: DestinationRejectRequest,
    db: Session = Depends(get_db),
):
    if payload.reason_code == "OTHER" and not payload.reason_description:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="reason_description is mandatory when reason_code is 'OTHER'.",
        )
    try:
        return matching_service.reject_destination(
            db=db,
            case_id_or_uuid=case_id,
            hospital_id=payload.hospital_id,
            reason_code=payload.reason_code,
            reason_description=payload.reason_description,
            actor_name=payload.actor_name,
            actor_role=payload.actor_role,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Rejection failed: {str(e)}")


@router.post(
    "/cases/{case_id}/divert",
    response_model=HospitalMatchingResult,
    summary="Hospital-initiated diversion request with mandatory reason code",
)
def divert_hospital(
    case_id: str,
    payload: HospitalDivertRequest,
    db: Session = Depends(get_db),
):
    if payload.reason_code == "OTHER" and not payload.reason_description:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="reason_description is mandatory when reason_code is 'OTHER'.",
        )
    try:
        return matching_service.divert_hospital(
            db=db,
            case_id_or_uuid=case_id,
            hospital_id=payload.hospital_id,
            reason_code=payload.reason_code,
            reason_description=payload.reason_description,
            actor_name=payload.actor_name,
            actor_role=payload.actor_role,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Diversion failed: {str(e)}")


@router.get(
    "/cases/{case_id}/history",
    response_model=HospitalMatchingHistoryResponse,
    summary="Get versioned matching calculations and destination decision history",
)
def get_matching_history(
    case_id: str,
    db: Session = Depends(get_db),
):
    try:
        return matching_service.get_matching_history(db, case_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"History retrieval failed: {str(e)}")
