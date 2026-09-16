from typing import Dict, Any
from app.ai.schemas import AIStructuredEmergencyInfo
from app.ai.rules import validate_and_sanitize_ai_output


class AINormalizer:
    """
    Normalizes and validates provider output against the LifeSync AI schema and safety rules.
    """

    @staticmethod
    def normalize_and_validate(raw_output: Dict[str, Any], case_id: str, citizen_report_id: str = None) -> AIStructuredEmergencyInfo:
        # Run safety filters first
        sanitized_payload, _ = validate_and_sanitize_ai_output(raw_output)

        # Ensure required identifiers
        sanitized_payload["case_id"] = case_id
        if citizen_report_id:
            sanitized_payload["citizen_report_id"] = citizen_report_id

        # Fallback defaults for critical fields
        if not sanitized_payload.get("incident_summary"):
            sanitized_payload["incident_summary"] = "Bystander reported emergency situation requiring on-scene evaluation."
        
        if not sanitized_payload.get("incident_category"):
            sanitized_payload["incident_category"] = "GENERAL_EMERGENCY"

        if not sanitized_payload.get("location_summary"):
            sanitized_payload["location_summary"] = "Scene Location"

        return AIStructuredEmergencyInfo(**sanitized_payload)
