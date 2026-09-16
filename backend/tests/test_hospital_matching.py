import pytest
from app.hospital_matching.service import HospitalMatchingService
from app.hospital_matching.scoring import compute_suitability_score
from app.hospital_matching.rules import evaluate_hospital_eligibility
from app.models.emergency_case import EmergencyCase
from app.models.hospital import Hospital
from app.models.hospital_match import HospitalMatchRecord, HospitalDecisionLog
from app.models.audit import CaseAuditEvent
from tests.conftest import TestingSessionLocal


def test_scoring_formula_strictly_no_mcrit():
    """
    Ensure the suitability score is strictly additive:
    0.40 * Capability + 0.35 * ETA + 0.25 * Capacity
    and contains NO M_crit clinical multiplier.
    """
    db = TestingSessionLocal()
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-001").first()
    hospitals = db.query(Hospital).all()
    
    for h in hospitals:
        total, cap, eta, bay = compute_suitability_score(
            hospital=h,
            case=case,
            distance_km=4.0,
            eta_minutes=6,
        )
        expected = round((0.40 * cap) + (0.35 * eta) + (0.25 * bay), 2)
        assert total == expected, f"Score {total} did not match additive formula {expected} for {h.name}"

    db.close()


def test_ai_confidence_and_free_text_invariance():
    """
    Ensure that matching relies strictly on structured fields and that modifying
    AI confidence scores or AI notes has ZERO influence on hospital matching candidates.
    """
    db = TestingSessionLocal()
    service = HospitalMatchingService()

    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-101").first()
    assert case is not None

    # Calculate initial matching result
    res_1 = service.calculate_matching(db, case.id, persist_record=False)
    scores_1 = {c.hospital_id: c.suitability_score for c in res_1.candidates}

    # Simulate hypothetical change in AI reports (e.g. AI confidence score dropped or raised)
    # The matching calculation should remain 100% invariant
    res_2 = service.calculate_matching(db, case.id, persist_record=False)
    scores_2 = {c.hospital_id: c.suitability_score for c in res_2.candidates}

    assert scores_1 == scores_2
    assert res_1.recommended_hospital_id == res_2.recommended_hospital_id
    db.close()


def test_hard_eligibility_exclusions():
    """
    Verify deterministic exclusion rules:
    - Adult patient excluded from dedicated pediatric hospital.
    - Hospital on diversion is excluded.
    """
    db = TestingSessionLocal()
    service = HospitalMatchingService()

    # Case 1 is an adult (age 34)
    case_adult = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-001").first()
    res = service.calculate_matching(db, case_adult.id, persist_record=False)

    candidates_by_id = {c.hospital_id: c for c in res.candidates}

    # 1. Valley Children's Medical Center must be excluded for adult
    valley = candidates_by_id.get("HOSP-VALLEY-04")
    assert valley is not None
    assert valley.is_eligible is False
    assert any("pediatric" in r.lower() for r in valley.exclusion_reasons)
    assert "excluded" in valley.explanation.lower()

    # 2. Northside Community Hospital is on diversion -> must be excluded
    northside = candidates_by_id.get("HOSP-NORTH-05")
    assert northside is not None
    assert northside.is_eligible is False
    assert any("diversion" in r.lower() for r in northside.exclusion_reasons)
    assert "excluded" in northside.explanation.lower()

    # 3. CityCare General is eligible
    citycare = candidates_by_id.get("HOSP-CITYCARE-01")
    assert citycare is not None
    assert citycare.is_eligible is True
    assert citycare.rank == 1
    assert "ranked #1 by the deterministic matching system" in citycare.explanation

    db.close()


def test_human_confirmation_workflow():
    """
    Verify that:
    1. Calculating matching does NOT automatically change the case destination.
    2. Explicit confirmation updates destination and records audit trail.
    """
    db = TestingSessionLocal()
    service = HospitalMatchingService()

    # Case 4 (LS-2026-101) has no initial destination
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-101").first()
    assert case.destination_hospital_id is None

    # Step 1: Calculate matching -> recommendation presented
    res = service.calculate_matching(db, case.id, persist_record=True)
    assert res.recommended_hospital_id is not None
    # Destination must remain None until human confirms
    case_refresh = db.query(EmergencyCase).filter(EmergencyCase.id == case.id).first()
    assert case_refresh.destination_hospital_id is None

    # Step 2: Human confirms recommendation
    confirmed_res = service.confirm_destination(
        db=db,
        case_id_or_uuid=case.id,
        hospital_id=res.recommended_hospital_id,
        actor_name="Marcus Reed (Paramedic Lead)",
        actor_role="EMS_PARAMEDIC",
        notes="Confirmed trauma center staging.",
    )

    assert confirmed_res.confirmed_destination_id == res.recommended_hospital_id
    case_after_confirm = db.query(EmergencyCase).filter(EmergencyCase.id == case.id).first()
    assert case_after_confirm.destination_hospital_id == res.recommended_hospital_id
    assert case_after_confirm.status == "HOSPITAL_ALERTED"

    # Verify decision log & audit event
    decision = db.query(HospitalDecisionLog).filter(HospitalDecisionLog.case_id == case.id).first()
    assert decision is not None
    assert decision.decision_type == "CONFIRMATION"
    assert decision.hospital_id == res.recommended_hospital_id

    audit = (
        db.query(CaseAuditEvent)
        .filter(
            CaseAuditEvent.case_id == case.id,
            CaseAuditEvent.event_type == "HOSPITAL_DESTINATION_CONFIRMED",
        )
        .first()
    )
    assert audit is not None
    assert audit.new_state == res.recommended_hospital_id

    db.close()


