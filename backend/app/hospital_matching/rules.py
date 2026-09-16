from typing import List, Tuple, Dict, Any, Optional
from app.models.hospital import Hospital
from app.models.emergency_case import EmergencyCase


def evaluate_hospital_eligibility(
    hospital: Hospital,
    case: EmergencyCase,
    rejected_hospital_ids: Optional[List[str]] = None,
) -> Tuple[bool, List[str]]:
    """
    Evaluates hard operational and capability eligibility rules for a hospital.
    Operates strictly on explicit structured fields from EmergencyCase and Hospital models.
    MUST NOT infer diagnosis or severity from AI free-text notes or confidence scores.
    
    Returns:
        Tuple of (is_eligible: bool, exclusion_reasons: List[str])
    """
    reasons = []
    rejected_set = set(rejected_hospital_ids or [])

    # 1. Human Rejection Rule in Current Coordination Session
    if hospital.id in rejected_set:
        reasons.append("Hospital previously rejected by human coordinator in active session.")

    # 2. Operational Status Rule
    if hospital.operational_status == "Closed":
        reasons.append("Hospital facility emergency department is currently closed.")
    elif hospital.operational_status == "Diversion" or hospital.diversion_active:
        reasons.append(f"Hospital currently on active diversion status ({hospital.active_surge_level or 'Full Divert'}).")

    # 3. Pediatric vs. Adult Age Rule
    capabilities_list = hospital.capabilities or []
    cap_names = [c.get("name", "").lower() for c in capabilities_list if isinstance(c, dict)]
    is_pediatric_only = any("pediatric" in name for name in cap_names) and not any("adult" in name or "general" in name or "level 1 trauma center" in name for name in cap_names)

    if case.patient_age is not None:
        if case.patient_age >= 18 and (is_pediatric_only or "children" in hospital.name.lower()):
            reasons.append(f"Dedicated pediatric facility (patient age {case.patient_age} exceeds pediatric criteria).")
        elif case.patient_age < 18 and hospital.trauma_level == "Adult Burn Center":
            reasons.append("Facility limited to adult specialized care.")

    # 4. Critical Specialty Capability Match based on explicit structured incident_type
    incident_upper = (case.incident_type or "").upper()
    priority = (case.operational_priority or "HIGH").upper()

    # STEMI / Cardiac Match
    if "STEMI" in incident_upper or "CARDIAC" in incident_upper or "HEART" in incident_upper:
        has_cardiac_cap = any("pci" in name or "cardiac" in name or "cath" in name for name in cap_names)
        if not has_cardiac_cap and priority in ["CRITICAL", "HIGH"]:
            # Check if basic clinic
            if hospital.trauma_level == "Level 3 Emergency Care" or "clinic" in hospital.name.lower():
                reasons.append("Facility lacks 24/7 STEMI PCI / Cath Lab required for acute cardiac emergency.")

    # Severe Poly-Trauma Match
    if "TRAUMA" in incident_upper or "COLLISION" in incident_upper or "ACCIDENT" in incident_upper:
        if priority == "CRITICAL":
            has_trauma_cap = any("trauma" in name for name in cap_names)
            if not has_trauma_cap or hospital.trauma_level == "Level 3 Emergency Care":
                reasons.append("Facility lacks surgical trauma resuscitation team required for critical trauma.")

    # Stroke / Neurological Match
    if "STROKE" in incident_upper or "NEURO" in incident_upper:
        has_stroke_cap = any("stroke" in name or "neuro" in name for name in cap_names)
        if not has_stroke_cap and priority in ["CRITICAL", "HIGH"]:
            if hospital.trauma_level == "Level 3 Emergency Care":
                reasons.append("Facility lacks Comprehensive / Primary Stroke Center capabilities.")

    # 5. Zero-Bay Full Gridlock Rule
    if hospital.available_bays <= 0 and hospital.active_surge_level in ["Surge Level 2", "Surge Level 3"]:
        reasons.append("Emergency department at maximum surge capacity with 0 available resuscitation bays.")

    is_eligible = len(reasons) == 0
    return is_eligible, reasons
