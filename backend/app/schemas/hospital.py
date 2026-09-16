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


class HospitalSettingsUpdate(BaseModel):
    operational_status: Optional[str] = Field(None, description="Operational, Degraded, Offline")
    diversion_active: Optional[bool] = Field(None, description="Global facility diversion status")
    active_surge_level: Optional[str] = Field(None, description="Normal, Medium, High, Disaster")
    total_bays: Optional[int] = Field(None, ge=1)
    available_bays: Optional[int] = Field(None, ge=0)


class HospitalBayAllocationRequest(BaseModel):
    bay_id: str = Field(..., description="Unique ID or name of the bay/resuscitation unit")
    allocated_by: str = Field("ED Coordinator", description="Name of the hospital staff member")
    notes: Optional[str] = Field(None, description="Clinical staging remarks")


class HospitalReadinessChecklistUpdateRequest(BaseModel):
    checklist_item: str = Field(..., description="e.g. Trauma Team Alerted, Resus Bay Prepared, Blood Bank Standby, Cath-Lab Specialist Paged")
    is_completed: bool = Field(..., description="Completion state of the readiness item")
    updated_by: str = Field("ED Coordinator", description="Name of the hospital staff member")
    notes: Optional[str] = Field(None, description="Optional notes")

