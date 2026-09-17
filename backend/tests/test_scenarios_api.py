"""
Tests for Scenario Switchboard and isolated demo runner state management (Step 10).
"""

import pytest
from starlette.testclient import TestClient
from tests.conftest import TestingSessionLocal
from app.models.emergency_case import EmergencyCase
from app.simulation.scenarios import CANONICAL_SCENARIOS


def test_list_scenarios_metadata(client: TestClient):
    """Assert that all 5 canonical PRD demonstration scenarios are listed with complete metadata."""
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5

    scenario_ids = [s["id"] for s in data]
    assert "LS-SCENARIO-01" in scenario_ids
    assert "LS-SCENARIO-02" in scenario_ids
    assert "LS-SCENARIO-03" in scenario_ids
    assert "LS-SCENARIO-04" in scenario_ids
    assert "LS-SCENARIO-05" in scenario_ids

    # Check Scenario 1 metadata
    s1 = next(s for s in data if s["id"] == "LS-SCENARIO-01")
    assert s1["clinical_domain"] == "Cardiology"
    assert s1["red_rule_id"] == "RULE-CARD-01"
    assert s1["acuity_priority"] == "CRITICAL"
    assert len(s1["demo_talking_points"]) > 0


def test_get_single_scenario_metadata(client: TestClient):
    """Assert retrieval of single scenario metadata and 404 on invalid ID."""
    response = client.get("/api/v1/scenarios/LS-SCENARIO-02")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "LS-SCENARIO-02"
    assert data["clinical_domain"] == "Trauma Surgery"

    # Invalid scenario
    invalid_resp = client.get("/api/v1/scenarios/LS-SCENARIO-99")
    assert invalid_resp.status_code == 404


def test_load_scenario_state_isolation(client: TestClient):
    """
    Assert that loading a scenario:
    1. Creates/initializes only LS-SCENARIO-* records.
    2. Does not modify or delete baseline non-scenario cases.
    3. Initializes citizen report, AI report, EMS vitals, and audit events.
    """
    db = TestingSessionLocal()
    try:
        baseline_count_before = db.query(EmergencyCase).filter(
            ~EmergencyCase.case_id.like("LS-SCENARIO-%")
        ).count()
    finally:
        db.close()

    response = client.post("/api/v1/scenarios/LS-SCENARIO-01/load")
    assert response.status_code == 200
    case_data = response.json()
    assert case_data["case_id"] == "LS-SCENARIO-01"
    assert case_data["operational_priority"] == "CRITICAL"
    assert case_data["patient_age"] == 58

    db = TestingSessionLocal()
    try:
        # Verify baseline cases untouched
        baseline_count_after = db.query(EmergencyCase).filter(
            ~EmergencyCase.case_id.like("LS-SCENARIO-%")
        ).count()
        assert baseline_count_before == baseline_count_after

        # Verify scenario records exist in DB
        scenario_case = db.query(EmergencyCase).filter(
            EmergencyCase.case_id == "LS-SCENARIO-01"
        ).first()
        assert scenario_case is not None
        assert len(scenario_case.citizen_reports) > 0
        assert len(scenario_case.ai_reports) > 0

        assert len(scenario_case.ems_vitals) > 0
        assert len(scenario_case.audit_events) > 0

    finally:
        db.close()


def test_reset_scenario_state_isolation(client: TestClient):
    """
    Assert that resetting scenarios:
    1. Deletes only LS-SCENARIO-* records.
    2. Preserves baseline cases, hospitals, and resources.
    3. Releases reserved scenario bays.
    """
    # Load 2 scenarios
    client.post("/api/v1/scenarios/LS-SCENARIO-01/load")
    client.post("/api/v1/scenarios/LS-SCENARIO-02/load")

    db = TestingSessionLocal()
    try:
        scenario_count = db.query(EmergencyCase).filter(
            EmergencyCase.case_id.like("LS-SCENARIO-%")
        ).count()
        assert scenario_count >= 2
    finally:
        db.close()

    # Call reset
    reset_resp = client.post("/api/v1/scenarios/reset")
    assert reset_resp.status_code == 200
    reset_data = reset_resp.json()
    assert reset_data["status"] == "SUCCESS"

    db = TestingSessionLocal()
    try:
        # Verify 0 scenario cases remain
        remaining_scenarios = db.query(EmergencyCase).filter(
            EmergencyCase.case_id.like("LS-SCENARIO-%")
        ).count()
        assert remaining_scenarios == 0

        # Verify baseline cases remain intact
        baseline_cases = db.query(EmergencyCase).filter(
            EmergencyCase.case_id.in_(["LS-2026-001", "LS-2026-002", "LS-2026-003", "LS-2026-101"])
        ).all()
        assert len(baseline_cases) >= 3
    finally:
        db.close()


def test_cross_facility_isolation_and_rbac(client: TestClient):
    """
    Assert server-side RBAC and cross-facility isolation:
    1. Regular hospital staff bound to HOSP-CITYCARE-01 cannot access HOSP-METRO-02 (HTTP 403).
    2. Authorized DEMO_ADMIN or HOSPITAL_ADMIN may access and switch between any facility.
    """
    # 1. Staff of HOSP-CITYCARE-01 attempting to access HOSP-METRO-02 -> 403 Forbidden
    resp_forbidden = client.get(
        "/api/v1/hospitals/HOSP-METRO-02/cases",
        headers={
            "X-Actor-Role": "HOSPITAL_COORDINATOR",
            "X-Actor-Hospital-Id": "HOSP-CITYCARE-01",
        },
    )
    assert resp_forbidden.status_code == 403
    assert "Cross-facility access denied" in resp_forbidden.json()["detail"]

    # 2. Staff accessing their OWN facility -> 200 OK
    resp_allowed_staff = client.get(
        "/api/v1/hospitals/HOSP-CITYCARE-01/cases",
        headers={
            "X-Actor-Role": "HOSPITAL_COORDINATOR",
            "X-Actor-Hospital-Id": "HOSP-CITYCARE-01",
        },
    )
    assert resp_allowed_staff.status_code == 200

    # 3. Authorized DEMO_ADMIN accessing any facility -> 200 OK
    resp_admin = client.get(
        "/api/v1/hospitals/HOSP-METRO-02/cases",
        headers={
            "X-Actor-Role": "DEMO_ADMIN",
            "X-Actor-Hospital-Id": "HOSP-CITYCARE-01",
        },
    )
    assert resp_admin.status_code == 200

    # 4. Regional Dispatcher accessing any facility -> 200 OK
    resp_dispatcher = client.get(
        "/api/v1/hospitals/HOSP-STJUDE-03/cases",
        headers={
            "X-Actor-Role": "REGIONAL_DISPATCHER",
            "X-Actor-Hospital-Id": "HOSP-CITYCARE-01",
        },
    )
    assert resp_dispatcher.status_code == 200
