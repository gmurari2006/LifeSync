from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.emergency_case import EmergencyCase
from app.models.ems import EMSVerification, EMSVitals, EMSUnit
from app.models.base import utc_now
from app.schemas.ems import (
    EMSVerificationCreate,
    EMSVitalsCreate,
    EMSTransportStatusUpdate,
    EMSHandoverCompleteRequest,
)
from app.services.case_service import get_case_by_identifier, update_case_lifecycle_state
from app.services.audit_service import create_audit_event
from app.realtime.events import publish_case_event
from app.realtime.schemas import RealtimeEventType, ProvenanceSource


def list_ems_cases(
    db: Session,
    unit_id: Optional[str] = None,
    status: Optional[str] = None,
) -> List[EmergencyCase]:
    """
    List emergency cases relevant to responding EMS crews.
    """
    query = db.query(EmergencyCase)
    if unit_id:
        query = query.filter(EmergencyCase.assigned_unit_id == unit_id)
    if status:
        query = query.filter(EmergencyCase.status == status.upper())
    return query.order_by(EmergencyCase.time_reported.desc()).all()


def record_ems_verification(
    db: Session,
    case_identifier: str,
    verification: EMSVerificationCreate,
) -> EMSVerification:
    """
    Store verified on-scene clinical observations by paramedics with strict EMS_VERIFIED source provenance.
    """
    case = get_case_by_identifier(db, case_identifier)
    if not case:
        raise ValueError(f"Emergency case '{case_identifier}' not found.")

    ems_ver = EMSVerification(
        case_id=case.id,
        consciousness=verification.consciousness,
        breathing=verification.breathing,
        bleeding=verification.bleeding,
        airway=verification.airway,
        clinical_notes=verification.clinical_notes,
        verified_by=verification.verified_by,
        verified_at=utc_now(),
        source="EMS_VERIFIED",
    )
    db.add(ems_ver)

    # Transition to ASSESSMENT_UPDATED if permitted and currently ON_SCENE
    if case.status == "ON_SCENE":
        try:
            update_case_lifecycle_state(
                db=db,
                case_identifier=case.id,
                target_status="ASSESSMENT_UPDATED",
                actor_type="EMS",
                actor_name=verification.verified_by,
                notes="EMS recorded clinical verification.",
            )
        except Exception:
            pass  # State already advanced

    create_audit_event(
        db=db,
        case_id=case.id,
        event_type="CLINICAL_VERIFICATION_RECORDED",
        actor_type="EMS",
        actor_name=verification.verified_by,
        title="Paramedic Clinical Verification Recorded",
        description=f"EMS verified: Consciousness={verification.consciousness}, Breathing={verification.breathing}, Bleeding={verification.bleeding}, Airway={verification.airway}.",
        event_metadata={
            "consciousness": verification.consciousness,
            "breathing": verification.breathing,
            "bleeding": verification.bleeding,
            "airway": verification.airway,
            "notes": verification.clinical_notes,
        },
    )

    db.commit()
    db.refresh(ems_ver)

    # Publish delivery-only WebSocket notification
    publish_case_event(
        case_id=case.case_id,
        event_type=RealtimeEventType.EMS_STATUS_UPDATED,
        source=ProvenanceSource.EMS_VERIFIED,
        payload={
            "case_id": case.case_id,
            "status": case.status,
            "verification": {
                "consciousness": ems_ver.consciousness,
                "breathing": ems_ver.breathing,
                "bleeding": ems_ver.bleeding,
                "airway": ems_ver.airway,
                "clinical_notes": ems_ver.clinical_notes,
                "verified_by": ems_ver.verified_by,
                "verified_at": ems_ver.verified_at.isoformat() if ems_ver.verified_at else None,
                "source": "EMS_VERIFIED",
            },
        },
    )

    return ems_ver


