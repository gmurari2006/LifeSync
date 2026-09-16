from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.emergency_case import EmergencyCase
from app.models.hospital import Hospital, HospitalResource
from app.models.base import utc_now
from app.schemas.hospital import (
    HospitalAcknowledgeRequest,
    HospitalDivertRequest,
    HospitalResourceUpdate,
)
from app.schemas.readiness import ReadinessSummaryResponse
from app.services.case_service import get_case_by_identifier, update_case_lifecycle_state
from app.services.audit_service import create_audit_event
from app.realtime.events import publish_case_event
from app.realtime.schemas import RealtimeEventType, ProvenanceSource


def list_hospitals(db: Session) -> List[Hospital]:
    """Retrieve all hospital facilities."""
    return db.query(Hospital).all()


def get_hospital_by_id(db: Session, hospital_id: str) -> Optional[Hospital]:
    """Retrieve a hospital facility by unique ID."""
    return db.query(Hospital).filter(Hospital.id == hospital_id).first()


def list_hospital_cases(
    db: Session,
    hospital_id: str,
    status: Optional[str] = None,
) -> List[EmergencyCase]:
    """
    List emergency cases directed to or inbound to a specific hospital.
    """
    query = db.query(EmergencyCase).filter(
        EmergencyCase.destination_hospital_id == hospital_id
    )
    if status:
        query = query.filter(EmergencyCase.status == status.upper())
    return query.order_by(EmergencyCase.time_reported.desc()).all()


def acknowledge_incoming_case(
    db: Session,
    hospital_id: str,
    case_identifier: str,
    ack_data: HospitalAcknowledgeRequest,
) -> EmergencyCase:
    """
    Hospital acknowledges incoming patient, optionally assigns an ED bay, and advances case lifecycle.
    """
    case = get_case_by_identifier(db, case_identifier)
    if not case:
        raise ValueError(f"Emergency case '{case_identifier}' not found.")

    case.destination_hospital_id = hospital_id
    case.acknowledged_state = "ACKNOWLEDGED"
    case.time_acknowledged = utc_now()

    if ack_data.assigned_bay:
        case.assigned_bay = ack_data.assigned_bay
        # Also update matching resource status if found
        resource = db.query(HospitalResource).filter(
            HospitalResource.hospital_id == hospital_id,
            (HospitalResource.id == ack_data.assigned_bay) | (HospitalResource.name == ack_data.assigned_bay)
        ).first()
        if resource:
            resource.status = "Occupied"
            resource.assigned_case_id = case.case_id
            resource.last_updated = "Just now"

    # Advance state if currently in HOSPITAL_ALERTED or TRANSPORTING
    if case.status in ("HOSPITAL_ALERTED", "TRANSPORTING"):
        try:
            update_case_lifecycle_state(
                db=db,
                case_identifier=case.id,
                target_status="HOSPITAL_ACKNOWLEDGED",
                actor_type="HOSPITAL",
                actor_name=ack_data.acknowledged_by,
                notes=f"Hospital acknowledged case. Bay: {ack_data.assigned_bay or 'Unassigned'}. Notes: {ack_data.notes or 'None'}",
            )
        except Exception:
            pass

    create_audit_event(
        db=db,
        case_id=case.id,
        event_type="HOSPITAL_ACKNOWLEDGED",
        actor_type="HOSPITAL",
        actor_name=ack_data.acknowledged_by,
        title="Hospital Pre-Arrival Alert Acknowledged",
        description=f"Hospital {hospital_id} acknowledged arrival. Assigned Bay: {ack_data.assigned_bay or 'None'}.",
        event_metadata={
            "hospital_id": hospital_id,
            "assigned_bay": ack_data.assigned_bay,
            "notes": ack_data.notes,
        },
    )

    db.commit()
    db.refresh(case)

    # Broadcast hospital acknowledgement
    publish_case_event(
        case_id=case.case_id,
        event_type=RealtimeEventType.HOSPITAL_ACKNOWLEDGED,
        source=ProvenanceSource.HOSPITAL_VERIFIED,
        payload={
            "case_id": case.case_id,
            "hospital_id": hospital_id,
            "acknowledged_state": "ACKNOWLEDGED",
            "assigned_bay": case.assigned_bay,
            "acknowledged_by": ack_data.acknowledged_by,
            "notes": ack_data.notes,
        },
    )

    # Also broadcast bay assignment if bay specified
    if ack_data.assigned_bay:
        publish_case_event(
            case_id=case.case_id,
            event_type=RealtimeEventType.BAY_ASSIGNED,
            source=ProvenanceSource.HOSPITAL_VERIFIED,
            payload={
                "case_id": case.case_id,
                "hospital_id": hospital_id,
                "assigned_bay": ack_data.assigned_bay,
            },
        )

    return case


