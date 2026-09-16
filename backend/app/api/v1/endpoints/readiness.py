from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.readiness import ReadinessSummaryResponse
from app.schemas.hospital import (
    HospitalResourceResponse,
    HospitalResourceUpdate,
    HospitalReadinessChecklistUpdateRequest,
)
from app.schemas.case import CaseDetailResponse
from app.services.hospital_service import (
    get_hospital_readiness_summary,
    update_hospital_resource,
    update_readiness_checklist,
)

router = APIRouter()


@router.get(
    "/{hospital_id}/readiness",
    response_model=ReadinessSummaryResponse,
    summary="Get hospital readiness summary",
)
def get_readiness_overview(
    hospital_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve hospital readiness overview, bay capacities, and critical resource states.
    """
    summary = get_hospital_readiness_summary(db, hospital_id=hospital_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital '{hospital_id}' not found.",
        )
    return summary


@router.patch(
    "/{hospital_id}/readiness/{resource_id}",
    response_model=HospitalResourceResponse,
    summary="Update readiness resource state",
)
def patch_resource_state(
    hospital_id: str,
    resource_id: str,
    resource_update: HospitalResourceUpdate,
    db: Session = Depends(get_db),
):
    """
    Update status, capacity, or assignment for a hospital readiness resource.
    """
    updated_resource = update_hospital_resource(
        db=db,
        hospital_id=hospital_id,
        resource_id=resource_id,
        update_data=resource_update,
    )
    if not updated_resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource '{resource_id}' for hospital '{hospital_id}' not found.",
        )
    return updated_resource


@router.post(
    "/{hospital_id}/cases/{case_id}/ready",
    response_model=CaseDetailResponse,
    summary="Update hospital operational readiness checklist item",
)
def update_case_ready_task(
    hospital_id: str,
    case_id: str,
    task_in: HospitalReadinessChecklistUpdateRequest,
    db: Session = Depends(get_db),
):
    """
    Update completion status for an operational readiness checklist item (Screen H5).
    """
    try:
        case = update_readiness_checklist(
            db=db,
            hospital_id=hospital_id,
            case_identifier=case_id,
            checklist_data=task_in,
        )
        return case
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

