from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.emergency_case import EmergencyCase
from app.models.hospital import Hospital, HospitalResource
from app.models.base import utc_now
from app.schemas.hospital import (
    HospitalAcknowledgeRequest,
    HospitalDivertRequest,
    HospitalResourceUpdate,
    HospitalBayAllocationRequest,
    HospitalReadinessChecklistUpdateRequest,
    HospitalSettingsUpdate,
)
from app.schemas.readiness import ReadinessSummaryResponse
from app.services.case_service import get_case_by_identifier, update_case_lifecycle_state
from app.services.audit_service import create_audit_event
from app.realtime.events import publish_case_event
from app.realtime.schemas import RealtimeEventType, ProvenanceSource


HOSPITAL_ID_ALIAS_MAP = {
    "HOSP-01": "HOSP-CITYCARE-01",
    "HOSP-APEX-01": "HOSP-CITYCARE-01",
    "HOSP-02": "HOSP-METRO-02",
    "HOSP-CITY-02": "HOSP-METRO-02",
    "HOSP-03": "HOSP-STJUDE-03",
    "HOSP-NEURO-03": "HOSP-STJUDE-03",
    "HOSP-04": "HOSP-VALLEY-04",
    "HOSP-05": "HOSP-NORTH-05",
}


def resolve_hospital_id(hospital_id: str) -> str:
    """Resolve aliases like HOSP-01 or HOSP-APEX-01 to canonical database ID."""
    return HOSPITAL_ID_ALIAS_MAP.get(hospital_id.upper(), hospital_id)


def list_hospitals(db: Session) -> List[Hospital]:
    """Retrieve all hospital facilities."""
    return db.query(Hospital).all()


def get_hospital_by_id(db: Session, hospital_id: str) -> Optional[Hospital]:
    """Retrieve a hospital facility by unique ID or canonical alias."""
    canonical_id = resolve_hospital_id(hospital_id)
    return db.query(Hospital).filter(
        (Hospital.id == hospital_id) | (Hospital.id == canonical_id)
    ).first()


def list_hospital_cases(
    db: Session,
    hospital_id: str,
    status: Optional[str] = None,
) -> List[EmergencyCase]:
    """
    List emergency cases directed to or inbound to a specific hospital.
    """
    canonical_id = resolve_hospital_id(hospital_id)
    ids = list(set([hospital_id, canonical_id]))
    query = db.query(EmergencyCase).filter(
        EmergencyCase.destination_hospital_id.in_(ids)
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


def allocate_bay_to_case(
    db: Session,
    hospital_id: str,
    case_identifier: str,
    allocation_data: HospitalBayAllocationRequest,
) -> EmergencyCase:
    """
    Allocates an available resuscitation or emergency bay to an inbound case.
    Prevents assignment if bay is Occupied, Cleaning, or Unavailable (Conflict Prevention).
    """
    case = get_case_by_identifier(db, case_identifier)
    if not case:
        raise ValueError(f"Emergency case '{case_identifier}' not found.")

    resource = db.query(HospitalResource).filter(
        HospitalResource.hospital_id == hospital_id,
        (HospitalResource.id == allocation_data.bay_id) | (HospitalResource.name == allocation_data.bay_id),
    ).first()

    if not resource:
        raise ValueError(f"Hospital resource '{allocation_data.bay_id}' not found at {hospital_id}.")

    # Conflict Prevention check
    if resource.status.lower() in ("occupied", "cleaning", "unavailable", "maintenance") or resource.available_capacity <= 0:
        raise ValueError(
            f"Resource '{resource.name}' cannot be assigned: currently '{resource.status}' with available capacity {resource.available_capacity}."
        )

    # Reserve the bay
    resource.status = "Occupied"
    resource.available_capacity = 0
    resource.assigned_case_id = case.case_id
    resource.last_updated = "Just now"

    case.assigned_bay = resource.name

    create_audit_event(
        db=db,
        case_id=case.id,
        event_type="BAY_ASSIGNED",
        actor_type="HOSPITAL",
        actor_name=allocation_data.allocated_by,
        title="Emergency Bay Allocated",
        description=f"Allocated {resource.name} ({resource.category}) at {resource.location} to {case.case_id}. Notes: {allocation_data.notes or 'None'}.",
        event_metadata={
            "hospital_id": hospital_id,
            "resource_id": resource.id,
            "resource_name": resource.name,
            "allocated_by": allocation_data.allocated_by,
            "notes": allocation_data.notes,
        },
    )

    db.commit()
    db.refresh(case)

    publish_case_event(
        case_id=case.case_id,
        event_type=RealtimeEventType.BAY_ASSIGNED,
        source=ProvenanceSource.HOSPITAL_VERIFIED,
        payload={
            "case_id": case.case_id,
            "hospital_id": hospital_id,
            "assigned_bay": resource.name,
            "resource_id": resource.id,
            "allocated_by": allocation_data.allocated_by,
        },
    )

    return case


def update_readiness_checklist(
    db: Session,
    hospital_id: str,
    case_identifier: str,
    checklist_data: HospitalReadinessChecklistUpdateRequest,
) -> EmergencyCase:
    """
    Updates operational readiness checklist task and logs audit event.
    """
    case = get_case_by_identifier(db, case_identifier)
    if not case:
        raise ValueError(f"Emergency case '{case_identifier}' not found.")

    create_audit_event(
        db=db,
        case_id=case.id,
        event_type="READINESS_CHECKLIST_UPDATED",
        actor_type="HOSPITAL",
        actor_name=checklist_data.updated_by,
        title=f"Readiness Task: {checklist_data.checklist_item}",
        description=f"{checklist_data.updated_by} marked '{checklist_data.checklist_item}' as {'Completed' if checklist_data.is_completed else 'Pending'}. Notes: {checklist_data.notes or 'None'}.",
        event_metadata={
            "hospital_id": hospital_id,
            "checklist_item": checklist_data.checklist_item,
            "is_completed": checklist_data.is_completed,
            "updated_by": checklist_data.updated_by,
            "notes": checklist_data.notes,
        },
    )

    db.commit()
    db.refresh(case)

    publish_case_event(
        case_id=case.case_id,
        event_type=RealtimeEventType.HOSPITAL_READINESS_UPDATED,
        source=ProvenanceSource.HOSPITAL_VERIFIED,
        payload={
            "case_id": case.case_id,
            "hospital_id": hospital_id,
            "checklist_item": checklist_data.checklist_item,
            "is_completed": checklist_data.is_completed,
            "updated_by": checklist_data.updated_by,
        },
    )

    return case


def update_hospital_settings(
    db: Session,
    hospital_id: str,
    settings: HospitalSettingsUpdate,
) -> Optional[Hospital]:
    """
    Updates hospital operational capacity, diversion status, and surge level for demo scenarios.
    """
    hospital = get_hospital_by_id(db, hospital_id)
    if not hospital:
        return None

    if settings.operational_status is not None:
        hospital.operational_status = settings.operational_status
    if settings.diversion_active is not None:
        hospital.diversion_active = settings.diversion_active
    if settings.active_surge_level is not None:
        hospital.active_surge_level = settings.active_surge_level
    if settings.total_bays is not None:
        hospital.total_bays = settings.total_bays
    if settings.available_bays is not None:
        hospital.available_bays = settings.available_bays

    db.commit()
    db.refresh(hospital)
    return hospital

