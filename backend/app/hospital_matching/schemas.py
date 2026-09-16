from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal


class HospitalMatchCandidate(BaseModel):
    """
    Evaluated hospital candidate representation with explainable scoring breakdown.
    """
    hospital_id: str
    hospital_name: str
    short_name: Optional[str] = None
    trauma_level: Optional[str] = None
    operational_status: str
    diversion_active: bool
    active_surge_level: Optional[str] = "Normal"
    
    is_eligible: bool
    exclusion_reasons: List[str] = Field(default_factory=list)
    
    suitability_score: float = Field(0.0, ge=0.0, le=1.0, description="Normalized score: 0.40*Capability + 0.35*ETA + 0.25*Capacity")
    capability_score: float = Field(0.0, ge=0.0, le=1.0)
    eta_score: float = Field(0.0, ge=0.0, le=1.0)
    capacity_score: float = Field(0.0, ge=0.0, le=1.0)
    
    distance_km: float
    eta_minutes: int
    available_bays: int
    total_bays: int
    
    capabilities: List[Dict[str, Any]] = Field(default_factory=list)
    explanation: str = Field(..., description="Deterministic plain-text explanation of ranking or exclusion")
    rank: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class HospitalMatchingResult(BaseModel):
    """
    Matching calculation response with ranked candidates and human confirmation status.
    """
    id: Optional[str] = None
    case_id: str
    current_destination_id: Optional[str] = None
    recommended_hospital_id: Optional[str] = None
    confirmed_destination_id: Optional[str] = None
    
    recommendation_label: str = "System Recommendation — Final destination requires authorized human confirmation."
    status: Literal[
        "MATCHING_CALCULATED",
        "RECOMMENDATION_PRESENTED",
        "HUMAN_CONFIRMED",
        "REJECTION_RECORDED",
        "DIVERSION_RECORDED",
    ] = "RECOMMENDATION_PRESENTED"
    
    candidates: List[HospitalMatchCandidate] = Field(default_factory=list)
    generated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)


class DestinationConfirmRequest(BaseModel):
    """
    Request payload when an authorized human confirms a destination hospital.
    """
    hospital_id: str = Field(..., description="ID of the hospital confirmed as final destination")
    actor_name: str = Field("Marcus Reed (Paramedic Lead)", description="Name of the confirming user")
    actor_role: Literal["EMS_PARAMEDIC", "ED_COORDINATOR", "REGIONAL_DISPATCHER"] = "EMS_PARAMEDIC"
    notes: Optional[str] = Field(None, description="Optional clinical/operational confirmation notes")


class DestinationRejectRequest(BaseModel):
    """
    Request payload when an authorized human rejects a recommended destination.
    """
    hospital_id: str = Field(..., description="ID of the rejected hospital")
    reason_code: Literal[
        "NO_SPECIALTY_AVAILABLE",
        "MAXIMUM_SURGE_CAPACITY",
        "CT_CATH_LAB_OFFLINE",
        "TRAUMA_TEAM_COMMITTED",
        "CLINICAL_PREFERENCE",
        "OTHER",
    ] = Field(..., description="Standardized rejection reason code")
    reason_description: Optional[str] = Field(None, description="Mandatory text explanation if reason_code is OTHER")
    actor_name: str = Field("Marcus Reed (Paramedic Lead)", description="Name of the rejecting user")
    actor_role: Literal["EMS_PARAMEDIC", "ED_COORDINATOR", "REGIONAL_DISPATCHER"] = "EMS_PARAMEDIC"


class HospitalDivertRequest(BaseModel):
    """
    Request payload when a hospital ED coordinator requests diversion for an inbound emergency.
    """
    hospital_id: str = Field(..., description="ID of the hospital initiating diversion")
    reason_code: Literal[
        "NO_SPECIALTY_AVAILABLE",
        "MAXIMUM_SURGE_CAPACITY",
        "CT_CATH_LAB_OFFLINE",
        "TRAUMA_TEAM_COMMITTED",
        "ED_GRIDLOCK",
        "OTHER",
    ] = Field(..., description="Standardized diversion reason code")
    reason_description: Optional[str] = Field(None, description="Mandatory text explanation if reason_code is OTHER")
    actor_name: str = Field("Dr. Sarah Jenkins", description="Name of the hospital coordinator")
    actor_role: Literal["ED_COORDINATOR", "HOSPITAL_PHYSICIAN", "HOSPITAL_ADMIN"] = "ED_COORDINATOR"


class HospitalDecisionLogItem(BaseModel):
    """
    Log record of a destination decision action.
    """
    id: str
    case_id: str
    hospital_id: str
    decision_type: str
    reason_code: Optional[str] = None
    reason_description: Optional[str] = None
    actor_name: str
    actor_role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HospitalMatchingHistoryResponse(BaseModel):
    """
    History of matching runs and human decision actions for an emergency case.
    """
    case_id: str
    current_destination_id: Optional[str] = None
    total_matching_runs: int
    matching_runs: List[HospitalMatchingResult] = Field(default_factory=list)
    decision_logs: List[HospitalDecisionLogItem] = Field(default_factory=list)
