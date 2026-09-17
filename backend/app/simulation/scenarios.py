"""
LifeSync Canonical Scenario Simulation Suite (Step 10)
Defines the 5 canonical PRD emergency demonstration scenarios with isolated
state management (prefixed with LS-SCENARIO-*).
"""

import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.emergency_case import EmergencyCase
from app.models.citizen_report import CitizenReport
from app.models.ai_report import AIStructuredReport
from app.models.ems import EMSUnit, EMSVerification, EMSVitals
from app.models.hospital import Hospital, HospitalResource
from app.models.audit import CaseAuditEvent
from app.models.base import utc_now
from app.simulation.service import simulation_service
from app.simulation.schemas import SimulationControlRequest
from app.realtime.events import publish_case_event

from app.realtime.schemas import RealtimeEventType, ProvenanceSource


class ScenarioMetadata(BaseModel):
    id: str
    scenario_number: int
    title: str
    clinical_domain: str
    patient_description: str
    incident_category: str
    acuity_priority: str
    target_hospital_id: str
    target_hospital_name: str
    assigned_unit_id: str
    assigned_unit_type: str
    recommended_bay: str
    red_rule_id: Optional[str] = None
    summary: str
    demo_talking_points: List[str]


# 5 Canonical PRD Scenarios Definition
CANONICAL_SCENARIOS: List[ScenarioMetadata] = [
    ScenarioMetadata(
        id="LS-SCENARIO-01",
        scenario_number=1,
        title="Acute STEMI / Cardiac Pre-Alert",
        clinical_domain="Cardiology",
        patient_description="58-year-old male with retrosternal crushing chest pain, diaphoresis, radiating left arm pain",
        incident_category="CARDIAC_CHEST_PAIN",
        acuity_priority="CRITICAL",
        target_hospital_id="HOSP-CITYCARE-01",
        target_hospital_name="Apex Metro Hospital",
        assigned_unit_id="ALS-04",
        assigned_unit_type="ALS (Advanced Life Support)",
        recommended_bay="RES-CATH-01",
        red_rule_id="RULE-CARD-01",
        summary="Classic acute coronary syndrome presentation requiring 24/7 Cath Lab PCI activation and immediate hospital pre-alert.",
        demo_talking_points=[
            "Citizen speaks chest pain and heavy sweating.",
            "Deterministic RULE-CARD-01 locks priority to CRITICAL.",
            "Hospital Matching selects Apex Metro (Active 24/7 Cath Lab).",
            "Hospital ED Coordinator acknowledges and stages Cath Lab 1.",
            "EMS records 12-lead ECG confirmed STEMI en route.",
        ],
    ),
    ScenarioMetadata(
        id="LS-SCENARIO-02",
        scenario_number=2,
        title="Severe Polytrauma MVA / Resuscitation Staging",
        clinical_domain="Trauma Surgery",
        patient_description="34-year-old male trapped in high-speed highway collision, GCS 7, severe blood loss, right hemothorax",
        incident_category="TRAUMA_MVA",
        acuity_priority="CRITICAL",
        target_hospital_id="HOSP-CITYCARE-01",
        target_hospital_name="Apex Metro Hospital",
        assigned_unit_id="ALS-02",
        assigned_unit_type="ALS (Advanced Life Support)",
        recommended_bay="RES-BAY-01",
        red_rule_id="RULE-TRAUMA-01",
        summary="High-speed motor vehicle collision requiring Level-1 Trauma surgical resuscitation bay, needle decompression, and O-Neg blood pack.",
        demo_talking_points=[
            "Citizen reports pinned unresponsive driver on highway.",
            "Deterministic RULE-TRAUMA-01 triggers Level-1 trauma protocol.",
            "Resuscitation Bay 1 and O-Negative blood staged in advance.",
            "EMS performs needle decompression; vitals sync live to hospital.",
        ],
    ),
    ScenarioMetadata(
        id="LS-SCENARIO-03",
        scenario_number=3,
        title="Acute Ischemic Stroke / Neurosciences Routing",
        clinical_domain="Neurology",
        patient_description="67-year-old female with sudden right facial droop, hemiparesis, severe dysarthria (onset 35m ago)",
        incident_category="NEUROLOGICAL_DEFICIT",
        acuity_priority="CRITICAL",
        target_hospital_id="HOSP-METRO-02",
        target_hospital_name="Metro Neurosciences Institute",
        assigned_unit_id="BLS-09",
        assigned_unit_type="BLS (Basic Life Support)",
        recommended_bay="RES-CT-01",
        red_rule_id="RULE-STROKE-01",
        summary="Acute Large Vessel Occlusion (LVO) stroke within tPA / endovascular thrombectomy golden window matched to Comprehensive Stroke Center.",
        demo_talking_points=[
            "Citizen reports sudden facial droop and inability to speak.",
            "RULE-STROKE-01 prioritizes stroke-ready facility within golden hour.",
            "Matched to Metro Neurosciences Institute for 24/7 CT Angio & Thrombectomy.",
            "Hospital CT Scanner pre-cleared for immediate arrival scan.",
        ],
    ),
    ScenarioMetadata(
        id="LS-SCENARIO-04",
        scenario_number=4,
        title="Pediatric Status Asthmaticus / Specialized PICU",
        clinical_domain="Pediatrics",
        patient_description="6-year-old male with severe acute asthma exacerbation, audible inspiratory stridor, intercostal retractions",
        incident_category="RESPIRATORY_DISTRESS",
        acuity_priority="CRITICAL",
        target_hospital_id="HOSP-VALLEY-04",
        target_hospital_name="St. Jude Children's Hospital",
        assigned_unit_id="ALS-01",
        assigned_unit_type="ALS (Advanced Life Support)",
        recommended_bay="RES-BAY-02",
        red_rule_id="RULE-RESP-01",
        summary="Pediatric respiratory emergency where adult facilities are excluded by pediatric specialty rules, routing directly to Children's PICU.",
        demo_talking_points=[
            "Citizen reports 6yo child gasping for air with severe retractions.",
            "Pediatric age rule filters exclusively to specialized Pediatric ICU.",
            "Dispatches pediatric-equipped ALS Unit 01.",
            "St. Jude Children's stages Pediatric Resuscitation Bay.",
        ],
    ),
    ScenarioMetadata(
        id="LS-SCENARIO-05",
        scenario_number=5,
        title="Surge Diversion & Dynamic Hospital Re-Routing",
        clinical_domain="Emergency Operations",
        patient_description="52-year-old male with acute aortic dissection, initial destination City General at surge capacity",
        incident_category="CARDIAC_CHEST_PAIN",
        acuity_priority="CRITICAL",
        target_hospital_id="HOSP-METRO-02",
        target_hospital_name="City General Hospital",
        assigned_unit_id="ALS-04",
        assigned_unit_type="ALS (Advanced Life Support)",
        recommended_bay="RES-BAY-01",
        red_rule_id="RULE-CARD-01",
        summary="Demonstrates hospital diversion workflow: initial hospital triggers diversion, system re-ranks candidates, human confirms re-route to Apex Metro.",
        demo_talking_points=[
            "Inbound case directed to City General during surge.",
            "City General ED Coordinator issues diversion (SURGE_CAPACITY_EXCEEDED).",
            "Matching engine instantly calculates Rank-1 alternative (Apex Metro).",
            "Authorized human confirms re-route; ambulance vector updates dynamically.",
        ],
    ),
]


