from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class RealtimeEventType(str, Enum):
    """
    LifeSync Real-Time Event Types.
    Strictly delivery-only events representing operational state notifications.
    """
    CASE_CREATED = "CASE_CREATED"
    HOSPITAL_ALERTED = "HOSPITAL_ALERTED"
    HOSPITAL_ACKNOWLEDGED = "HOSPITAL_ACKNOWLEDGED"
    BAY_ASSIGNED = "BAY_ASSIGNED"
    EMS_STATUS_UPDATED = "EMS_STATUS_UPDATED"
    EMS_VITALS_UPDATED = "EMS_VITALS_UPDATED"
    AMBULANCE_POSITION_UPDATED = "AMBULANCE_POSITION_UPDATED"
    ETA_UPDATED = "ETA_UPDATED"
    HOSPITAL_READINESS_UPDATED = "HOSPITAL_READINESS_UPDATED"
    HOSPITAL_DIVERSION_REQUESTED = "HOSPITAL_DIVERSION_REQUESTED"
    DESTINATION_CONFIRMED = "DESTINATION_CONFIRMED"
    CASE_ARRIVED = "CASE_ARRIVED"
    HANDOVER_COMPLETED = "HANDOVER_COMPLETED"


class ProvenanceSource(str, Enum):
    """
    Strict Provenance Source Classifier.
    Prevents cross-contamination of citizen observations, AI extractions,
    paramedic-verified vitals, and simulated telemetry.
    """
    CITIZEN_REPORTED = "CITIZEN_REPORTED"
    AI_STRUCTURED = "AI_STRUCTURED"
    EMS_VERIFIED = "EMS_VERIFIED"
    SIMULATED_TELEMETRY = "SIMULATED_TELEMETRY"
    HOSPITAL_VERIFIED = "HOSPITAL_VERIFIED"
    SYSTEM = "SYSTEM"


class RealtimeEventEnvelope(BaseModel):
    """
    Standardized typed envelope for all real-time WebSocket events.
    Events are delivery-only notifications and do not mutate authoritative database state.
    """
    event_type: RealtimeEventType
    case_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source: ProvenanceSource
    payload: Dict[str, Any] = Field(default_factory=dict)
