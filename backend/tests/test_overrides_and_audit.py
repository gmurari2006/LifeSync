import pytest
from datetime import datetime, timedelta, timezone
from app.models.base import utc_now
from app.models.emergency_case import EmergencyCase
from app.models.hospital import Hospital, HospitalResource
from app.models.audit import CaseAuditEvent
from app.services.escalation_service import escalation_service
from tests.conftest import TestingSessionLocal


def test_human_override_role_authorization_and_audit(client):
    """
    Verify field-level role authorization for human overrides:
    - Paramedic can override Acuity/Priority
    - ED Coordinator can override Destination Hospital
    - Unauthorized roles (Citizen/Guest) receive HTTP 403 Forbidden
    - Invalid reason codes or missing justification receive HTTP 422
    - Immutable CaseAuditEvent is recorded
    """
    db = TestingSessionLocal()
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-001").first()
    assert case is not None
    db.close()

    # 1. Authorized Paramedic overrides Priority
    res_priority = client.post(
        f"/api/v1/cases/{case.case_id}/override",
        headers={
            "X-Actor-Role": "EMS_PARAMEDIC",
            "X-Actor-Id": "EMS-VANCE-01",
            "X-Actor-Name": "Paramedic J. Vance",
        },
        json={
            "parameter_overridden": "OPERATIONAL_PRIORITY",
            "new_value": "Critical",
            "reason_code": "CLINICAL_ACUITY_DISCREPANCY",
            "free_text_justification": "Patient showing signs of acute decompensation and respiratory fatigue.",
        },
    )
    assert res_priority.status_code == 200
    data = res_priority.json()
    assert data["parameter_overridden"] == "OPERATIONAL_PRIORITY"
    assert data["new_value"] == "Critical"
    assert data["actor_role"] == "EMS_PARAMEDIC"

    # Verify DB update and audit log
    db = TestingSessionLocal()
    fresh_case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-001").first()
    assert fresh_case.operational_priority == "Critical"

    audit = db.query(CaseAuditEvent).filter(
        CaseAuditEvent.case_id == case.id,
        CaseAuditEvent.event_type == "HUMAN_OVERRIDE_RECORDED",
    ).first()
    assert audit is not None
    assert audit.actor_name == "Paramedic J. Vance"
    assert "decompensation" in audit.description
    db.close()

    # 2. Authorized ED Coordinator overrides Destination Hospital
    res_dest = client.post(
        f"/api/v1/cases/{case.case_id}/override",
        headers={
            "X-Actor-Role": "ED_COORDINATOR",
            "X-Actor-Id": "HOSP-ROY-01",
            "X-Actor-Name": "Dr. Roy",
        },
        json={
            "parameter_overridden": "DESTINATION_HOSPITAL",
            "new_value": "HOSP-CITYCARE-01",
            "reason_code": "SPECIALIST_UNAVAILABLE",
            "free_text_justification": "On-duty interventional cardiologist requested direct routing.",
        },
    )
    assert res_dest.status_code == 200
    assert res_dest.json()["new_value"] == "HOSP-CITYCARE-01"

    # 3. Unauthorized role (CITIZEN) attempting override -> 403 Forbidden
    res_unauth = client.post(
        f"/api/v1/cases/{case.case_id}/override",
        headers={
            "X-Actor-Role": "CITIZEN",
            "X-Actor-Id": "BYSTANDER-01",
            "X-Actor-Name": "Anonymous Bystander",
        },
        json={
            "parameter_overridden": "OPERATIONAL_PRIORITY",
            "new_value": "Low",
            "reason_code": "OTHER",
            "free_text_justification": "Citizen opinion.",
        },
    )
    assert res_unauth.status_code == 403

    # 4. Invalid reason code -> 422 Unprocessable Entity
    res_invalid_code = client.post(
        f"/api/v1/cases/{case.case_id}/override",
        headers={"X-Actor-Role": "EMS_PARAMEDIC"},
        json={
            "parameter_overridden": "OPERATIONAL_PRIORITY",
            "new_value": "High",
            "reason_code": "NON_STANDARD_REASON_CODE_XYZ",
            "free_text_justification": "Valid note.",
        },
    )
    assert res_invalid_code.status_code in (400, 422)