def list_canonical_scenarios() -> List[ScenarioMetadata]:
    """Return all 5 canonical PRD demonstration scenarios."""
    return CANONICAL_SCENARIOS


def get_scenario_metadata(scenario_id: str) -> Optional[ScenarioMetadata]:
    """Retrieve metadata for a specific scenario by ID."""
    for s in CANONICAL_SCENARIOS:
        if s.id == scenario_id:
            return s
    return None


def reset_scenario_database_state(db: Session) -> Dict[str, Any]:
    """
    Safely resets ONLY synthetic scenario data prefixed with LS-SCENARIO-*.
    Guaranteed NOT to modify or delete baseline cases, hospitals, or database schema.
    """
    scenario_cases = db.query(EmergencyCase).filter(
        EmergencyCase.case_id.like("LS-SCENARIO-%")
    ).all()

    case_ids = [c.case_id for c in scenario_cases]
    internal_ids = [c.id for c in scenario_cases]

    deleted_counts = {
        "cases": len(case_ids),
        "audit_events": 0,
        "vitals": 0,
        "verifications": 0,
        "ai_reports": 0,
        "citizen_reports": 0,
    }

    if internal_ids:
        deleted_counts["audit_events"] = db.query(CaseAuditEvent).filter(CaseAuditEvent.case_id.in_(internal_ids)).delete(synchronize_session=False)
        deleted_counts["vitals"] = db.query(EMSVitals).filter(EMSVitals.case_id.in_(internal_ids)).delete(synchronize_session=False)
        deleted_counts["verifications"] = db.query(EMSVerification).filter(EMSVerification.case_id.in_(internal_ids)).delete(synchronize_session=False)
        deleted_counts["ai_reports"] = db.query(AIStructuredReport).filter(AIStructuredReport.case_id.in_(internal_ids)).delete(synchronize_session=False)
        deleted_counts["citizen_reports"] = db.query(CitizenReport).filter(CitizenReport.case_id.in_(internal_ids)).delete(synchronize_session=False)
        db.query(EmergencyCase).filter(EmergencyCase.id.in_(internal_ids)).delete(synchronize_session=False)

    # Release any hospital bays reserved by scenario cases
    for cid in case_ids:
        resources = db.query(HospitalResource).filter(HospitalResource.assigned_case_id == cid).all()
        for r in resources:
            r.status = "Ready"
            r.assigned_case_id = None
            r.available_capacity = r.total_capacity
            r.last_updated = "Just now"

    # Reset any active simulation tracking for scenario cases
    for cid in case_ids:
        try:
            simulation_service.control_simulation(
                db=db,
                case_id=cid,
                request=SimulationControlRequest(action="RESET"),
            )
        except Exception:
            pass


    db.commit()
    return {
        "status": "SUCCESS",
        "message": f"Successfully reset {deleted_counts['cases']} scenario cases and isolated records.",
        "details": deleted_counts,
    }


