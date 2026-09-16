from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class AlertEscalationStatus(BaseModel):
    """
    Status of an unacknowledged emergency alert for a specific hospital case.
    """
    case_id: str
    hospital_id: str
    alert_timestamp: datetime
    elapsed_seconds: float
    escalation_tier: str  # TIER_0_NORMAL, TIER_1_VISUAL, TIER_2_PUSH, TIER_3_DISPATCH
    tier_label: str
    is_escalated: bool
    requires_audible_chime: bool
    requires_dispatch_alert: bool
    acknowledged: bool


class HospitalAlertEscalationsResponse(BaseModel):
    """
    Summary of all active alert escalations for a hospital emergency department.
    """
    hospital_id: str
    timestamp: datetime
    total_unacknowledged_alerts: int
    escalated_count: int
    alerts: List[AlertEscalationStatus]
