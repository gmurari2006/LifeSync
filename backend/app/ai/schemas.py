from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal


class AIStructuredEmergencyInfo(BaseModel):
    """
    Standardized schema for AI-structured emergency information extracted from citizen bystander language.
    Strictly segregated with source: AI_STRUCTURED.
    Assists human EMS and hospital staff with structured summarization; NOT a clinical diagnosis.
    """
    id: Optional[str] = None
    case_id: str = Field(..., description="Foreign key UUID or human ID of the EmergencyCase")
    citizen_report_id: Optional[str] = Field(None, description="UUID of the CitizenReport that was structured")

    incident_summary: str = Field(..., description="Objective, neutral summary of bystander observations")
    incident_category: str = Field(..., description="Standardized emergency category")
    people_count: int = Field(1, ge=1, description="Estimated number of affected individuals")

    consciousness: str = Field("Uncertain", description="Extracted consciousness indicator: Responding, Unresponsive, Uncertain, Not Stated")
    breathing: str = Field("Uncertain", description="Extracted breathing indicator: Normal, Difficulty Breathing, Uncertain, Not Stated")
    visible_concerns: List[str] = Field(default_factory=list, description="Observed clinical concerns and scene hazards")
    location_summary: str = Field(..., description="Extracted location address and landmark information")

    extracted_keywords: List[str] = Field(default_factory=list, description="Key observational terms identified in citizen narrative")
    uncertainty_flags: List[str] = Field(default_factory=list, description="Explicit flags for unconfirmed or ambiguous statements")
    missing_information: List[str] = Field(default_factory=list, description="Key triage parameters not provided in citizen report")

    confidence_score: float = Field(0.85, ge=0.0, le=1.0, description="Model extraction fidelity confidence (NOT clinical certainty)")
    source: Literal["AI_STRUCTURED"] = "AI_STRUCTURED"

    model_name: str = Field("lifesync-nlp-local-v1", description="Identifier of the structuring model/provider")
    model_version: str = Field("1.2.0", description="Version string of the structuring model")
    prompt_version: str = Field("v1.2", description="Prompt template version used")
    status: str = Field("COMPLETED", description="Structuring execution status: COMPLETED, PENDING, FAILED")

    generated_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of structuring generation")

    model_config = ConfigDict(from_attributes=True)


class AIStructuringRequest(BaseModel):
    """
    Optional parameters when requesting or re-running AI information structuring.
    """
    force_reprocess: bool = Field(False, description="Whether to re-extract and create a new structured version")
    additional_context: Optional[str] = Field(None, description="Optional dispatcher or operator supplementary context")


class AIStructuringResponse(BaseModel):
    """
    Standard API response containing AI-structured emergency info.
    """
    case_id: str
    status: str
    ai_structured_info: Optional[AIStructuredEmergencyInfo] = None
    message: str = "AI information structuring completed successfully."


class AIStructuringHistoryResponse(BaseModel):
    """
    Versioned history of AI structuring executions for a case.
    """
    case_id: str
    total_versions: int
    reports: List[AIStructuredEmergencyInfo] = []
