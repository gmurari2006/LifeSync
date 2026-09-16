from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class HumanOverrideRequest(BaseModel):
    """
    Standardized payload for executing a human override.
    Note: actor_user_id and actor_role are determined server-side from headers/session.
    """
    parameter_overridden: str = Field(
        ...,
        description="Property being overridden: OPERATIONAL_PRIORITY, DESTINATION_HOSPITAL, or AMBULANCE_CLASS",
    )
    new_value: str = Field(
        ...,
        description="New overridden value (e.g. Critical, High, HOSP-APEX-01, ALS)",
    )
    reason_code: str = Field(
        ...,
        description="Standardized reason code from PRD Section 11/15",
    )
    free_text_justification: str = Field(
        ...,
        min_length=3,
        description="Mandatory clinical or operational justification note",
    )


class HumanOverrideResponse(BaseModel):
    """
    Response returned upon successful execution and audit recording of a human override.
    """
    override_id: str
    case_id: str
    parameter_overridden: str
    original_value: Optional[str] = None
    new_value: str
    reason_code: str
    free_text_justification: str
    actor_user_id: str
    actor_name: str
    actor_role: str
    timestamp: datetime
    status: str = "OVERRIDE_RECORDED"
