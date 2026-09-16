from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.override import HumanOverrideRequest, HumanOverrideResponse
from app.services.override_service import override_service

router = APIRouter()


@router.post(
    "/{case_id}/override",
    response_model=HumanOverrideResponse,
    summary="Execute field-level human override with role authorization",
)
def execute_human_override(
    case_id: str,
    override_request: HumanOverrideRequest,
    x_actor_role: str = Header("EMS_PARAMEDIC", alias="X-Actor-Role", description="Authenticated actor role"),
    x_actor_id: str = Header("USER-DEFAULT-01", alias="X-Actor-Id", description="Authenticated actor ID"),
    x_actor_name: str = Header("Authorized Clinician", alias="X-Actor-Name", description="Authenticated actor name"),
    db: Session = Depends(get_db),
):
    """
    Execute a structured human override for Acuity Priority, Destination Hospital, or Ambulance Class.
    Actor credentials and role are derived server-side from headers/session context.
    """
    try:
        response = override_service.apply_override(
            db=db,
            case_identifier=case_id,
            request=override_request,
            actor_user_id=x_actor_id,
            actor_name=x_actor_name,
            actor_role=x_actor_role,
        )
        return response
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY if "reason code" in str(e).lower() or "justification" in str(e).lower() else status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
