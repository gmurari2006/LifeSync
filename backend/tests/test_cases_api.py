def test_list_all_cases_pagination_and_filters(client):
    """
    Verify listing emergency cases with pagination and query filters.
    """
    response = client.get("/api/v1/cases?limit=10&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "cases" in data
    assert data["total"] >= 1
    assert len(data["cases"]) >= 1


def test_get_case_detail_by_code_and_uuid(client):
    """
    Verify looking up a case by human-readable case_id or UUID returns full nested structure.
    """
    # Lookup by human case_id
    response = client.get("/api/v1/cases/LS-2026-002")
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "LS-2026-002"
    assert data["incident_type"] == "Acute ST-Elevation Myocardial Infarction (STEMI)"
    assert "citizen_reports" in data
    assert "ems_verifications" in data
    assert "ems_vitals" in data
    assert "audit_events" in data

    # Lookup by UUID
    case_uuid = data["id"]
    response_uuid = client.get(f"/api/v1/cases/{case_uuid}")
    assert response_uuid.status_code == 200
    assert response_uuid.json()["id"] == case_uuid


def test_update_case_status_with_audit_trail(client):
    """
    Verify updating case lifecycle state directly appends an audit event to the timeline.
    """
    case_resp = client.post(
        "/api/v1/cases",
        json={
            "incident_type": "Syncope / Collapse",
            "operational_priority": "MODERATE",
            "patient_count": 1,
            "reported_location": "500 Main Street",
        },
    )
    case_id = case_resp.json()["case_id"]

    # Transition to EMS_ASSIGNED
    patch_resp = client.patch(
        f"/api/v1/cases/{case_id}/status",
        json={
            "status": "EMS_ASSIGNED",
            "actor_type": "SYSTEM",
            "actor_name": "CAD Auto-Dispatch",
            "notes": "Assigned unit ALS-02 based on proximity.",
        },
    )
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["status"] == "EMS_ASSIGNED"

    # Verify audit event is present
    assert len(updated["audit_events"]) >= 2
    latest_event = [e for e in updated["audit_events"] if e["new_state"] == "EMS_ASSIGNED"][0]
    assert latest_event["event_type"] == "STATE_EMS_ASSIGNED"
    assert latest_event["actor_type"] == "SYSTEM"
    assert latest_event["actor_name"] == "CAD Auto-Dispatch"