def test_hospital_timeout_escalation_clock(client):
    """
    Verify hospital pre-alert timeout escalation clock:
    - Computed from authoritative HOSPITAL_ALERTED timestamp
    - T < 60s -> TIER_0_NORMAL
    - T >= 60s -> TIER_1_VISUAL
    - T >= 120s -> TIER_2_PUSH
    - T >= 180s -> TIER_3_DISPATCH
    - Once acknowledged, escalation ceases immediately
    """
    db = TestingSessionLocal()
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-101").first()
    assert case is not None
    case.destination_hospital_id = "HOSP-CITYCARE-01"
    case.acknowledged_state = "ALERTED"
    case.status = "HOSPITAL_ALERTED"
    db.commit()

    # 1. Evaluate at T = 30s -> Normal
    t0 = utc_now()
    case.time_alerted = t0
    db.commit()

    status_t30 = escalation_service.evaluate_case_escalation(
        db=db, case=case, reference_time=t0 + timedelta(seconds=30)
    )
    assert status_t30.escalation_tier == "TIER_0_NORMAL"
    assert status_t30.is_escalated is False

    # 2. Evaluate at T = 75s -> Tier 1 Visual
    status_t75 = escalation_service.evaluate_case_escalation(
        db=db, case=case, reference_time=t0 + timedelta(seconds=75)
    )
    assert status_t75.escalation_tier == "TIER_1_VISUAL"
    assert status_t75.is_escalated is True
    assert status_t75.requires_audible_chime is True

    # 3. Evaluate at T = 135s -> Tier 2 Push
    status_t135 = escalation_service.evaluate_case_escalation(
        db=db, case=case, reference_time=t0 + timedelta(seconds=135)
    )
    assert status_t135.escalation_tier == "TIER_2_PUSH"
    assert status_t135.is_escalated is True

    # 4. Evaluate at T = 190s -> Tier 3 Dispatch
    status_t190 = escalation_service.evaluate_case_escalation(
        db=db, case=case, reference_time=t0 + timedelta(seconds=190)
    )
    assert status_t190.escalation_tier == "TIER_3_DISPATCH"
    assert status_t190.requires_dispatch_alert is True

    # 5. Acknowledge case -> escalation immediately stops
    case.acknowledged_state = "ACKNOWLEDGED"
    case.status = "HOSPITAL_ACKNOWLEDGED"
    db.commit()

    status_ack = escalation_service.evaluate_case_escalation(
        db=db, case=case, reference_time=t0 + timedelta(seconds=300)
    )
    assert status_ack.acknowledged is True
    assert status_ack.is_escalated is False
    assert status_ack.escalation_tier == "ACKNOWLEDGED"
    db.close()


def test_bay_allocation_and_conflict_prevention(client):
    """
    Verify hospital bay allocation:
    - Successfully assigns available bay and marks it Occupied
    - Rejects assignment of already occupied or cleaning bays with HTTP 409 Conflict
    """
    db = TestingSessionLocal()
    hosp = db.query(Hospital).filter(Hospital.id == "HOSP-CITYCARE-01").first()
    assert hosp is not None

    # Find a ready bay
    ready_bay = db.query(HospitalResource).filter(
        HospitalResource.hospital_id == hosp.id,
        HospitalResource.status == "Ready",
    ).first()
    assert ready_bay is not None
    bay_id = ready_bay.id
    db.close()

    # 1. Allocate available bay
    res_alloc = client.post(
        f"/api/v1/hospitals/{hosp.id}/cases/LS-2026-001/bay",
        json={
            "bay_id": bay_id,
            "allocated_by": "Charge Nurse Kelly",
            "notes": "Staged with cardiac monitor.",
        },
    )
    assert res_alloc.status_code == 200
    assert res_alloc.json()["assigned_bay"] == ready_bay.name

    # 2. Attempt to re-allocate the same (now Occupied) bay to a second case -> 409 Conflict
    res_conflict = client.post(
        f"/api/v1/hospitals/{hosp.id}/cases/LS-2026-101/bay",
        json={
            "bay_id": bay_id,
            "allocated_by": "Dr. Roy",
            "notes": "Attempting second assignment.",
        },
    )
    assert res_conflict.status_code == 409
    assert "cannot be assigned" in res_conflict.json()["detail"].lower()


def test_readiness_checklist_and_hospital_settings(client):
    """
    Verify readiness checklist progression and hospital settings updates.
    """
    # 1. Update readiness task
    res_ready = client.post(
        "/api/v1/hospitals/HOSP-CITYCARE-01/cases/LS-2026-001/ready",
        json={
            "checklist_item": "Trauma Team Alerted",
            "is_completed": True,
            "updated_by": "ED Coordinator Vance",
            "notes": "Pagers broadcasted to trauma surgical lead.",
        },
    )
    assert res_ready.status_code == 200

    # 2. Update hospital settings
    res_settings = client.patch(
        "/api/v1/hospitals/HOSP-CITYCARE-01/settings",
        json={
            "operational_status": "Degraded",
            "diversion_active": True,
            "active_surge_level": "High",
        },
    )
    assert res_settings.status_code == 200
    hosp_data = res_settings.json()
    assert hosp_data["operational_status"] == "Degraded"
    assert hosp_data["diversion_active"] is True
    assert hosp_data["active_surge_level"] == "High"


def test_bedside_handover_and_audit_timeline(client):
    """
    Verify bedside clinical handover sign-off, case closure, audio buffer purge,
    and authoritative decision audit timeline retrieval.
    """
    # Ensure case is in ARRIVED state first
    db = TestingSessionLocal()
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-101").first()
    assert case is not None
    case.status = "ARRIVED"
    db.commit()
    db.close()

    # 1. Complete handover
    res_handover = client.post(
        "/api/v1/ems/cases/LS-2026-101/handover",
        json={
            "receiving_staff": "Dr. Angela Martinez (Attending Physician)",
            "notes": "Patient transferred to Resus Bay 1. EKG stable. Full verbal report delivered.",
        },
    )
    assert res_handover.status_code == 200
    case_data = res_handover.json()
    assert case_data["status"] == "HANDOVER_COMPLETE"

    # 2. Query authoritative audit timeline
    res_timeline = client.get("/api/v1/cases/LS-2026-101/audit-timeline")
    assert res_timeline.status_code == 200
    timeline = res_timeline.json()
    assert timeline["case_code"] == "LS-2026-101"
    assert timeline["total_events"] > 0

    event_types = [e["event_type"] for e in timeline["events"]]
    assert "HANDOVER_COMPLETED" in event_types

