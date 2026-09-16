import uuid
import datetime
from sqlalchemy.orm import Session
from app.models.emergency_case import EmergencyCase
from app.models.citizen_report import CitizenReport
from app.models.base import utc_now
from app.schemas.citizen import CitizenReportCreate
from app.services.audit_service import create_audit_event


def generate_human_case_id(db: Session) -> str:
    """
    Generate sequential human-readable emergency case ID, e.g., LS-2026-102.
    """
    year = datetime.datetime.now(datetime.timezone.utc).year
    prefix = f"LS-{year}-"
    # Find count or highest number
    count = db.query(EmergencyCase).filter(EmergencyCase.case_id.like(f"{prefix}%")).count()
    next_num = count + 101
    candidate = f"{prefix}{next_num:03d}"
    
    # Ensure uniqueness
    while db.query(EmergencyCase).filter(EmergencyCase.case_id == candidate).first() is not None:
        next_num += 1
        candidate = f"{prefix}{next_num:03d}"
    
    return candidate


def create_citizen_case_and_report(db: Session, report_data: CitizenReportCreate) -> EmergencyCase:
    """
    Atomically creates a new emergency case in 'REPORTED' status and attaches the CitizenReport.
    Follows strict safety boundaries: No automatic hospital pre-alert is triggered in Step 5.
    Creates the immutable initial audit trail event.
    """
    case_id_code = generate_human_case_id(db)

    # Determine initial operational priority from bystander flags
    is_critical = (
        report_data.has_unconscious.lower() == "yes" or
        report_data.is_breathing.lower() == "no" or
        report_data.is_awake.lower() == "no" or
        any("unconscious" in c.lower() or "severe" in c.lower() for c in report_data.visible_concerns)
    )
    priority = "CRITICAL" if is_critical else "HIGH"

    emergency_case = EmergencyCase(
        case_id=case_id_code,
        incident_type=report_data.incident_category,
        operational_priority=priority,
        status="REPORTED",
        patient_count=report_data.people_count,
        reported_location=report_data.location_address,
        landmark=report_data.location_landmark,
        latitude=report_data.latitude,
        longitude=report_data.longitude,
        time_reported=utc_now(),
    )
    db.add(emergency_case)
    db.flush()  # Populates emergency_case.id (UUID)

    citizen_report = CitizenReport(
        case_id=emergency_case.id,
        incident_category=report_data.incident_category,
        people_count=report_data.people_count,
        has_unconscious=report_data.has_unconscious,
        is_awake=report_data.is_awake,
        is_breathing=report_data.is_breathing,
        visible_concerns=report_data.visible_concerns,
        location_address=report_data.location_address,
        location_landmark=report_data.location_landmark,
        latitude=report_data.latitude,
        longitude=report_data.longitude,
        additional_notes=report_data.additional_notes,
        source="CITIZEN_REPORTED",
        reported_at=utc_now(),
    )
    db.add(citizen_report)

    # Initial audit log
    create_audit_event(
        db=db,
        case_id=emergency_case.id,
        event_type="CASE_REPORTED",
        actor_type="CITIZEN",
        actor_name="Citizen Bystander",
        previous_state=None,
        new_state="REPORTED",
        title="Emergency Case Reported",
        description=f"Citizen bystander reported emergency '{report_data.incident_category}' at {report_data.location_address}.",
        event_metadata={
            "people_count": report_data.people_count,
            "has_unconscious": report_data.has_unconscious,
            "is_awake": report_data.is_awake,
            "is_breathing": report_data.is_breathing,
            "visible_concerns": report_data.visible_concerns,
        },
    )

    db.commit()
    db.refresh(emergency_case)
    return emergency_case
