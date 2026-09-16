from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.ai.service import AIService
from app.ai.schemas import (
    AIStructuredEmergencyInfo,
    AIStructuringRequest,
    AIStructuringResponse,
    AIStructuringHistoryResponse,
)

router = APIRouter()
ai_service = AIService()


@router.post(
    "/cases/{case_id}/structure",
    response_model=AIStructuringResponse,
    summary="Trigger AI structuring of citizen report for emergency case",
)
async def structure_case(
    case_id: str,
    payload: Optional[AIStructuringRequest] = None,
    db: Session = Depends(get_db),
):
    force_reprocess = payload.force_reprocess if payload else False
    additional_context = payload.additional_context if payload else None

    try:
        report = await ai_service.structure_case_report(
            db=db,
            case_id_or_uuid=case_id,
            force_reprocess=force_reprocess,
            additional_context=additional_context,
        )
        return AIStructuringResponse(
            case_id=case_id,
            status="SUCCESS",
            ai_structured_info=AIStructuredEmergencyInfo.model_validate(report),
            message="AI information structuring completed successfully.",
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Structuring failed: {str(e)}")


@router.get(
    "/cases/{case_id}",
    response_model=AIStructuredEmergencyInfo,
    summary="Get latest AI-structured report for emergency case",
)
def get_latest_ai_report(
    case_id: str,
    db: Session = Depends(get_db),
):
    report = ai_service.get_latest_report(db, case_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No AI structured report found for case '{case_id}'.",
        )
    return AIStructuredEmergencyInfo.model_validate(report)


@router.get(
    "/cases/{case_id}/history",
    response_model=AIStructuringHistoryResponse,
    summary="Get versioned history of AI structuring for emergency case",
)
def get_ai_report_history(
    case_id: str,
    db: Session = Depends(get_db),
):
    reports = ai_service.get_report_history(db, case_id)
    return AIStructuringHistoryResponse(
        case_id=case_id,
        total_versions=len(reports),
        reports=[AIStructuredEmergencyInfo.model_validate(r) for r in reports],
    )
