def test_list_hospitals(client):
    """
    Verify listing registered hospital facilities.
    """
    response = client.get("/api/v1/hospitals")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    hospital_ids = [h["id"] for h in data]
    assert "HOSP-CITYCARE-01" in hospital_ids
    assert "HOSP-METRO-02" in hospital_ids


def test_get_hospital_detail(client):
    """
    Verify retrieving single hospital profile.
    """
    response = client.get("/api/v1/hospitals/HOSP-CITYCARE-01")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "HOSP-CITYCARE-01"
    assert data["name"] == "CityCare General Hospital"
    assert data["total_bays"] == 12


def test_list_hospital_inbound_cases(client):
    """
    Verify listing cases inbound to a specific hospital.
    """
    response = client.get("/api/v1/hospitals/HOSP-CITYCARE-01/cases")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    for c in data:
        assert c["destination_hospital_id"] == "HOSP-CITYCARE-01"


def test_acknowledge_hospital_case(client):
    """
    Verify hospital pre-arrival alert acknowledgement with bay reservation.
    """
    payload = {
        "assigned_bay": "RES-BAY-02",
        "acknowledged_by": "Dr. Sarah Jenkins",
        "notes": "Trauma Bay 2 prepped and ready for intake.",
    }
    response = client.post("/api/v1/hospitals/HOSP-CITYCARE-01/cases/LS-2026-003/acknowledge", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["acknowledged_state"] == "ACKNOWLEDGED"
    assert data["assigned_bay"] == "RES-BAY-02"


def test_divert_hospital_case(client):
    """
    Verify hospital diversion with mandatory structured reason code.
    """
    # Create a fresh case directed to CityCare
    case_resp = client.post(
        "/api/v1/cases",
        json={
            "incident_type": "Severe Burns",
            "operational_priority": "CRITICAL",
            "patient_count": 1,
            "reported_location": "Industrial Park East",
            "destination_hospital_id": "HOSP-CITYCARE-01",
        },
    )
    case_id = case_resp.json()["case_id"]

    # Advance to TRANSPORTING
    client.patch(f"/api/v1/cases/{case_id}/status", json={"status": "EMS_ASSIGNED", "actor_type": "SYSTEM", "actor_name": "Dispatcher"})
    client.patch(f"/api/v1/cases/{case_id}/status", json={"status": "EMS_ACCEPTED", "actor_type": "EMS", "actor_name": "ALS-01"})
    client.patch(f"/api/v1/cases/{case_id}/status", json={"status": "ON_SCENE", "actor_type": "EMS", "actor_name": "ALS-01"})
    client.patch(f"/api/v1/cases/{case_id}/status", json={"status": "TRANSPORTING", "actor_type": "EMS", "actor_name": "ALS-01"})

    payload = {
        "divert_reason_code": "SURGE_CAPACITY",
        "divert_notes": "Burn ICU beds temporarily at 100% saturation. Diverting to regional burn center.",
        "diverted_by": "Dr. Sarah Jenkins (ED Lead)",
    }
    response = client.post(f"/api/v1/hospitals/HOSP-CITYCARE-01/cases/{case_id}/divert", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["acknowledged_state"] == "DIVERTED"
    assert data["status"] == "DIVERTED"


def test_hospital_readiness_summary_and_resource_patch(client):
    """
    Verify readiness summary and resource patching.
    """
    summary_resp = client.get("/api/v1/hospitals/HOSP-CITYCARE-01/readiness")
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["hospital_id"] == "HOSP-CITYCARE-01"
    assert len(summary["resources"]) >= 1

    # Patch resource state
    patch_payload = {
        "status": "Limited",
        "notes": "Scheduled calibration in progress.",
    }
    patch_resp = client.patch("/api/v1/hospitals/HOSP-CITYCARE-01/readiness/RES-CT-01", json=patch_payload)
    assert patch_resp.status_code == 200
    patched = patch_resp.json()
    assert patched["status"] == "Limited"
    assert patched["notes"] == "Scheduled calibration in progress."
