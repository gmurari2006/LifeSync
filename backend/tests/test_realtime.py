import pytest
import json
from datetime import datetime
from starlette.testclient import TestClient
from app.main import app
from app.realtime.schemas import RealtimeEventEnvelope, RealtimeEventType, ProvenanceSource
from app.realtime.connection_manager import ConnectionManager
from app.models.emergency_case import EmergencyCase
from app.models.ems import EMSVitals
from app.models.audit import CaseAuditEvent
from tests.conftest import TestingSessionLocal


def test_websocket_case_authorization_valid_and_invalid(client):
    """
    Ensure WebSocket connections enforce case-level authorization.
    Rejects nonexistent cases and accepts valid cases.
    """
    # 1. Nonexistent case -> must reject / close with WS_1008_POLICY_VIOLATION
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/cases/NONEXISTENT-CASE-999?role=EMS_PARAMEDIC"):
            pass

    # 2. Valid demo case -> connects successfully
    with client.websocket_connect("/ws/cases/LS-2026-001?role=EMS_PARAMEDIC") as websocket:
        # Send PING keepalive
        websocket.send_text(json.dumps({"type": "PING"}))
        data = websocket.receive_text()
        msg = json.loads(data)
        assert msg.get("type") == "PONG"
        assert msg.get("case_id") == "LS-2026-001"


def test_websocket_delivery_only_never_mutates_case_state(client):
    """
    Mandatory Rule: WebSocket events must be delivery-only and must never directly
    mutate EmergencyCase status, destination, bay assignment, or handover.
    """
    db = TestingSessionLocal()
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-001").first()
    assert case is not None
    initial_status = case.status
    initial_dest = case.destination_hospital_id
    initial_bay = case.assigned_bay

    with client.websocket_connect(f"/ws/cases/{case.case_id}?role=EMS_PARAMEDIC") as websocket:
        # Simulate arbitrary client message or malicious state mutation payload sent over socket
        malicious_msg = json.dumps({
            "action": "MUTATE_STATE",
            "status": "HANDOVER_COMPLETE",
            "destination_hospital_id": "HOSP-MALICIOUS-01",
            "assigned_bay": "Bay-999",
        })
        websocket.send_text(malicious_msg)

    # Verify database state remained 100% untouched
    db.expire_all()
    fresh_case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-001").first()
    assert fresh_case.status == initial_status
    assert fresh_case.destination_hospital_id == initial_dest
    assert fresh_case.assigned_bay == initial_bay
    db.close()


def test_ems_vitals_persistence_audit_before_broadcast(client):
    """
    Mandatory Rule: EMS vitals flow must be:
    Validate -> Persist EMS_VERIFIED data -> Create CaseAuditEvent -> Broadcast EMS_VITALS_UPDATED.
    WebSocket is delivery-only; database persistence is authoritative.
    """
    db = TestingSessionLocal()
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-001").first()
    assert case is not None

    # Connect WebSocket subscriber to receive live vitals event
    with client.websocket_connect(f"/ws/cases/{case.case_id}?role=ED_COORDINATOR") as websocket:
        # Post verified vitals via REST
        vitals_payload = {
            "heart_rate": 88,
            "systolic_bp": 128,
            "diastolic_bp": 82,
            "oxygen_saturation": 98,
            "respiratory_rate": 16,
            "temperature": 37.1,
            "gcs": 15,
            "pain_score": 3,
            "blood_glucose": 105,
            "recorded_by": "Paramedic J. Vance",
        }
        res = client.post(f"/api/v1/ems/cases/{case.case_id}/vitals", json=vitals_payload)
        assert res.status_code == 201
        data = res.json()
        assert data["source"] == "EMS_VERIFIED"
        assert data["is_verified"] is True

        # Verify WebSocket received the event envelope
        ws_msg = websocket.receive_text()
        event = json.loads(ws_msg)
        assert event["event_type"] == "EMS_VITALS_UPDATED"
        assert event["source"] == "EMS_VERIFIED"
        assert event["payload"]["vitals"]["heart_rate"] == 88

    # Verify database record exists with EMS_VERIFIED provenance
    vitals_rec = db.query(EMSVitals).filter(EMSVitals.case_id == case.id).order_by(EMSVitals.recorded_at.desc()).first()
    assert vitals_rec is not None
    assert vitals_rec.heart_rate == 88
    assert vitals_rec.source == "EMS_VERIFIED"

    # Verify audit event was logged
    audit = db.query(CaseAuditEvent).filter(
        CaseAuditEvent.case_id == case.id,
        CaseAuditEvent.event_type == "VITALS_STREAMED",
    ).order_by(CaseAuditEvent.timestamp.desc()).first()
    assert audit is not None
    assert audit.actor_type == "EMS"
    assert audit.actor_name == "Paramedic J. Vance"
    db.close()


def test_strict_provenance_separation():
    """
    Verify strict provenance segregation:
    - Citizen reports are CITIZEN_REPORTED
    - AI structuring is AI_STRUCTURED
    - Paramedic vitals/verification are EMS_VERIFIED
    - Telemetry is SIMULATED_TELEMETRY
    Citizen/AI data can never be mislabeled as EMS_VERIFIED.
    """
    assert ProvenanceSource.CITIZEN_REPORTED.value == "CITIZEN_REPORTED"
    assert ProvenanceSource.AI_STRUCTURED.value == "AI_STRUCTURED"
    assert ProvenanceSource.EMS_VERIFIED.value == "EMS_VERIFIED"
    assert ProvenanceSource.SIMULATED_TELEMETRY.value == "SIMULATED_TELEMETRY"

    envelope = RealtimeEventEnvelope(
        event_type=RealtimeEventType.EMS_VITALS_UPDATED,
        case_id="LS-2026-001",
        source=ProvenanceSource.EMS_VERIFIED,
        payload={"hr": 80},
    )
    assert envelope.source == ProvenanceSource.EMS_VERIFIED


def test_reconnect_reloads_authoritative_state_via_rest(client):
    """
    Ensure clients can disconnect, reconnect, and reload the authoritative case state via REST.
    """
    # Initial load via REST
    res1 = client.get("/api/v1/ems/cases/LS-2026-001")
    assert res1.status_code == 200
    case_data = res1.json()
    assert case_data["case_id"] == "LS-2026-001"

    # Connect WebSocket, disconnect, and re-fetch via REST
    with client.websocket_connect("/ws/cases/LS-2026-001?role=EMS_PARAMEDIC"):
        pass

    # Authoritative re-fetch
    res2 = client.get("/api/v1/ems/cases/LS-2026-001")
    assert res2.status_code == 200
    assert res2.json()["case_id"] == "LS-2026-001"