def record_ems_vitals(
    db: Session,
    case_identifier: str,
    vitals: EMSVitalsCreate,
) -> EMSVitals:
    """
    Store streamed vital signs with strict EMS_VERIFIED provenance.
    Order: Validate -> Persist EMS_VERIFIED data -> Create Audit Event -> Broadcast WebSocket Event.
    """
    case = get_case_by_identifier(db, case_identifier)
    if not case:
        raise ValueError(f"Emergency case '{case_identifier}' not found.")

    ems_vit = EMSVitals(
        case_id=case.id,
        heart_rate=vitals.heart_rate,
        systolic_bp=vitals.systolic_bp,
        diastolic_bp=vitals.diastolic_bp,
        oxygen_saturation=vitals.oxygen_saturation,
        respiratory_rate=vitals.respiratory_rate,
        temperature=vitals.temperature,
        gcs=vitals.gcs,
        pain_score=vitals.pain_score,
        blood_glucose=vitals.blood_glucose,
        recorded_by=vitals.recorded_by,
        recorded_at=utc_now(),
        is_verified=True,
        source="EMS_VERIFIED",
    )
    db.add(ems_vit)

    create_audit_event(
        db=db,
        case_id=case.id,
        event_type="VITALS_STREAMED",
        actor_type="EMS",
        actor_name=vitals.recorded_by,
        title="EMS Vitals Streamed",
        description=f"HR: {vitals.heart_rate} bpm, BP: {vitals.systolic_bp}/{vitals.diastolic_bp} mmHg, SpO2: {vitals.oxygen_saturation}%, GCS: {vitals.gcs}.",
        event_metadata={
            "heart_rate": vitals.heart_rate,
            "blood_pressure": f"{vitals.systolic_bp}/{vitals.diastolic_bp}",
            "oxygen_saturation": vitals.oxygen_saturation,
            "respiratory_rate": vitals.respiratory_rate,
            "temperature": vitals.temperature,
            "gcs": vitals.gcs,
            "pain_score": vitals.pain_score,
            "blood_glucose": vitals.blood_glucose,
        },
    )

    db.commit()
    db.refresh(ems_vit)

    # Publish delivery-only WebSocket notification
    publish_case_event(
        case_id=case.case_id,
        event_type=RealtimeEventType.EMS_VITALS_UPDATED,
        source=ProvenanceSource.EMS_VERIFIED,
        payload={
            "case_id": case.case_id,
            "vitals": {
                "heart_rate": ems_vit.heart_rate,
                "systolic_bp": ems_vit.systolic_bp,
                "diastolic_bp": ems_vit.diastolic_bp,
                "oxygen_saturation": ems_vit.oxygen_saturation,
                "respiratory_rate": ems_vit.respiratory_rate,
                "temperature": ems_vit.temperature,
                "gcs": ems_vit.gcs,
                "pain_score": ems_vit.pain_score,
                "blood_glucose": ems_vit.blood_glucose,
                "recorded_by": ems_vit.recorded_by,
                "recorded_at": ems_vit.recorded_at.isoformat() if ems_vit.recorded_at else None,
                "is_verified": True,
                "source": "EMS_VERIFIED",
            },
        },
    )

    return ems_vit


def update_transport_status(
    db: Session,
    case_identifier: str,
    status_update: EMSTransportStatusUpdate,
) -> EmergencyCase:
    """
    Update paramedic transport status (e.g., ON_SCENE, PATIENT_LOADED, TRANSPORTING, ARRIVED).
    """
    actor_name = status_update.updated_by or "Paramedic Team Alpha"
    case = update_case_lifecycle_state(
        db=db,
        case_identifier=case_identifier,
        target_status=status_update.status,
        actor_type="EMS",
        actor_name=actor_name,
        notes=f"EMS transport status transitioned to {status_update.status}.",
    )

    publish_case_event(
        case_id=case.case_id,
        event_type=RealtimeEventType.EMS_STATUS_UPDATED,
        source=ProvenanceSource.EMS_VERIFIED,
        payload={
            "case_id": case.case_id,
            "status": case.status,
            "updated_by": actor_name,
        },
    )

    return case


def complete_handover(
    db: Session,
    case_identifier: str,
    handover_data: EMSHandoverCompleteRequest,
) -> EmergencyCase:
    """
    Formal clinical sign-off and transfer of care at the receiving hospital.
    Transitions lifecycle state to HANDOVER_COMPLETE.
    """
    case = get_case_by_identifier(db, case_identifier)
    if not case:
        raise ValueError(f"Emergency case '{case_identifier}' not found.")

    case = update_case_lifecycle_state(
        db=db,
        case_identifier=case_identifier,
        target_status="HANDOVER_COMPLETE",
        actor_type="EMS",
        actor_name="Paramedic Lead",
        notes=f"Transfer of care completed to {handover_data.receiving_staff}. Notes: {handover_data.notes or 'None'}",
    )

    create_audit_event(
        db=db,
        case_id=case.id,
        event_type="HANDOVER_COMPLETED",
        actor_type="EMS",
        actor_name="Paramedic Lead",
        title="Clinical Handover Completed",
        description=f"Care transferred to {handover_data.receiving_staff}. Handover notes: {handover_data.notes or 'None'}.",
        event_metadata={
            "receiving_staff": handover_data.receiving_staff,
            "notes": handover_data.notes,
        },
    )

    db.commit()
    db.refresh(case)

    publish_case_event(
        case_id=case.case_id,
        event_type=RealtimeEventType.HANDOVER_COMPLETED,
        source=ProvenanceSource.EMS_VERIFIED,
        payload={
            "case_id": case.case_id,
            "status": case.status,
            "receiving_staff": handover_data.receiving_staff,
            "notes": handover_data.notes,
        },
    )

    return case
