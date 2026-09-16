def test_submit_citizen_report_creates_case_without_hospital_alert(client):
    """
    Verify citizen report intake:
    1. Creates emergency case in 'REPORTED' status
    2. Strictly stores people_count as integer
    3. Records source as CITIZEN_REPORTED
    4. Creates initial audit event (CASE_REPORTED)
    5. Does NOT set destination_hospital_id or alert hospital (safety boundary)
    """
    payload = {
        "incident_category": "Fall / Major Trauma",
        "people_count": 2,
        "has_unconscious": "No",
        "is_awake": "Yes",
        "is_breathing": "Yes",
        "visible_concerns": ["Head laceration", "Unable to bear weight on left leg"],
        "location_address": "888 Howard Street, Downtown Plaza",
        "location_landmark": "Near fountain in center courtyard",
        "latitude": 37.7820,
        "longitude": -122.4050,
        "additional_notes": "Elderly individual tripped on stairs. Conscious, speaking clearly.",
    }

    response = client.post("/api/v1/citizen/reports", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["status"] == "REPORTED"
    assert data["case_id"].startswith("LS-2026-")
    assert data["report"]["incident_category"] == "Fall / Major Trauma"
    assert data["report"]["people_count"] == 2
    assert isinstance(data["report"]["people_count"], int)
    assert data["report"]["source"] == "CITIZEN_REPORTED"
    assert data["report"]["location_address"] == "888 Howard Street, Downtown Plaza"

    # Query the case directly from the cases endpoint to verify safety boundary
    case_detail_resp = client.get(f"/api/v1/cases/{data['case_id']}")
    assert case_detail_resp.status_code == 200
    case_detail = case_detail_resp.json()

    assert case_detail["destination_hospital_id"] is None
    assert case_detail["acknowledged_state"] is None
    assert len(case_detail["audit_events"]) >= 1
    assert case_detail["audit_events"][0]["event_type"] == "CASE_REPORTED"
    assert case_detail["audit_events"][0]["actor_type"] == "CITIZEN"


def test_get_citizen_case_status(client):
    """
    Verify citizen tracking endpoint returns reported case status.
    """
    # LS-2026-101 was created in seed
    response = client.get("/api/v1/citizen/cases/LS-2026-101")
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "LS-2026-101"
    assert data["status"] == "REPORTED"
    assert data["report"]["people_count"] == 1
    assert data["report"]["source"] == "CITIZEN_REPORTED"


def test_get_nonexistent_citizen_case(client):
    """
    Verify 404 for non-existent case identifier.
    """
    response = client.get("/api/v1/citizen/cases/LS-NONEXISTENT")
    assert response.status_code == 404
