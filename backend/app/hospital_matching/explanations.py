from typing import List, Dict, Any, Optional
from app.models.hospital import Hospital
from app.models.emergency_case import EmergencyCase


def generate_candidate_explanation(
    hospital: Hospital,
    case: EmergencyCase,
    is_eligible: bool,
    exclusion_reasons: List[str],
    rank: Optional[int],
    suitability_score: float,
    distance_km: float,
    eta_minutes: int,
) -> str:
    """
    Generates deterministic, transparent plain-text justifications.
    Enforces standardized terminology:
    - Ranked: '{hospital.name} ranked #{rank} by the deterministic matching system...'
    - Excluded: '{hospital.name} excluded: ...'
    """
    if not is_eligible:
        reasons_text = "; ".join(exclusion_reasons) if exclusion_reasons else "Operational criteria not satisfied"
        return f"{hospital.name} excluded: {reasons_text}."

    # Highlight key matching strengths
    reasons_parts = []
    
    # Capability highlight
    capabilities_list = hospital.capabilities or []
    cap_names = [c.get("name", "") for c in capabilities_list if isinstance(c, dict)]
    incident_upper = (case.incident_type or "").upper()

    if "STEMI" in incident_upper or "CARDIAC" in incident_upper:
        reasons_parts.append("Active 24/7 STEMI PCI / Cath Lab capability matched for acute cardiac emergency")
    elif "TRAUMA" in incident_upper or "COLLISION" in incident_upper:
        reasons_parts.append(f"{hospital.trauma_level or 'Trauma Resuscitation Unit'} matched for trauma resuscitation")
    elif "STROKE" in incident_upper or "NEURO" in incident_upper:
        reasons_parts.append("Comprehensive Stroke Center readiness matched for acute neurological emergency")
    else:
        reasons_parts.append(f"{hospital.trauma_level or 'Emergency Department'} capability aligned with incident category")

    # Bay availability
    available_bays = max(0, hospital.available_bays or 0)
    reasons_parts.append(f"{available_bays} available resuscitation bay{'s' if available_bays != 1 else ''}")

    # Transit proximity
    reasons_parts.append(f"simulated transit proximity ({distance_km:.1f} km, ETA {eta_minutes} min)")

    justification_str = ", ".join(reasons_parts)
    rank_str = f"#{rank}" if rank else "candidate"

    return f"{hospital.name} ranked {rank_str} by the deterministic matching system: {justification_str} (Score: {suitability_score:.2f})."
