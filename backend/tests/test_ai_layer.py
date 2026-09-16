import pytest
from app.ai.rules import validate_and_sanitize_ai_output
from app.ai.providers.local import RuleBasedLocalAIProvider
from app.ai.service import AIService
from app.models.emergency_case import EmergencyCase
from app.models.citizen_report import CitizenReport
from app.models.ai_report import AIStructuredReport
from app.models.audit import CaseAuditEvent
from tests.conftest import TestingSessionLocal


def test_ai_safety_rules_sanitize_diagnoses():
    """
    Ensure AI safety layer neutralizes forbidden clinical diagnosis claims.
    """
    input_payload = {
        "incident_summary": "Patient has a confirmed stroke and definitive diagnosis of STEMI.",
        "visible_concerns": ["Severe bleeding", "Confirmed Stroke"],
        "confidence_score": 0.95,
        "source": "UNKNOWN",
    }
    sanitized, safety_notes = validate_and_sanitize_ai_output(input_payload)

    assert sanitized["source"] == "AI_STRUCTURED"
    assert "confirmed stroke" not in sanitized["incident_summary"].lower()
    assert "definitive diagnosis of" not in sanitized["incident_summary"].lower()
    assert "Confirmed Stroke" not in sanitized["visible_concerns"]
    assert "Severe bleeding" in sanitized["visible_concerns"]
    assert len(safety_notes) >= 2


def test_ai_safety_rules_strip_prescriptions():
    """
    Ensure AI safety layer strips medication prescriptions and dosages.
    """
    input_payload = {
        "incident_summary": "Patient is in pain. Prescribe 325mg aspirin and push 1mg epinephrine immediately.",
        "visible_concerns": [],
        "confidence_score": 1.5,  # Out of bounds
    }
    sanitized, safety_notes = validate_and_sanitize_ai_output(input_payload)

    assert "325mg aspirin" not in sanitized["incident_summary"]
    assert "push 1mg epinephrine" not in sanitized["incident_summary"]
    assert sanitized["confidence_score"] == 1.0  # Clamped to 1.0
    assert len(safety_notes) >= 1


@pytest.mark.asyncio
async def test_rule_based_local_provider_extraction():
    """
    Ensure the deterministic local provider extracts categories, vitals indicators, and uncertainty markers.
    """
    provider = RuleBasedLocalAIProvider()
    report_data = {
        "chief_complaint": "Traffic collision on the freeway",
        "additional_notes": "Looks like the driver is unresponsive and maybe struggling to breathe. Severe bleeding from arm.",
        "emergency_type": "TRAUMA",
        "people_count": 1,
        "consciousness": "not_sure",
        "breathing": "difficulty",
        "location_address": "Highway 101 North",
        "location_landmark": "Exit 12",
    }
    case_data = {
        "emergency_type": "TRAUMA",
        "patient_count": 1,
        "location_address": "Highway 101 North",
    }

    result = await provider.structure_emergency_report(report_data, case_data)

    assert result["source"] == "AI_STRUCTURED"
    assert result["incident_category"] in ["TRAUMA_MVA", "TRAUMA_GENERAL"]
    assert result["consciousness"] == "Unresponsive"
    assert result["breathing"] == "Difficulty Breathing"
    assert any("Bleeding" in c for c in result["visible_concerns"])
    assert len(result["uncertainty_flags"]) > 0
    assert any("uncertainty" in f.lower() or "approximate" in f.lower() for f in result["uncertainty_flags"])
    assert 0.0 <= result["confidence_score"] <= 1.0


@pytest.mark.asyncio
async def test_ai_service_persistence_and_audit():
    """
    Ensure AIService orchestrates structuring, saves AIStructuredReport, and appends audit event.
    """
    db = TestingSessionLocal()
    ai_service = AIService()

    # Query existing baseline case
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-001").first()
    assert case is not None

    # Trigger structuring with force_reprocess=True to create new execution
    ai_report = await ai_service.structure_case_report(
        db=db,
        case_id_or_uuid=case.id,
        force_reprocess=True,
        additional_context="Caller mentions smoke from engine compartment",
    )

    assert ai_report.id is not None
    assert ai_report.case_id == case.id
    assert ai_report.source == "AI_STRUCTURED"
    assert ai_report.model_name == "lifesync-nlp-local-v1"
    assert ai_report.confidence_score > 0.0

    # Verify audit event creation
    audit_event = (
        db.query(CaseAuditEvent)
        .filter(
            CaseAuditEvent.case_id == case.id,
            CaseAuditEvent.event_type == "AI_STRUCTURING_COMPLETED",
        )
        .order_by(CaseAuditEvent.timestamp.desc())
        .first()
    )
    assert audit_event is not None
    assert audit_event.actor_type == "SYSTEM"
    assert "AI" in audit_event.actor_name
    assert audit_event.event_metadata["source"] == "AI_STRUCTURED"

    db.close()


def test_ai_api_endpoints(client):
    """
    Test FastAPI AI endpoints for structuring triggering, latest retrieval, and history.
    """
    # 1. Get seeded AI report for LS-2026-001
    resp_get = client.get("/api/v1/ai/cases/LS-2026-001")
    assert resp_get.status_code == 200
    data = resp_get.json()
    assert data["source"] == "AI_STRUCTURED"
    assert data["incident_category"] == "TRAUMA_MVA"
    assert data["confidence_score"] > 0.0

    # 2. Trigger structuring via POST
    resp_post = client.post(
        "/api/v1/ai/cases/LS-2026-001/structure",
        json={"force_reprocess": False},
    )
    assert resp_post.status_code == 200
    post_data = resp_post.json()
    assert post_data["status"] == "SUCCESS"
    assert post_data["ai_structured_info"]["source"] == "AI_STRUCTURED"

    # 3. Get history
    resp_hist = client.get("/api/v1/ai/cases/LS-2026-001/history")
    assert resp_hist.status_code == 200
    hist_data = resp_hist.json()
    assert hist_data["total_versions"] >= 1
    assert len(hist_data["reports"]) >= 1

    # 4. Non-existent case
    resp_404 = client.get("/api/v1/ai/cases/NON-EXISTENT-CASE")
    assert resp_404.status_code == 404
