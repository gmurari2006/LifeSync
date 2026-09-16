from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Any
from app.schemas.citizen import CitizenReportResponse
from app.schemas.ems import EMSVerificationResponse, EMSVitalsResponse
from app.schemas.audit import TimelineEventResponse


class CaseCreate(BaseModel):
    incident_type: str = Field(..., description="Nature of emergency incident")
    operational_priority: str = Field("HIGH", description="CRITICAL, HIGH, MODERATE, LOW")
    patient_count: int = Field(1, ge=1)
    patient_age: Optional[int] = Field(None, ge=0, le=130)
    patient_sex: Optional[str] = Field(None, description="Male, Female, Unknown")
    reported_location: str
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    destination_hospital_id: Optional[str] = None
    assigned_unit_id: Optional[str] = None


class CaseStatusUpdate(BaseModel):
    status: str = Field(..., description="Target lifecycle state to transition to")
    actor_type: str = Field("EMS", description="CITIZEN, EMS, HOSPITAL, SYSTEM")
    actor_name: str = Field("Paramedic Team Alpha", description="Name/title of acting human or system component")
    notes: Optional[str] = Field(None, description="Audit transition notes")


class CaseDetailResponse(BaseModel):
    id: str
    case_id: str
    incident_type: str
    operational_priority: str
    status: str
    patient_count: int
    patient_age: Optional[int] = None
    patient_sex: Optional[str] = None
    reported_location: str
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    destination_hospital_id: Optional[str] = None
    assigned_unit_id: Optional[str] = None
    assigned_bay: Optional[str] = None
    acknowledged_state: Optional[str] = None
    time_reported: datetime
    time_alerted: Optional[datetime] = None
    time_acknowledged: Optional[datetime] = None
    time_arrived: Optional[datetime] = None
    time_closed: Optional[datetime] = None

    citizen_reports: List[CitizenReportResponse] = []
    ems_verifications: List[EMSVerificationResponse] = []
    ems_vitals: List[EMSVitalsResponse] = []
    audit_events: List[TimelineEventResponse] = []

    model_config = ConfigDict(from_attributes=True)


class CaseListResponse(BaseModel):
    total: int
    cases: List[CaseDetailResponse]