def divert_incoming_case(
    db: Session,
    hospital_id: str,
    case_identifier: str,
    divert_data: HospitalDivertRequest,
) -> EmergencyCase:
    """
    Hospital issues diversion for incoming emergency with mandatory structured reason code.
    """
    case = get_case_by_identifier(db, case_identifier)
    if not case:
        raise ValueError(f"Emergency case '{case_identifier}' not found.")

    case.acknowledged_state = "DIVERTED"

    update_case_lifecycle_state(
        db=db,
        case_identifier=case.id,
        target_status="DIVERTED",
        actor_type="HOSPITAL",
        actor_name=divert_data.diverted_by,
        notes=f"Hospital diversion requested. Code: {divert_data.divert_reason_code}. Reason: {divert_data.divert_notes or 'None'}",
    )

    create_audit_event(
        db=db,
        case_id=case.id,
        event_type="HOSPITAL_DIVERTED",
        actor_type="HOSPITAL",
        actor_name=divert_data.diverted_by,
        title="Hospital Diverted Case",
        description=f"Hospital {hospital_id} triggered diversion. Reason Code: {divert_data.divert_reason_code}. Justification: {divert_data.divert_notes or 'None'}.",
        event_metadata={
            "hospital_id": hospital_id,
            "divert_reason_code": divert_data.divert_reason_code,
            "divert_notes": divert_data.divert_notes,
        },
    )

    db.commit()
    db.refresh(case)

    publish_case_event(
        case_id=case.case_id,
        event_type=RealtimeEventType.HOSPITAL_DIVERSION_REQUESTED,
        source=ProvenanceSource.HOSPITAL_VERIFIED,
        payload={
            "case_id": case.case_id,
            "hospital_id": hospital_id,
            "divert_reason_code": divert_data.divert_reason_code,
            "divert_notes": divert_data.divert_notes,
        },
    )

    return case


def get_hospital_readiness_summary(
    db: Session,
    hospital_id: str,
) -> Optional[ReadinessSummaryResponse]:
    """
    Retrieve aggregated resource readiness overview for a hospital.
    """
    hospital = get_hospital_by_id(db, hospital_id)
    if not hospital:
        return None

    resources = db.query(HospitalResource).filter(
        HospitalResource.hospital_id == hospital_id
    ).all()

    return ReadinessSummaryResponse(
        hospital_id=hospital.id,
        hospital_name=hospital.name,
        operational_status=hospital.operational_status,
        diversion_active=hospital.diversion_active,
        total_bays=hospital.total_bays,
        available_bays=hospital.available_bays,
        resources=resources,
    )


def update_hospital_resource(
    db: Session,
    hospital_id: str,
    resource_id: str,
    update_data: HospitalResourceUpdate,
) -> Optional[HospitalResource]:
    """
    Update status, capacity, or assignment for a hospital readiness resource.
    """
    resource = db.query(HospitalResource).filter(
        HospitalResource.hospital_id == hospital_id,
        HospitalResource.id == resource_id,
    ).first()

    if not resource:
        return None

    if update_data.status is not None:
        resource.status = update_data.status
    if update_data.available_capacity is not None:
        resource.available_capacity = update_data.available_capacity
    if update_data.assigned_case_id is not None:
        resource.assigned_case_id = update_data.assigned_case_id
    if update_data.notes is not None:
        resource.notes = update_data.notes

    resource.last_updated = "Just now"
    db.commit()
    db.refresh(resource)
    return resource