def load_canonical_scenario(db: Session, scenario_id: str) -> EmergencyCase:
    """
    Load or re-initialize one of the 5 canonical PRD demonstration scenarios.
    Isolates state to LS-SCENARIO-* records.
    """
    meta = get_scenario_metadata(scenario_id)
    if not meta:
        raise ValueError(f"Scenario '{scenario_id}' not found in canonical scenarios list.")

    now = utc_now()
    ten_mins_ago = now - datetime.timedelta(minutes=10)
    eight_mins_ago = now - datetime.timedelta(minutes=8)
    five_mins_ago = now - datetime.timedelta(minutes=5)
    two_mins_ago = now - datetime.timedelta(minutes=2)

    # Clean existing scenario instance if present
    existing_case = db.query(EmergencyCase).filter(EmergencyCase.case_id == scenario_id).first()
    if existing_case:
        db.query(CaseAuditEvent).filter(CaseAuditEvent.case_id == existing_case.id).delete()
        db.query(EMSVitals).filter(EMSVitals.case_id == existing_case.id).delete()
        db.query(EMSVerification).filter(EMSVerification.case_id == existing_case.id).delete()
        db.query(AIStructuredReport).filter(AIStructuredReport.case_id == existing_case.id).delete()
        db.query(CitizenReport).filter(CitizenReport.case_id == existing_case.id).delete()
        db.delete(existing_case)
        db.flush()

    # Ensure assigned EMS unit exists
    ems_unit = db.query(EMSUnit).filter(EMSUnit.unit_id == meta.assigned_unit_id).first()
    if not ems_unit:
        ems_unit = EMSUnit(
            unit_id=meta.assigned_unit_id,
            unit_type=meta.assigned_unit_type,
            call_sign=f"{meta.assigned_unit_id}-Medic",
            status="Transporting",
            lead_paramedic="Lead Paramedic",
            driver_paramedic="Paramedic Driver",
            contact_number="+1 (555) 019-9911",
            current_location_name="En Route to Scene / Hospital",
            speed_kmh=52.0,
            fuel_percent=88,
        )
        db.add(ems_unit)
        db.flush()

    # Create Scenario EmergencyCase
    patient_age = 58 if meta.scenario_number == 1 else (34 if meta.scenario_number == 2 else (67 if meta.scenario_number == 3 else (6 if meta.scenario_number == 4 else 52)))
    patient_sex = "Female" if meta.scenario_number == 3 else "Male"

    new_case = EmergencyCase(
        case_id=meta.id,
        incident_type=meta.title,
        operational_priority=meta.acuity_priority,
        status="HOSPITAL_ALERTED" if meta.scenario_number != 5 else "TRANSPORTING",
        patient_count=1,
        patient_age=patient_age,
        patient_sex=patient_sex,
        reported_location="Civic Center Plaza, Metro City",
        landmark="Near Central Metro Gate 3",
        latitude=37.7780,
        longitude=-122.4170,
        destination_hospital_id=meta.target_hospital_id,
        assigned_unit_id=meta.assigned_unit_id,
        assigned_bay=meta.recommended_bay if meta.scenario_number != 5 else None,
        acknowledged_state="PENDING" if meta.scenario_number in (1, 3, 4) else ("ACKNOWLEDGED" if meta.scenario_number == 2 else "PENDING"),
        time_reported=ten_mins_ago,
        time_alerted=eight_mins_ago,
        time_acknowledged=five_mins_ago if meta.scenario_number == 2 else None,
    )
    db.add(new_case)
    db.flush()

    # Populate Citizen Report
    cit_rep = CitizenReport(
        case_id=new_case.id,
        incident_category=meta.incident_category,
        people_count=1,
        has_unconscious="Yes" if meta.scenario_number == 2 else "No",
        is_awake="No" if meta.scenario_number == 2 else "Yes",
        is_breathing="Yes",
        visible_concerns=[meta.patient_description],
        location_address="Civic Center Plaza, Metro City",
        location_landmark="Near Central Metro Gate 3",
        latitude=37.7780,
        longitude=-122.4170,
        additional_notes=meta.patient_description,
        source="CITIZEN_REPORTED",
        reported_at=ten_mins_ago,
    )
    db.add(cit_rep)
    db.flush()

    # Populate AI Structured Report
    ai_rep = AIStructuredReport(
        case_id=new_case.id,
        citizen_report_id=cit_rep.id,

        incident_summary=f"AI Structured Summary: {meta.patient_description}. Deterministic Screening: {meta.red_rule_id or 'None'}.",
        incident_category=meta.incident_category,
        people_count=1,
        consciousness="Unresponsive" if meta.scenario_number == 2 else "Responding",
        breathing="Difficulty Breathing" if meta.scenario_number in (1, 2, 4) else "Normal",
        visible_concerns=[meta.patient_description],
        location_summary="Civic Center Plaza, Metro City",
        extracted_keywords=["emergency", meta.clinical_domain.lower(), "acute"],
        uncertainty_flags=["Initial bystander report pending verified on-scene clinical assessment"],
        missing_information=["12-Lead ECG verification" if meta.scenario_number == 1 else "Continuous SpO2 and airway confirmation"],
        confidence_score=0.94,
        source="AI_STRUCTURED",
        model_name="lifesync-nlp-local-v1",
        model_version="1.2.0",
        prompt_version="v1.2",
        status="COMPLETED",
        structured_payload={
            "scenario_id": meta.id,
            "clinical_domain": meta.clinical_domain,
            "red_rule_id": meta.red_rule_id,
            "confidence_score": 0.94,
        },
        generated_at=eight_mins_ago,
    )
    db.add(ai_rep)

    # Populate EMS Verification & Vitals
    ems_verif = EMSVerification(
        case_id=new_case.id,
        consciousness="Not responding" if meta.scenario_number == 2 else "Responding",
        breathing="Abnormal" if meta.scenario_number in (1, 2, 4) else "Normal",
        bleeding="Present" if meta.scenario_number == 2 else "Not present",
        airway="Compromised" if meta.scenario_number == 2 else "Patent",
        clinical_notes=f"EMS on-scene evaluation: {meta.patient_description}. Protocols initiated.",
        verified_by=f"{meta.assigned_unit_id} Paramedic Crew",
        verified_at=five_mins_ago,
        source="EMS_VERIFIED",
    )
    db.add(ems_verif)

    vitals = EMSVitals(
        case_id=new_case.id,
        heart_rate=118 if meta.scenario_number == 1 else (130 if meta.scenario_number == 2 else 88),
        systolic_bp=90 if meta.scenario_number == 1 else (84 if meta.scenario_number == 2 else 170),
        diastolic_bp=60 if meta.scenario_number == 1 else (50 if meta.scenario_number == 2 else 105),
        oxygen_saturation=91 if meta.scenario_number in (1, 2, 4) else 97,
        respiratory_rate=24 if meta.scenario_number in (1, 2, 4) else 16,
        temperature=36.7,
        gcs=7 if meta.scenario_number == 2 else 15,
        pain_score=9 if meta.scenario_number == 1 else 5,
        blood_glucose=115,
        recorded_by=f"{meta.assigned_unit_id} Lead",
        recorded_at=two_mins_ago,
        is_verified=True,
        source="EMS_VERIFIED",
    )
    db.add(vitals)

    # Initial Audit Events
    aud_1 = CaseAuditEvent(
        case_id=new_case.id,
        timestamp=ten_mins_ago,
        event_type="CASE_REPORTED",
        actor_type="CITIZEN",
        actor_name="Citizen Reporter",
        previous_state=None,
        new_state="REPORTED",
        title=f"Scenario #{meta.scenario_number} Initiated: {meta.title}",
        description=meta.summary,
        event_metadata={"scenario_id": meta.id, "domain": meta.clinical_domain},
    )
    aud_2 = CaseAuditEvent(
        case_id=new_case.id,
        timestamp=eight_mins_ago,
        event_type="AI_STRUCTURING_COMPLETED",
        actor_type="SYSTEM",
        actor_name="LifeSync AI Engine",
        title="AI Structured Extraction & Red-Rule Screening Completed",
        description=f"Confidence: 0.94. Rule: {meta.red_rule_id or 'None'}. Priority: {meta.acuity_priority}.",
        new_state="SCREENING",
        event_metadata={"red_rule_id": meta.red_rule_id, "confidence": 0.94, "source": "AI_STRUCTURED"},
    )
    aud_3 = CaseAuditEvent(
        case_id=new_case.id,
        timestamp=five_mins_ago,
        event_type="HOSPITAL_PRE_ALERT_SENT",
        actor_type="SYSTEM",
        actor_name="LifeSync Core Matcher",
        title=f"Pre-Arrival Alert Sent to {meta.target_hospital_name}",
        description=f"Target hospital: {meta.target_hospital_id}. Staging recommendation: {meta.recommended_bay}.",
        new_state=new_case.status,
        event_metadata={"destination_hospital_id": meta.target_hospital_id, "assigned_unit_id": meta.assigned_unit_id},
    )
    db.add_all([aud_1, aud_2, aud_3])

    # Pre-allocate or reserve bay if specified
    if meta.recommended_bay and meta.scenario_number == 2:
        res = db.query(HospitalResource).filter(
            HospitalResource.hospital_id == meta.target_hospital_id,
            HospitalResource.id == meta.recommended_bay,
        ).first()
        if res:
            res.status = "Occupied"
            res.assigned_case_id = new_case.case_id
            res.available_capacity = 0
            res.last_updated = "Just now"

    db.commit()
    db.refresh(new_case)

    # Initialize simulation track with confirmed destination
    try:
        simulation_service.control_simulation(
            db=db,
            case_id=new_case.case_id,
            request=SimulationControlRequest(action="START"),
        )
    except Exception:
        pass


    # Broadcast real-time event (delivery only)
    try:
        publish_case_event(
            case_id=new_case.case_id,
            event_type=RealtimeEventType.CASE_STATE_CHANGED,
            payload={
                "scenario_id": meta.id,
                "case_id": new_case.case_id,
                "status": new_case.status,
                "title": meta.title,
            },
            provenance=ProvenanceSource.SYSTEM,
        )
    except Exception:
        pass

    return new_case