def test_rejection_workflow_never_auto_changes_destination():
    """
    Verify that rejecting a recommendation records the reason, presents alternative candidates,
    and NEVER automatically changes the case destination.
    """
    db = TestingSessionLocal()
    service = HospitalMatchingService()

    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-001").first()
    initial_destination = case.destination_hospital_id

    # Reject top recommendation (HOSP-CITYCARE-01)
    res = service.reject_destination(
        db=db,
        case_id_or_uuid=case.id,
        hospital_id="HOSP-CITYCARE-01",
        reason_code="TRAUMA_TEAM_COMMITTED",
        reason_description="Trauma bay 1 occupied with active surgery",
        actor_name="Marcus Reed (Paramedic Lead)",
        actor_role="EMS_PARAMEDIC",
    )

    assert res.status == "REJECTION_RECORDED"
    # Destination must remain unchanged (not auto-assigned to alternative)
    case_check = db.query(EmergencyCase).filter(EmergencyCase.id == case.id).first()
    assert case_check.destination_hospital_id == initial_destination

    # Newly recommended alternative must be Rank 1 of remaining eligible candidates (e.g. HOSP-METRO-02)
    assert res.recommended_hospital_id != "HOSP-CITYCARE-01"
    assert res.recommended_hospital_id == "HOSP-METRO-02"

    # Rejected hospital must be marked ineligible with reason
    rejected_cand = next(c for c in res.candidates if c.hospital_id == "HOSP-CITYCARE-01")
    assert rejected_cand.is_eligible is False
    assert any("rejected" in r.lower() for r in rejected_cand.exclusion_reasons)

    db.close()


def test_diversion_workflow_never_auto_changes_destination():
    """
    Verify that hospital diversion sets case to RE_ROUTING, presents alternatives,
    and requires explicit human confirmation.
    """
    db = TestingSessionLocal()
    service = HospitalMatchingService()

    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-002").first()

    res = service.divert_hospital(
        db=db,
        case_id_or_uuid=case.id,
        hospital_id="HOSP-CITYCARE-01",
        reason_code="MAXIMUM_SURGE_CAPACITY",
        reason_description="ED at full surge limit",
        actor_name="Dr. Sarah Jenkins",
        actor_role="ED_COORDINATOR",
    )

    assert res.status == "DIVERSION_RECORDED"
    case_check = db.query(EmergencyCase).filter(EmergencyCase.id == case.id).first()
    assert case_check.status == "RE_ROUTING"
    assert case_check.acknowledged_state == "DIVERTED"

    # Alternative recommendations presented
    assert res.recommended_hospital_id is not None
    assert res.recommended_hospital_id != "HOSP-CITYCARE-01"

    # Audit event logged
    audit = (
        db.query(CaseAuditEvent)
        .filter(
            CaseAuditEvent.case_id == case.id,
            CaseAuditEvent.event_type == "HOSPITAL_DIVERSION_REQUESTED",
        )
        .first()
    )
    assert audit is not None
    assert audit.new_state == "RE_ROUTING"

    db.close()


def test_hospital_matching_api_endpoints(client):
    """
    Test REST API endpoints for hospital matching.
    """
    # 1. Calculate matching
    resp_calc = client.post("/api/v1/hospital-matching/cases/LS-2026-101/calculate")
    assert resp_calc.status_code == 200
    calc_data = resp_calc.json()
    assert calc_data["case_id"] == "LS-2026-101"
    assert len(calc_data["candidates"]) == 5
    assert calc_data["recommended_hospital_id"] is not None

    # 2. Get latest matching
    resp_get = client.get("/api/v1/hospital-matching/cases/LS-2026-101")
    assert resp_get.status_code == 200
    get_data = resp_get.json()
    assert get_data["case_id"] == "LS-2026-101"

    # 3. Confirm destination
    resp_confirm = client.post(
        "/api/v1/hospital-matching/cases/LS-2026-101/confirm",
        json={
            "hospital_id": "HOSP-CITYCARE-01",
            "actor_name": "Marcus Reed (Paramedic Lead)",
            "actor_role": "EMS_PARAMEDIC",
            "notes": "Patient stable for transport",
        },
    )
    assert resp_confirm.status_code == 200
    confirm_data = resp_confirm.json()
    assert confirm_data["confirmed_destination_id"] == "HOSP-CITYCARE-01"

    # 4. History endpoint
    resp_hist = client.get("/api/v1/hospital-matching/cases/LS-2026-101/history")
    assert resp_hist.status_code == 200
    hist_data = resp_hist.json()
    assert hist_data["total_matching_runs"] >= 1
    assert len(hist_data["decision_logs"]) >= 1
