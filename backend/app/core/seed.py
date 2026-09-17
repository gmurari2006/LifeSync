import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.hospital import Hospital, HospitalResource
from app.models.ems import EMSUnit, EMSVerification, EMSVitals
from app.models.emergency_case import EmergencyCase
from app.models.citizen_report import CitizenReport
from app.models.ai_report import AIStructuredReport
from app.models.audit import CaseAuditEvent
from app.models.base import utc_now


def seed_database(db: Session) -> None:
    """
    Seed initial hospital facilities, resources, active EMS units, and baseline emergency cases.
    Idempotent: skips if data already exists.
    """
    # 1. Seed Hospitals
    existing_hospitals = db.query(Hospital).count()
    if existing_hospitals == 0:
        hospitals_data = [
            Hospital(
                id="HOSP-CITYCARE-01",
                name="CityCare General Hospital",
                short_name="CityCare General",
                trauma_level="Level 1 Trauma Center",
                operational_status="Operational",
                diversion_active=False,
                active_surge_level="Normal",
                total_bays=12,
                available_bays=5,
                coordinator_name="Dr. Sarah Jenkins",
                coordinator_role="ED Charge Physician",
                phone="+1 (555) 911-4001",
                address="450 Hospital Parkway, Metro City",
                latitude=37.7749,
                longitude=-122.4194,
                capabilities=[
                    {"name": "Level 1 Trauma Center", "badge": "L1 Trauma", "category": "trauma", "description": "24/7 dedicated surgical trauma resuscitation"},
                    {"name": "Comprehensive Stroke Center", "badge": "Stroke Ready", "category": "neuro", "description": "24/7 endovascular thrombectomy team"},
                    {"name": "24/7 STEMI PCI Center", "badge": "STEMI PCI", "category": "cardiac", "description": "Door-to-balloon target under 60 minutes"},
                    {"name": "Adult Burn Center", "badge": "Burn Center", "category": "burn", "description": "Dedicated burn ICU and grafting capability"},
                ],
            ),
            Hospital(
                id="HOSP-METRO-02",
                name="Metro Trauma Institute",
                short_name="Metro Trauma",
                trauma_level="Level 1 Comprehensive Trauma",
                operational_status="Operational",
                diversion_active=False,
                active_surge_level="Normal",
                total_bays=16,
                available_bays=8,
                coordinator_name="Dr. Marcus Vance",
                coordinator_role="Trauma Director",
                phone="+1 (555) 911-4002",
                address="800 University Blvd, Metro City",
                latitude=37.7833,
                longitude=-122.4167,
                capabilities=[
                    {"name": "Level 1 Trauma Center", "badge": "L1 Trauma", "category": "trauma"},
                    {"name": "Cardiothoracic Surgery", "badge": "Cardiac Surgery", "category": "cardiac"},
                ],
            ),
            Hospital(
                id="HOSP-STJUDE-03",
                name="St. Jude Memorial Hospital",
                short_name="St. Jude Memorial",
                trauma_level="Level 2 Trauma Center",
                operational_status="Limited",
                diversion_active=False,
                active_surge_level="Moderate",
                total_bays=10,
                available_bays=3,
                coordinator_name="Nurse Mgr. Elena Rostova",
                coordinator_role="ED Nursing Lead",
                phone="+1 (555) 911-4003",
                address="1200 St. Jude Way, Metro City",
                latitude=37.7650,
                longitude=-122.4300,
                capabilities=[
                    {"name": "Level 2 Trauma Center", "badge": "L2 Trauma", "category": "trauma"},
                    {"name": "Primary Stroke Center", "badge": "Stroke Ready", "category": "neuro"},
                ],
            ),
            Hospital(
                id="HOSP-VALLEY-04",
                name="Valley Children's Medical Center",
                short_name="Valley Children's",
                trauma_level="Pediatric Level 1 Trauma",
                operational_status="Operational",
                diversion_active=False,
                active_surge_level="Normal",
                total_bays=8,
                available_bays=4,
                coordinator_name="Dr. Amanda Chen",
                coordinator_role="Pediatric Emergency Lead",
                phone="+1 (555) 911-4004",
                address="220 Valley Road, Metro City",
                latitude=37.7500,
                longitude=-122.4100,
                capabilities=[
                    {"name": "Pediatric ICU", "badge": "PICU", "category": "pediatric"},
                    {"name": "Pediatric Trauma", "badge": "Peds L1", "category": "pediatric"},
                ],
            ),
            Hospital(
                id="HOSP-NORTH-05",
                name="Northside Community Hospital",
                short_name="Northside Community",
                trauma_level="Level 3 Emergency Care",
                operational_status="Diversion",
                diversion_active=True,
                active_surge_level="Surge Level 2",
                total_bays=6,
                available_bays=1,
                coordinator_name="Dr. Robert Taylor",
                coordinator_role="Medical Officer",
                phone="+1 (555) 911-4005",
                address="60 Northside Ave, Metro City",
                latitude=37.7950,
                longitude=-122.4000,
                capabilities=[
                    {"name": "Level 3 Emergency", "badge": "L3 ED", "category": "general"},
                ],
            ),
        ]
        db.add_all(hospitals_data)
        db.flush()

        # 2. Seed Hospital Resources for HOSP-CITYCARE-01
        resources_data = [
            HospitalResource(
                id="RES-BAY-01",
                hospital_id="HOSP-CITYCARE-01",
                name="Resuscitation Bay 1",
                category="Resuscitation Unit",
                status="Occupied",
                total_capacity=1,
                available_capacity=0,
                assigned_case_id="LS-2026-001",
                location="Trauma Wing A, Ground Floor",
                notes="Assigned to incoming MVA trauma (LS-2026-001). Trauma Team Alpha staging.",
                last_updated="Just now",
            ),
            HospitalResource(
                id="RES-BAY-02",
                hospital_id="HOSP-CITYCARE-01",
                name="Resuscitation Bay 2",
                category="Resuscitation Unit",
                status="Ready",
                total_capacity=1,
                available_capacity=1,
                location="Trauma Wing A, Ground Floor",
                notes="Fully prepped with ventilator and arterial line kit.",
                last_updated="2m ago",
            ),
            HospitalResource(
                id="RES-BAY-03",
                hospital_id="HOSP-CITYCARE-01",
                name="Emergency Bay 3",
                category="Emergency Bay",
                status="Ready",
                total_capacity=1,
                available_capacity=1,
                location="Acute Care Wing B",
                notes="Ready for acute non-resuscitation intake.",
                last_updated="5m ago",
            ),
            HospitalResource(
                id="RES-CATH-01",
                hospital_id="HOSP-CITYCARE-01",
                name="Cath Lab 1 (Cardiac Interventional)",
                category="Specialist Team",
                status="Occupied",
                total_capacity=1,
                available_capacity=0,
                assigned_case_id="LS-2026-002",
                location="Cardiology Suites, 2nd Floor",
                notes="Pre-activated for STEMI alert (LS-2026-002). Interventionalist scrubbed.",
                last_updated="Just now",
            ),
            HospitalResource(
                id="RES-CT-01",
                hospital_id="HOSP-CITYCARE-01",
                name="Trauma CT Scanner (Siemens 128-Slice)",
                category="Diagnostics / Imaging",
                status="Ready",
                total_capacity=1,
                available_capacity=1,
                location="Radiology Ground Floor (Adj to Trauma Bay)",
                notes="Cleared on standby for incoming trauma polytrauma protocol.",
                last_updated="1m ago",
            ),
            HospitalResource(
                id="RES-OR-02",
                hospital_id="HOSP-CITYCARE-01",
                name="Trauma OR 2",
                category="Specialist Team",
                status="Ready",
                total_capacity=1,
                available_capacity=1,
                location="Surgical Suite, 3rd Floor",
                notes="On surgical standby for emergency exploratory laparotomy.",
                last_updated="8m ago",
            ),
            HospitalResource(
                id="RES-BLOOD-01",
                hospital_id="HOSP-CITYCARE-01",
                name="O-Negative Emergency Transfusion Pack",
                category="Blood Bank",
                status="Ready",
                total_capacity=4,
                available_capacity=4,
                location="Blood Bank Rapid Dispense Locker",
                notes="4 units O-Neg uncrossmatched blood staged at Trauma Bay 1.",
                last_updated="Just now",
            ),
        ]
        db.add_all(resources_data)
        db.flush()

    # 3. Seed EMS Unit ALS-04
    existing_units = db.query(EMSUnit).count()
    if existing_units == 0:
        unit = EMSUnit(
            unit_id="ALS-04",
            unit_type="ALS (Advanced Life Support)",
            call_sign="Alpha-4-Medic",
            status="Transporting",
            lead_paramedic="Marcus Reed (Paramedic Lead)",
            driver_paramedic="Alex Rivera (Paramedic Driver)",
            contact_number="+1 (555) 019-4821",
            current_location_name="5th Ave & Market St, approaching CityCare Hospital",
            speed_kmh=48.0,
            fuel_percent=84,
        )
        db.add(unit)
        db.flush()

    # 4. Seed Baseline Emergency Cases
    existing_cases = db.query(EmergencyCase).count()
    if existing_cases == 0:
        now = utc_now()
        ten_mins_ago = now - datetime.timedelta(minutes=10)
        eight_mins_ago = now - datetime.timedelta(minutes=8)
        five_mins_ago = now - datetime.timedelta(minutes=5)
        two_mins_ago = now - datetime.timedelta(minutes=2)

        # Case 1: LS-2026-001 (Severe Polytrauma MVA)
        case_1 = EmergencyCase(
            case_id="LS-2026-001",
            incident_type="Severe Multi-Vehicle Collision",
            operational_priority="CRITICAL",
            status="TRANSPORTING",
            patient_count=1,
            patient_age=34,
            patient_sex="Male",
            reported_location="Interstate 95, Exit 42 Northbound",
            landmark="Near Mile Marker 42.5 overpass",
            latitude=37.7790,
            longitude=-122.4180,
            destination_hospital_id="HOSP-CITYCARE-01",
            assigned_unit_id="ALS-04",
            assigned_bay="RES-BAY-01",
            acknowledged_state="ACKNOWLEDGED",
            time_reported=ten_mins_ago,
            time_alerted=eight_mins_ago,
            time_acknowledged=five_mins_ago,
        )
        db.add(case_1)
        db.flush()

        # Reports & Vitals for Case 1
        cr_1 = CitizenReport(
            case_id=case_1.id,
            incident_category="Traffic / Road Accident",
            people_count=1,
            has_unconscious="Yes",
            is_awake="No",
            is_breathing="Yes",
            visible_concerns=["Unconscious individual", "Heavy vehicle damage", "Visible severe bleeding"],
            location_address="Interstate 95, Exit 42 Northbound",
            location_landmark="Near Mile Marker 42.5 overpass",
            latitude=37.7790,
            longitude=-122.4180,
            additional_notes="Car collided with divider at highway speed. Driver pinned in seat, breathing heavily with head injury.",
            source="CITIZEN_REPORTED",
            reported_at=ten_mins_ago,
        )
        db.add(cr_1)

        ev_1 = EMSVerification(
            case_id=case_1.id,
            consciousness="Not responding",
            breathing="Abnormal",
            bleeding="Present",
            airway="Compromised",
            clinical_notes="Patient extricated after 6-minute hydraulic tool cut. GCS 7 (E1V2M4). Bilateral breath sounds diminished right side. Needle decompression performed successfully on right 2nd ICS. Cervical collar applied, high-flow O2 via non-rebreather.",
            verified_by="Marcus Reed (Paramedic Lead)",
            verified_at=five_mins_ago,
            source="EMS_VERIFIED",
        )
        db.add(ev_1)

        vit_1 = EMSVitals(
            case_id=case_1.id,
            heart_rate=128,
            systolic_bp=88,
            diastolic_bp=54,
            oxygen_saturation=91,
            respiratory_rate=26,
            temperature=36.4,
            gcs=7,
            pain_score=8,
            blood_glucose=112,
            recorded_by="Alex Rivera (Paramedic Driver)",
            recorded_at=two_mins_ago,
            is_verified=True,
            source="EMS_VERIFIED",
        )
        db.add(vit_1)

        audit_1_1 = CaseAuditEvent(
            case_id=case_1.id,
            timestamp=ten_mins_ago,
            event_type="CASE_REPORTED",
            actor_type="CITIZEN",
            actor_name="Bystander Witness",
            previous_state=None,
            new_state="REPORTED",
            title="Emergency Incident Reported",
            description="Bystander reported high-speed vehicle collision with trapped unresponsive driver.",
            event_metadata={"people_count": 1, "unconscious": "Yes"},
        )
        audit_1_2 = CaseAuditEvent(
            case_id=case_1.id,
            timestamp=eight_mins_ago,
            event_type="STATE_EMS_ACCEPTED",
            actor_type="EMS",
            actor_name="ALS-04 Paramedic Crew",
            previous_state="EMS_ASSIGNED",
            new_state="EMS_ACCEPTED",
            title="EMS Unit ALS-04 Accepted Call",
            description="ALS-04 dispatched and en route to scene.",
            event_metadata={"unit_id": "ALS-04"},
        )
        audit_1_3 = CaseAuditEvent(
            case_id=case_1.id,
            timestamp=five_mins_ago,
            event_type="HOSPITAL_ACKNOWLEDGED",
            actor_type="HOSPITAL",
            actor_name="Dr. Sarah Jenkins",
            previous_state="HOSPITAL_ALERTED",
            new_state="HOSPITAL_ACKNOWLEDGED",
            title="CityCare General Acknowledged Pre-Arrival Alert",
            description="Trauma Bay 1 staged. Trauma surgical team activated.",
            event_metadata={"assigned_bay": "RES-BAY-01"},
        )
        db.add_all([audit_1_1, audit_1_2, audit_1_3])

        # Case 2: LS-2026-002 (STEMI)
        case_2 = EmergencyCase(
            case_id="LS-2026-002",
            incident_type="Acute ST-Elevation Myocardial Infarction (STEMI)",
            operational_priority="CRITICAL",
            status="TRANSPORTING",
            patient_count=1,
            patient_age=58,
            patient_sex="Male",
            reported_location="742 Evergreen Terrace",
            landmark="Residential single family home",
            latitude=37.7710,
            longitude=-122.4220,
            destination_hospital_id="HOSP-CITYCARE-01",
            assigned_unit_id="ALS-02",
            assigned_bay="RES-CATH-01",
            acknowledged_state="ACKNOWLEDGED",
            time_reported=now - datetime.timedelta(minutes=15),
            time_alerted=now - datetime.timedelta(minutes=12),
            time_acknowledged=now - datetime.timedelta(minutes=10),
        )
        db.add(case_2)
        db.flush()

        cr_2 = CitizenReport(
            case_id=case_2.id,
            incident_category="Chest Pain / Cardiac",
            people_count=1,
            has_unconscious="No",
            is_awake="Yes",
            is_breathing="Yes",
            visible_concerns=["Severe crushing chest pressure", "Shortness of breath", "Diaphoresis"],
            location_address="742 Evergreen Terrace",
            source="CITIZEN_REPORTED",
            reported_at=now - datetime.timedelta(minutes=15),
        )
        db.add(cr_2)

        ev_2 = EMSVerification(
            case_id=case_2.id,
            consciousness="Responding",
            breathing="Normal",
            bleeding="Not present",
            airway="Patent",
            clinical_notes="12-Lead ECG confirmed 4mm ST elevation in leads II, III, aVF (Inferior STEMI). Aspirin 324mg PO given. Sublingual nitroglycerin 0.4mg administered x1. Heparin bolus prepared.",
            verified_by="Paramedic Jordan Lee",
            verified_at=now - datetime.timedelta(minutes=11),
            source="EMS_VERIFIED",
        )
        db.add(ev_2)

        vit_2 = EMSVitals(
            case_id=case_2.id,
            heart_rate=104,
            systolic_bp=142,
            diastolic_bp=92,
            oxygen_saturation=96,
            respiratory_rate=20,
            temperature=36.8,
            gcs=15,
            pain_score=7,
            blood_glucose=140,
            recorded_by="Paramedic Jordan Lee",
            recorded_at=now - datetime.timedelta(minutes=9),
            is_verified=True,
            source="EMS_VERIFIED",
        )
        db.add(vit_2)

        # Case 3: LS-2026-003 (Stroke)
        case_3 = EmergencyCase(
            case_id="LS-2026-003",
            incident_type="Acute Ischemic Stroke (LVO Suspected)",
            operational_priority="HIGH",
            status="HOSPITAL_ALERTED",
            patient_count=1,
            patient_age=67,
            patient_sex="Female",
            reported_location="1204 Pine Ridge Road",
            destination_hospital_id="HOSP-CITYCARE-01",
            assigned_unit_id="BLS-09",
            acknowledged_state="PENDING",
            time_reported=now - datetime.timedelta(minutes=20),
            time_alerted=now - datetime.timedelta(minutes=6),
        )
        db.add(case_3)
        db.flush()

        cr_3 = CitizenReport(
            case_id=case_3.id,
            incident_category="Stroke / Neurological",
            people_count=1,
            has_unconscious="No",
            is_awake="Yes",
            is_breathing="Yes",
            visible_concerns=["Sudden right facial droop", "Right arm weakness", "Slurred speech"],
            location_address="1204 Pine Ridge Road",
            source="CITIZEN_REPORTED",
            reported_at=now - datetime.timedelta(minutes=20),
        )
        db.add(cr_3)

        # Case 4: LS-2026-101 (Pure Citizen Report - No Hospital Alerted)
        case_4 = EmergencyCase(
            case_id="LS-2026-101",
            incident_type="Pedestrian Struck by Vehicle",
            operational_priority="HIGH",
            status="REPORTED",
            patient_count=1,
            reported_location="Market St & 4th Ave, Downtown",
            landmark="In front of central metro station exit",
            latitude=37.7850,
            longitude=-122.4060,
            destination_hospital_id=None,
            acknowledged_state=None,
            time_reported=now - datetime.timedelta(minutes=4),
        )
        db.add(case_4)
        db.flush()

        cr_4 = CitizenReport(
            case_id=case_4.id,
            incident_category="Pedestrian Struck by Vehicle",
            people_count=1,
            has_unconscious="No",
            is_awake="Yes",
            is_breathing="Yes",
            visible_concerns=["Pedestrian on pavement", "Leg fracture suspected", "Crowd gathering"],
            location_address="Market St & 4th Ave, Downtown",
            location_landmark="In front of central metro station exit",
            latitude=37.7850,
            longitude=-122.4060,
            additional_notes="Pedestrian hit by bicycle/scooter at crossing. Conscious and talking, complains of right leg pain.",
            source="CITIZEN_REPORTED",
            reported_at=now - datetime.timedelta(minutes=4),
        )
        db.add(cr_4)

        audit_4 = CaseAuditEvent(
            case_id=case_4.id,
            timestamp=now - datetime.timedelta(minutes=4),
            event_type="CASE_REPORTED",
            actor_type="CITIZEN",
            actor_name="Citizen Reporter",
            previous_state=None,
            new_state="REPORTED",
            title="Emergency Incident Reported",
            description="Bystander submitted report for Pedestrian Struck by Vehicle at Market St & 4th Ave.",
            event_metadata={"people_count": 1},
        )
        db.add(audit_4)
        db.commit()

    # 5. Seed AI Structured Reports for Baseline Cases if not present
    existing_ai_reports = db.query(AIStructuredReport).count()
    if existing_ai_reports == 0:
        c1 = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-001").first()
        c2 = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-002").first()
        c3 = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-003").first()
        c4 = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-101").first()

        now = utc_now()
        nine_mins_ago = now - datetime.timedelta(minutes=9)
        fourteen_mins_ago = now - datetime.timedelta(minutes=14)
        nineteen_mins_ago = now - datetime.timedelta(minutes=19)
        three_mins_ago = now - datetime.timedelta(minutes=3)

        if c1:
            cr1 = db.query(CitizenReport).filter(CitizenReport.case_id == c1.id).first()
            if cr1:
                ai_1 = AIStructuredReport(
                    case_id=c1.id,
                    citizen_report_id=cr1.id,
                    incident_summary="Reported Severe Multi-Vehicle Collision involving 1 person. Initial bystander status: consciousness reported as 'Unresponsive', breathing reported as 'Difficulty Breathing'. Observed concerns include: Heavy vehicle damage, Severe Bleeding Observed, Trapped / Vehicle Extrication Required.",
                    incident_category="TRAUMA_MVA",
                    people_count=1,
                    consciousness="Unresponsive",
                    breathing="Difficulty Breathing",
                    visible_concerns=["Heavy vehicle damage", "Severe Bleeding Observed", "Vehicle Extrication Required", "Head Trauma Suspected"],
                    location_summary="Interstate 95, Exit 42 Northbound (Near: Mile Marker 42.5 overpass)",
                    extracted_keywords=["accident", "pinned", "bleeding", "unconscious", "head", "injury", "highway"],
                    uncertainty_flags=["Bystander expresses uncertainty about patient responsiveness depth"],
                    missing_information=["Definitive responsiveness check pending EMS arrival", "Accurate respiratory rate and airway assessment"],
                    confidence_score=0.88,
                    source="AI_STRUCTURED",
                    model_name="lifesync-nlp-local-v1",
                    model_version="1.2.0",
                    prompt_version="v1.2",
                    status="COMPLETED",
                    structured_payload={
                        "incident_summary": "Reported Severe Multi-Vehicle Collision involving 1 person.",
                        "incident_category": "TRAUMA_MVA",
                        "people_count": 1,
                        "consciousness": "Unresponsive",
                        "breathing": "Difficulty Breathing",
                        "confidence_score": 0.88,
                    },
                    generated_at=nine_mins_ago,
                )
                audit_ai_1 = CaseAuditEvent(
                    case_id=c1.id,
                    timestamp=nine_mins_ago,
                    event_type="AI_STRUCTURING_COMPLETED",
                    actor_type="SYSTEM",
                    actor_name="AI Engine (lifesync-nlp-local-v1)",
                    title="AI Structured Emergency Report Created",
                    description="Automated information structuring completed with extraction confidence 0.88.",
                    new_state=c1.status,
                    event_metadata={"model_version": "1.2.0", "confidence_score": 0.88, "source": "AI_STRUCTURED"},
                )
                db.add_all([ai_1, audit_ai_1])

        if c2:
            cr2 = db.query(CitizenReport).filter(CitizenReport.case_id == c2.id).first()
            if cr2:
                ai_2 = AIStructuredReport(
                    case_id=c2.id,
                    citizen_report_id=cr2.id,
                    incident_summary="Reported Cardiac Chest Pain involving 1 person. Initial bystander status: consciousness reported as 'Responding', breathing reported as 'Difficulty Breathing'. Observed concerns include: Reported Chest Discomfort, Diaphoresis / Heavy Sweating.",
                    incident_category="CARDIAC_CHEST_PAIN",
                    people_count=1,
                    consciousness="Responding",
                    breathing="Difficulty Breathing",
                    visible_concerns=["Reported Chest Discomfort", "Diaphoresis / Heavy Sweating", "Shortness of Breath"],
                    location_summary="742 Evergreen Terrace",
                    extracted_keywords=["chest", "pressure", "sweating", "pain", "breathing"],
                    uncertainty_flags=["Visual assessment is approximate / unverified by medical personnel"],
                    missing_information=["12-Lead ECG confirmation pending EMS evaluation"],
                    confidence_score=0.92,
                    source="AI_STRUCTURED",
                    model_name="lifesync-nlp-local-v1",
                    model_version="1.2.0",
                    prompt_version="v1.2",
                    status="COMPLETED",
                    structured_payload={"incident_category": "CARDIAC_CHEST_PAIN", "confidence_score": 0.92},
                    generated_at=fourteen_mins_ago,
                )
                db.add(ai_2)

        if c3:
            cr3 = db.query(CitizenReport).filter(CitizenReport.case_id == c3.id).first()
            if cr3:
                ai_3 = AIStructuredReport(
                    case_id=c3.id,
                    citizen_report_id=cr3.id,
                    incident_summary="Reported Neurological Deficit involving 1 person. Initial bystander status: consciousness reported as 'Responding', breathing reported as 'Normal'. Observed concerns include: Facial asymmetry, Arm weakness, Speech difficulty.",
                    incident_category="NEUROLOGICAL_DEFICIT",
                    people_count=1,
                    consciousness="Responding",
                    breathing="Normal",
                    visible_concerns=["Facial asymmetry", "Arm weakness", "Slurred speech"],
                    location_summary="1204 Pine Ridge Road",
                    extracted_keywords=["droop", "weakness", "speech", "stroke"],
                    uncertainty_flags=["Last known well time approximate based on caller narrative"],
                    missing_information=["Exact stroke onset timeline verification"],
                    confidence_score=0.90,
                    source="AI_STRUCTURED",
                    model_name="lifesync-nlp-local-v1",
                    model_version="1.2.0",
                    prompt_version="v1.2",
                    status="COMPLETED",
                    structured_payload={"incident_category": "NEUROLOGICAL_DEFICIT", "confidence_score": 0.90},
                    generated_at=nineteen_mins_ago,
                )
                db.add(ai_3)

        if c4:
            cr4 = db.query(CitizenReport).filter(CitizenReport.case_id == c4.id).first()
            if cr4:
                ai_4 = AIStructuredReport(
                    case_id=c4.id,
                    citizen_report_id=cr4.id,
                    incident_summary="Reported Pedestrian Struck by Vehicle involving 1 person. Initial bystander status: consciousness reported as 'Responding', breathing reported as 'Normal'. Observed concerns include: Pedestrian on pavement, Suspected Fracture.",
                    incident_category="TRAUMA_GENERAL",
                    people_count=1,
                    consciousness="Responding",
                    breathing="Normal",
                    visible_concerns=["Pedestrian on pavement", "Suspected Fracture", "Crowd gathering"],
                    location_summary="Market St & 4th Ave, Downtown (Near: Central metro station exit)",
                    extracted_keywords=["pedestrian", "bicycle", "crossing", "conscious", "leg", "pain"],
                    uncertainty_flags=["Bystander notes unverified by medical personnel"],
                    missing_information=["Definitive orthopedic assessment pending EMS on-scene verification"],
                    confidence_score=0.86,
                    source="AI_STRUCTURED",
                    model_name="lifesync-nlp-local-v1",
                    model_version="1.2.0",
                    prompt_version="v1.2",
                    status="COMPLETED",
                    structured_payload={"incident_category": "TRAUMA_GENERAL", "confidence_score": 0.86},
                    generated_at=three_mins_ago,
                )
                db.add(ai_4)

        db.commit()



def init_db_and_seed():
    """Create all tables and seed data if not present."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


if __name__ == "__main__":
    init_db_and_seed()
    print("Database schema created and seed data loaded successfully.")
