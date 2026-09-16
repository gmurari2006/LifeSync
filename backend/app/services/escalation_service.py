from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.emergency_case import EmergencyCase
from app.models.audit import CaseAuditEvent
from app.models.base import utc_now
from app.schemas.escalation import AlertEscalationStatus, HospitalAlertEscalationsResponse


class HospitalEscalationService:
    """
    Evaluates hospital alert timeouts and multi-tier escalations strictly
    based on the authoritative HOSPITAL_ALERTED pre-alert dispatch timestamp.
    Escalation immediately stops once the hospital acknowledges.
    """

    def get_alert_timestamp(self, db: Session, case: EmergencyCase) -> datetime:
        """
        Extract authoritative pre-alert dispatch timestamp from audit logs or case record.
        """
        # 1. Search for HOSPITAL_ALERTED audit event
        alert_event = (
            db.query(CaseAuditEvent)
            .filter(
                CaseAuditEvent.case_id == case.id,
                CaseAuditEvent.event_type.in_(["HOSPITAL_ALERTED", "PRE_ARRIVAL_ALERT_SENT"]),
            )
            .order_by(CaseAuditEvent.timestamp.asc())
            .first()
        )
        if alert_event and alert_event.timestamp:
            return alert_event.timestamp

        # 2. Fallback to time_alerted or time_reported
        if case.time_alerted:
            return case.time_alerted
        if case.time_reported:
            return case.time_reported
        return utc_now()

    def evaluate_case_escalation(
        self,
        db: Session,
        case: EmergencyCase,
        reference_time: Optional[datetime] = None,
    ) -> AlertEscalationStatus:
        now = reference_time or utc_now()
        alert_time = self.get_alert_timestamp(db, case)

        # Make both timezone-aware or naive for subtraction safety
        if alert_time.tzinfo is None and now.tzinfo is not None:
            alert_time = alert_time.replace(tzinfo=timezone.utc)
        elif alert_time.tzinfo is not None and now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)

        elapsed_seconds = max(0.0, (now - alert_time).total_seconds())

        is_acknowledged = (
            case.acknowledged_state == "ACKNOWLEDGED"
            or case.status in (
                "HOSPITAL_ACKNOWLEDGED",
                "BAY_ASSIGNED",
                "ARRIVED",
                "HANDOVER_COMPLETE",
                "CLOSED",
                "DIVERTED",
            )
        )

        if is_acknowledged:
            return AlertEscalationStatus(
                case_id=case.case_id,
                hospital_id=case.destination_hospital_id or "UNASSIGNED",
                alert_timestamp=alert_time,
                elapsed_seconds=elapsed_seconds,
                escalation_tier="ACKNOWLEDGED",
                tier_label="Alert Acknowledged",
                is_escalated=False,
                requires_audible_chime=False,
                requires_dispatch_alert=False,
                acknowledged=True,
            )

        # Determine escalation tier based on unacknowledged elapsed time
        if elapsed_seconds < 60.0:
            tier = "TIER_0_NORMAL"
            label = "Normal Alert (< 60s)"
            is_escalated = False
            audible = False
            dispatch_alert = False
        elif elapsed_seconds < 120.0:
            tier = "TIER_1_VISUAL"
            label = "Tier 1: Visual Pulsing Alert (60s+ unacknowledged)"
            is_escalated = True
            audible = True
            dispatch_alert = False
        elif elapsed_seconds < 180.0:
            tier = "TIER_2_PUSH"
            label = "Tier 2: Coordinator Escalation Warning (120s+ unacknowledged)"
            is_escalated = True
            audible = True
            dispatch_alert = False
        else:
            tier = "TIER_3_DISPATCH"
            label = "Tier 3: Regional Dispatch Escalation (180s+ unacknowledged)"
            is_escalated = True
            audible = True
            dispatch_alert = True

        return AlertEscalationStatus(
            case_id=case.case_id,
            hospital_id=case.destination_hospital_id or "UNASSIGNED",
            alert_timestamp=alert_time,
            elapsed_seconds=elapsed_seconds,
            escalation_tier=tier,
            tier_label=label,
            is_escalated=is_escalated,
            requires_audible_chime=audible,
            requires_dispatch_alert=dispatch_alert,
            acknowledged=False,
        )

    def list_hospital_escalations(
        self,
        db: Session,
        hospital_id: str,
        reference_time: Optional[datetime] = None,
    ) -> HospitalAlertEscalationsResponse:
        now = reference_time or utc_now()
        cases = (
            db.query(EmergencyCase)
            .filter(EmergencyCase.destination_hospital_id == hospital_id)
            .all()
        )

        alert_statuses: List[AlertEscalationStatus] = []
        for c in cases:
            status = self.evaluate_case_escalation(db, c, reference_time=now)
            if not status.acknowledged:
                alert_statuses.append(status)

        escalated_count = sum(1 for a in alert_statuses if a.is_escalated)

        return HospitalAlertEscalationsResponse(
            hospital_id=hospital_id,
            timestamp=now,
            total_unacknowledged_alerts=len(alert_statuses),
            escalated_count=escalated_count,
            alerts=alert_statuses,
        )


escalation_service = HospitalEscalationService()
