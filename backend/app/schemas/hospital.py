from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any


class HospitalResourceResponse(BaseModel):
    id: str
    hospital_id: str
    name: str
    category: str
    status: str
    total_capacity: int
    available_capacity: int
    assigned_case_id: Optional[str] = None
    location: str
    notes: Optional[str] = None
    last_updated: str

    model_config = ConfigDict(from_attributes=True)


class HospitalResourceUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Ready, Limited, Occupied, Unavailable")
    available_capacity: Optional[int] = Field(None, ge=0)
    assigned_case_id: Optional[str] = None
    notes: Optional[str] = None


class HospitalResponse(BaseModel):
    id: str
    name: str
    short_name: str
    trauma_level: str
    operational_status: str
    diversion_active: bool
    active_surge_level: str
    total_bays: int
    available_bays: int
    coordinator_name: str
    coordinator_role: str
    phone: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capabilities: List[Dict[str, Any]] = []

    model_config = ConfigDict(from_attributes=True)


class HospitalAcknowledgeRequest(BaseModel):
    assigned_bay: Optional[str] = Field(None, description="Designated resuscitation or emergency bay ID/name")
    acknowledged_by: str = Field("Dr. Sarah Jenkins (ED Lead)", description="Coordinator or clinician name")
    notes: Optional[str] = Field(None, description="Staging remarks")


class HospitalDivertRequest(BaseModel):
    divert_reason_code: str = Field(..., description="Mandatory reason code (e.g. SURGE_CAPACITY, CT_UNAVAILABLE, CATH_LAB_OCCUPIED)")
    divert_notes: Optional[str] = Field(None, description="Detailed diversion justification")
    diverted_by: str = Field("Dr. Sarah Jenkins (ED Lead)", description="ED Lead authorizer")
