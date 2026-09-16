from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List


class CitizenReportCreate(BaseModel):
    """
    Schema for citizen bystander emergency report intake.
    """
    incident_category: str = Field(..., description="Selected category of emergency incident")
    people_count: int = Field(1, ge=1, description="Estimated number of individuals requiring assistance")
    has_unconscious: str = Field("No", description="Unconscious or non-responsive indicator")
    is_awake: str = Field("Yes", description="Person awake and responsive indicator")
    is_breathing: str = Field("Yes", description="Person breathing normally indicator")
    visible_concerns: List[str] = Field(default_factory=list, description="List of observed concerns")
    location_address: str = Field(..., description="Street or area address")
    location_landmark: Optional[str] = Field(None, description="Nearby prominent landmark")
    latitude: Optional[float] = Field(None, description="Simulated latitude coordinate")
    longitude: Optional[float] = Field(None, description="Simulated longitude coordinate")
    additional_notes: Optional[str] = Field(None, description="Optional bystander scene remarks")


class CitizenReportResponse(BaseModel):
    id: str
    case_id: str
    incident_category: str
    people_count: int
    has_unconscious: str
    is_awake: str
    is_breathing: str
    visible_concerns: List[str]
    location_address: str
    location_landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    additional_notes: Optional[str] = None
    source: str = "CITIZEN_REPORTED"
    reported_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CitizenCaseResponse(BaseModel):
    id: str
    case_id: str
    status: str
    operational_priority: str
    time_reported: datetime
    report: CitizenReportResponse

    model_config = ConfigDict(from_attributes=True)
