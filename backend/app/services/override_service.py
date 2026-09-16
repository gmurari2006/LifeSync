import uuid
from typing import Dict, Set, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.emergency_case import EmergencyCase
from app.models.hospital import Hospital
from app.models.base import utc_now
from app.schemas.override import HumanOverrideRequest, HumanOverrideResponse
from app.services.case_service import get_case_by_identifier
from app.services.audit_service import create_audit_event
from app.realtime.events import publish_case_event
from app.realtime.schemas import RealtimeEventType, ProvenanceSource

# Field-level role authorization matrix
FIELD_ROLE_PERMISSIONS: Dict[str, Set[str]] = {
    "OPERATIONAL_PRIORITY": {"EMS_PARAMEDIC", "EMERGENCY_PHYSICIAN", "ED_COORDINATOR"},
    "DESTINATION_HOSPITAL": {"ED_COORDINATOR", "EMERGENCY_PHYSICIAN", "REGIONAL_DISPATCHER", "EMS_PARAMEDIC"},
    "AMBULANCE_CLASS": {"EMS_PARAMEDIC", "REGIONAL_DISPATCHER"},
}

VALID_REASON_CODES: Set[str] = {
    # Urgency Acuity
    "CLINICAL_ACUITY_DISCREPANCY",
    "PARAMEDIC_FIELD_JUDGMENT",
    # Destination
    "SPECIALIST_UNAVAILABLE",
    "DIVERT_OVERRIDE",
    "CLINICAL_PREFERENCE",
    "NO_SPECIALTY_AVAILABLE",
    "MAXIMUM_SURGE_CAPACITY",
    "CT_CATH_LAB_OFFLINE",
    "TRAUMA_TEAM_COMMITTED",
    # Ambulance Class
    "ACUITY_UPGRADE_REQUIRED",
    "BLS_SUFFICIENT",
    # Common
    "OTHER",
}


class HumanOverrideService:
    """
    Service enforcing field-level role authorization, validation, state mutation,
    and immutable audit recording for human overrides.
    """

    def apply_override(
        self,
        db: Session,
        case_identifier: str,
        request: HumanOverrideRequest,
        actor_user_id: str,
        actor_name: str,
        actor_role: str,
    ) -> HumanOverrideResponse:
        case = get_case_by_identifier(db, case_identifier)
        if not case:
            raise ValueError(f"Emergency case '{case_identifier}' not found.")

        param = request.parameter_overridden.upper()
        if param not in FIELD_ROLE_PERMISSIONS:
            raise ValueError(
                f"Unsupported override parameter '{param}'. Must be one of: "
                f"{', '.join(FIELD_ROLE_PERMISSIONS.keys())}"
            )

        # Enforce server-side field-level role authorization
        normalized_role = actor_role.upper()
        allowed_roles = FIELD_ROLE_PERMISSIONS[param]
        if normalized_role not in allowed_roles:
            raise PermissionError(
                f"Actor with role '{actor_role}' is not authorized to override '{param}'. "
                f"Authorized roles: {', '.join(allowed_roles)}."
            )

        # Validate reason code
        if request.reason_code not in VALID_REASON_CODES:
            raise ValueError(
                f"Invalid reason code '{request.reason_code}'. Must be one of: {', '.join(sorted(VALID_REASON_CODES))}"
            )

        if not request.free_text_justification or len(request.free_text_justification.strip()) < 3:
            raise ValueError("A free-text clinical or operational justification note is required.")

        original_value: Optional[str] = None
        override_id = f"OVR-{uuid.uuid4().hex[:8].upper()}"

        if param == "OPERATIONAL_PRIORITY":
            original_value = case.operational_priority
            case.operational_priority = request.new_value
        elif param == "DESTINATION_HOSPITAL":
            original_value = case.destination_hospital_id
            # Verify target hospital exists if not clearing
            if request.new_value:
                hosp = db.query(Hospital).filter(Hospital.id == request.new_value).first()
                if not hosp:
                    raise ValueError(f"Target hospital '{request.new_value}' does not exist.")
            case.destination_hospital_id = request.new_value
        elif param == "AMBULANCE_CLASS":
            original_value = case.assigned_unit_id
            case.assigned_unit_id = request.new_value

        # Determine actor category for audit logging
        actor_type = "EMS" if "EMS" in normalized_role or "PARAMEDIC" in normalized_role else (
            "HOSPITAL" if "HOSPITAL" in normalized_role or "PHYSICIAN" in normalized_role or "COORDINATOR" in normalized_role else "DISPATCH"
        )

        now = utc_now()
        # Create immutable CaseAuditEvent
        create_audit_event(
            db=db,
            case_id=case.id,
            event_type="HUMAN_OVERRIDE_RECORDED",
            actor_type=actor_type,
            actor_name=actor_name,
            title=f"Human Override: {param}",
            description=f"{actor_name} ({actor_role}) overrode {param} from '{original_value}' to '{request.new_value}'. Reason: {request.reason_code}. Justification: {request.free_text_justification}",
            event_metadata={
                "override_id": override_id,
                "parameter_overridden": param,
                "original_value": original_value,
                "new_value": request.new_value,
                "reason_code": request.reason_code,
                "free_text_justification": request.free_text_justification,
                "actor_user_id": actor_user_id,
                "actor_role": actor_role,
                "timestamp": now.isoformat(),
            },
        )

        db.commit()
        db.refresh(case)

        # Broadcast delivery-only WebSocket notification
        publish_case_event(
            case_id=case.case_id,
            event_type=RealtimeEventType.HUMAN_OVERRIDE_RECORDED,
            source=ProvenanceSource.EMS_VERIFIED if actor_type == "EMS" else ProvenanceSource.HOSPITAL_VERIFIED,
            payload={
                "override_id": override_id,
                "case_id": case.case_id,
                "parameter_overridden": param,
                "original_value": original_value,
                "new_value": request.new_value,
                "reason_code": request.reason_code,
                "actor_name": actor_name,
                "actor_role": actor_role,
            },
        )

        return HumanOverrideResponse(
            override_id=override_id,
            case_id=case.case_id,
            parameter_overridden=param,
            original_value=original_value,
            new_value=request.new_value,
            reason_code=request.reason_code,
            free_text_justification=request.free_text_justification,
            actor_user_id=actor_user_id,
            actor_name=actor_name,
            actor_role=actor_role,
            timestamp=now,
            status="OVERRIDE_RECORDED",
        )


override_service = HumanOverrideService()
