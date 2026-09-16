def test_list_ems_cases(client):
    """
    Verify listing EMS cases, optionally filtered by unit or status.
    """
    response = client.get("/api/v1/ems/cases")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_ems_case_detail(client):
    """
    Verify retrieving full EMS case detail.
    """
    response = client.get("/api/v1/ems/cases/LS-2026-001")
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "LS-2026-001"
    assert data["status"] == "TRANSPORTING"
    assert len(data["ems_verifications"]) >= 1
    assert data["ems_verifications"][0]["source"] == "EMS_VERIFIED"
    assert len(data["ems_vitals"]) >= 1
    assert data["ems_vitals"][0]["source"] == "EMS_VERIFIED"


def test_record_ems_verification(client):
    """
    Verify recording paramedic clinical observations with EMS_VERIFIED tag and audit log.
    """
    payload = {
        "consciousness": "Responding",
        "breathing": "Normal",
        "bleeding": "Not present",
        "airway": "Patent",
        "clinical_notes": "Patient calm, oriented x3, splint applied to left wrist.",
        "verified_by": "Paramedic Marcus Reed",
    }
    response = client.post("/api/v1/ems/cases/LS-2026-101/verify", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["source"] == "EMS_VERIFIED"
    assert data["consciousness"] == "Responding"
    assert data["verified_by"] == "Paramedic Marcus Reed"


def test_record_ems_vitals(client):
    """
    Verify streaming vital signs by paramedics.
    """
    payload = {
        "heart_rate": 78,
        "systolic_bp": 122,
        "diastolic_bp": 78,
        "oxygen_saturation": 99,
        "respiratory_rate": 16,
        "temperature": 37.0,
        "gcs": 15,
        "pain_score": 3,
        "blood_glucose": 98,
        "recorded_by": "Paramedic Alex Rivera",
    }
    response = client.post("/api/v1/ems/cases/LS-2026-101/vitals", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["source"] == "EMS_VERIFIED"
    assert data["heart_rate"] == 78
    assert data["systolic_bp"] == 122
    assert data["is_verified"] is True


def test_update_ems_transport_status_and_invalid_transition(client):
    """
    Verify transport status progression and 409 Conflict on prohibited jump.
    """
    # Create fresh case to step through lifecycle
    report_resp = client.post(
        "/api/v1/citizen/reports",
        json={
            "incident_category": "Difficulty Breathing",
            "people_count": 1,
            "has_unconscious": "No",
            "is_awake": "Yes",
            "is_breathing": "Yes",
            "visible_concerns": ["Wheezing"],
            "location_address": "100 Pine Street",
        },
    )
    case_id = report_resp.json()["case_id"]

    # Valid step 1: REPORTED -> EMS_ASSIGNED
    resp1 = client.patch(f"/api/v1/cases/{case_id}/status", json={"status": "EMS_ASSIGNED", "actor_type": "SYSTEM", "actor_name": "Dispatcher"})
    assert resp1.status_code == 200

    # Valid step 2: EMS_ASSIGNED -> EMS_ACCEPTED
    resp2 = client.patch(f"/api/v1/cases/{case_id}/status", json={"status": "EMS_ACCEPTED", "actor_type": "EMS", "actor_name": "ALS-04"})
    assert resp2.status_code == 200

    # Valid step 3: EMS_ACCEPTED -> ON_SCENE
    resp3 = client.post(f"/api/v1/ems/cases/{case_id}/status", json={"status": "ON_SCENE", "updated_by": "ALS-04"})
    assert resp3.status_code == 200
    assert resp3.json()["status"] == "ON_SCENE"

    # Invalid jump: ON_SCENE -> HANDOVER_COMPLETE (should fail with 409 Conflict)
    resp_invalid = client.post(f"/api/v1/ems/cases/{case_id}/status", json={"status": "HANDOVER_COMPLETE", "updated_by": "ALS-04"})
    assert resp_invalid.status_code == 409


def test_complete_handover(client):
    """
    Verify complete handover endpoint advances case to HANDOVER_COMPLETE.
    """
    # Transition LS-2026-001 from TRANSPORTING to ARRIVED first
    client.post("/api/v1/ems/cases/LS-2026-001/status", json={"status": "ARRIVED", "updated_by": "ALS-04"})

    # Complete handover
    payload = {
        "receiving_staff": "Dr. Sarah Jenkins (ED Lead)",
        "notes": "Patient transferred to Trauma Bay 1. Report delivered to surgical lead.",
    }
    response = client.post("/api/v1/ems/cases/LS-2026-001/handover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HANDOVER_COMPLETE"
