from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.citizen import CitizenReportCreate, CitizenCaseResponse, CitizenReportResponse
from app.services.citizen_service import create_citizen_case_and_report
from app.services.case_service import get_case_by_identifier

router = APIRouter()


@router.post(
    "/reports",
    response_model=CitizenCaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit citizen bystander emergency report",
)
def submit_citizen_report(
    report_in: CitizenReportCreate,
    db: Session = Depends(get_db),
):
    """
    Intake initial observational emergency report from an on-scene bystander.
    Creates an emergency case in 'REPORTED' status and records initial audit log.
    Strictly adheres to safety boundaries: No automatic hospital pre-alert is triggered in Step 5.
    """
    case = create_citizen_case_and_report(db, report_in)
    
    # Get the latest citizen report attached to this case
    report_obj = case.citizen_reports[-1] if case.citizen_reports else None
    if not report_obj:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve created citizen report.",
        )

    return CitizenCaseResponse(
        id=case.id,
        case_id=case.case_id,
        status=case.status,
        operational_priority=case.operational_priority,
        time_reported=case.time_reported,
        report=CitizenReportResponse.model_validate(report_obj),
    )


@router.get(
    "/cases/{case_id}",
    response_model=CitizenCaseResponse,
    summary="Get citizen emergency case status",
)
def get_citizen_case_status(
    case_id: str,
    db: Session = Depends(get_db),
):
    """
    Allows a bystander to track the lifecycle status of their reported emergency incident.
    """
    case = get_case_by_identifier(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency case '{case_id}' not found.",
        )

    if not case.citizen_reports:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No citizen report found for case '{case_id}'.",
        )

    report_obj = case.citizen_reports[0]
    return CitizenCaseResponse(
        id=case.id,
        case_id=case.case_id,
        status=case.status,
        operational_priority=case.operational_priority,
        time_reported=case.time_reported,
        report=CitizenReportResponse.model_validate(report_obj),
    )
