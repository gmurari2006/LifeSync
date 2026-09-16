from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.emergency_case import EmergencyCase
from app.models.citizen_report import CitizenReport
from app.models.ai_report import AIStructuredReport
from app.ai.providers import AIProvider
from app.ai.providers.local import RuleBasedLocalAIProvider
from app.ai.normalizer import AINormalizer
from app.services.audit_service import create_audit_event


class AIService:
    """
    Core AI Information Structuring orchestration service.
    Processes unstructured citizen observations into standardized representations.
    Ensures clinical safety guardrails, provenance tagging, and audit logging.
    """

    def __init__(self, provider: Optional[AIProvider] = None):
        self.provider = provider or RuleBasedLocalAIProvider()

    def _resolve_case(self, db: Session, case_id_or_uuid: str) -> Optional[EmergencyCase]:
        stmt = select(EmergencyCase).where(
            (EmergencyCase.id == case_id_or_uuid) | (EmergencyCase.case_id == case_id_or_uuid)
        )
        return db.scalars(stmt).first()

    def _resolve_citizen_report(self, db: Session, case: EmergencyCase) -> Optional[CitizenReport]:
        stmt = (
            select(CitizenReport)
            .where(CitizenReport.case_id == case.id)
            .order_by(desc(CitizenReport.created_at))
        )
        return db.scalars(stmt).first()

    async def structure_case_report(
        self,
        db: Session,
        case_id_or_uuid: str,
        force_reprocess: bool = False,
        additional_context: Optional[str] = None,
    ) -> AIStructuredReport:
        """
        Extracts and creates an AIStructuredReport for a given EmergencyCase.
        If an existing report exists and force_reprocess is False, returns the cached latest report.
        """
        case = self._resolve_case(db, case_id_or_uuid)
        if not case:
            raise ValueError(f"Emergency case '{case_id_or_uuid}' not found.")

        # Check for existing report if not forcing re-extraction
        if not force_reprocess:
            latest_existing = self.get_latest_report(db, case.id)
            if latest_existing:
                return latest_existing

        # Retrieve citizen report
        citizen_report = self._resolve_citizen_report(db, case)
        
        # Build payload dicts for provider
        report_dict: Dict[str, Any] = {}
        if citizen_report:
            # Map citizen fields safely
            raw_unconscious = citizen_report.has_unconscious or "No"
            raw_awake = citizen_report.is_awake or "Yes"
            raw_breathing = citizen_report.is_breathing or "Yes"

            consciousness = "Unresponsive" if (raw_unconscious == "Yes" or raw_awake == "No") else ("Responding" if raw_awake == "Yes" else "Uncertain")
            breathing = "Normal" if raw_breathing == "Yes" else ("Difficulty Breathing" if raw_breathing == "Difficulty" else "Uncertain")

            report_dict = {
                "id": citizen_report.id,
                "chief_complaint": citizen_report.incident_category,
                "additional_notes": citizen_report.additional_notes,
                "emergency_type": citizen_report.incident_category,
                "people_count": citizen_report.people_count,
                "consciousness": consciousness,
                "breathing": breathing,
                "hazards": citizen_report.visible_concerns or [],
                "visible_concerns": citizen_report.visible_concerns or [],
                "location_address": citizen_report.location_address,
                "location_landmark": citizen_report.location_landmark,
            }
        else:
            report_dict = {
                "id": None,
                "chief_complaint": case.incident_type,
                "additional_notes": "",
                "emergency_type": case.incident_type,
                "people_count": case.patient_count,
                "location_address": case.reported_location,
            }

        if additional_context:
            notes = report_dict.get("additional_notes", "")
            report_dict["additional_notes"] = f"{notes} [Context: {additional_context}]".strip()

        case_dict = {
            "id": case.id,
            "case_id": case.case_id,
            "emergency_type": case.incident_type,
            "patient_count": case.patient_count,
            "location_address": case.reported_location,
        }

        # 1. Generate structured output via provider
        raw_ai_output = await self.provider.structure_emergency_report(report_dict, case_dict)

        # 2. Normalize and validate with safety guardrails
        normalized_info = AINormalizer.normalize_and_validate(
            raw_output=raw_ai_output,
            case_id=case.id,
            citizen_report_id=citizen_report.id if citizen_report else None,
        )

        # 3. Persist AI Structured Report record
        ai_report_model = AIStructuredReport(
            case_id=case.id,
            citizen_report_id=citizen_report.id if citizen_report else case.id,  # Fallback to case.id if no citizen report
            incident_summary=normalized_info.incident_summary,
            incident_category=normalized_info.incident_category,
            people_count=normalized_info.people_count,
            consciousness=normalized_info.consciousness,
            breathing=normalized_info.breathing,
            visible_concerns=normalized_info.visible_concerns,
            location_summary=normalized_info.location_summary,
            extracted_keywords=normalized_info.extracted_keywords,
            uncertainty_flags=normalized_info.uncertainty_flags,
            missing_information=normalized_info.missing_information,
            confidence_score=normalized_info.confidence_score,
            source="AI_STRUCTURED",
            model_name=normalized_info.model_name,
            model_version=normalized_info.model_version,
            prompt_version=normalized_info.prompt_version,
            status=normalized_info.status,
            structured_payload=normalized_info.model_dump(mode="json"),
        )
        db.add(ai_report_model)
        db.flush()

        # 4. Create immutable audit event
        create_audit_event(
            db=db,
            case_id=case.id,
            event_type="AI_STRUCTURING_COMPLETED",
            actor_type="SYSTEM",
            actor_name=f"AI Engine ({self.provider.provider_name})",
            title="AI Structured Emergency Report Created",
            description=f"Automated information structuring completed with extraction confidence {normalized_info.confidence_score:.2f}.",
            new_state=case.status,
            event_metadata={
                "ai_report_id": ai_report_model.id,
                "model_name": normalized_info.model_name,
                "model_version": normalized_info.model_version,
                "confidence_score": normalized_info.confidence_score,
                "uncertainty_count": len(normalized_info.uncertainty_flags),
                "missing_info_count": len(normalized_info.missing_information),
                "source": "AI_STRUCTURED",
            },
        )

        db.commit()
        db.refresh(ai_report_model)
        return ai_report_model

    def get_latest_report(self, db: Session, case_id_or_uuid: str) -> Optional[AIStructuredReport]:
        case = self._resolve_case(db, case_id_or_uuid)
        if not case:
            return None

        stmt = (
            select(AIStructuredReport)
            .where(AIStructuredReport.case_id == case.id)
            .order_by(desc(AIStructuredReport.created_at))
        )
        return db.scalars(stmt).first()

    def get_report_history(self, db: Session, case_id_or_uuid: str) -> List[AIStructuredReport]:
        case = self._resolve_case(db, case_id_or_uuid)
        if not case:
            return []

        stmt = (
            select(AIStructuredReport)
            .where(AIStructuredReport.case_id == case.id)
            .order_by(desc(AIStructuredReport.created_at))
        )
        return list(db.scalars(stmt).all())
