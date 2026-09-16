from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional


class EMSVerificationCreate(BaseModel):
    consciousness: str = Field(..., description="Responding, Not responding, Unable to assess")
    breathing: str = Field(..., description="Normal, Abnormal, Unable to assess")
    bleeding: str = Field(..., description="Present, Not present, Unable to assess")
    airway: str = Field(..., description="Patent, Compromised, Maintained with Adjunct, Unable to assess")
    clinical_notes: Optional[str] = Field(None, description="Paramedic on-scene remarks and administered interventions")
    verified_by: str = Field("Paramedic Team Alpha", description="Name/ID of verifying paramedic")


class EMSVerificationResponse(BaseModel):
    id: str
    case_id: str
    consciousness: str
    breathing: str
    bleeding: str
    airway: str
    clinical_notes: Optional[str] = None
    verified_by: str
    verified_at: datetime
    source: str = "EMS_VERIFIED"

    model_config = ConfigDict(from_attributes=True)


class EMSVitalsCreate(BaseModel):
    heart_rate: int = Field(..., ge=20, le=300, description="Heart rate in bpm")
    systolic_bp: int = Field(..., ge=30, le=300, description="Systolic blood pressure in mmHg")
    diastolic_bp: int = Field(..., ge=20, le=200, description="Diastolic blood pressure in mmHg")
    oxygen_saturation: int = Field(..., ge=40, le=100, description="Oxygen saturation SpO2 %")
    respiratory_rate: int = Field(..., ge=4, le=80, description="Breaths per minute")
    temperature: float = Field(..., ge=30.0, le=45.0, description="Body temperature in Celsius")
    gcs: int = Field(..., ge=3, le=15, description="Glasgow Coma Scale total score (3-15)")
    pain_score: Optional[int] = Field(None, ge=0, le=10, description="Numeric pain score (0-10)")
    blood_glucose: Optional[int] = Field(None, description="Blood glucose level in mg/dL")
    recorded_by: str = Field("Paramedic Team Alpha", description="Paramedic recorder identifier")


class EMSVitalsResponse(BaseModel):
    id: str
    case_id: str
    heart_rate: int
    systolic_bp: int
    diastolic_bp: int
    oxygen_saturation: int
    respiratory_rate: int
    temperature: float
    gcs: int
    pain_score: Optional[int] = None
    blood_glucose: Optional[int] = None
    recorded_by: str
    recorded_at: datetime
    is_verified: bool = True
    source: str = "EMS_VERIFIED"

    model_config = ConfigDict(from_attributes=True)


class EMSTransportStatusUpdate(BaseModel):
    status: str = Field(..., description="Transport status to transition to")
    updated_by: Optional[str] = Field("Paramedic Team Alpha", description="Paramedic or dispatcher actor")


class EMSHandoverCompleteRequest(BaseModel):
    receiving_staff: str = Field(..., description="Name of receiving emergency department clinician / nurse")
    notes: Optional[str] = Field(None, description="Bedside sign-off clinical summary notes")
