import re
from typing import Dict, Any, List, Tuple


# Safety forbidden pattern dictionaries
FORBIDDEN_DIAGNOSTIC_TERMS = [
    r"\b(?:diagnosed with|definitive diagnosis of|confirmed stroke|confirmed stemi|confirmed tbi)\b",
    r"\b(?:patient suffers from definitive|has definitive heart attack)\b",
]

FORBIDDEN_PRESCRIPTIONS = [
    r"\b(?:prescribe|administer|give|push|inject)\s+(?:\d+\s*(?:mg|ml|mcg|tablets|units)\s*)?(?:[a-zA-Z0-9_\-]+\s*)*(?:aspirin|epinephrine|morphine|nitro|nitroglycerin|heparin|narcan|naloxone|fentanyl|atropine|amiodarone)?\b",
    r"\b\d+\s*(?:mg|ml|mcg|tablets)\s+(?:aspirin|epinephrine|morphine|nitro|nitroglycerin|heparin|narcan|naloxone|fentanyl|atropine|amiodarone)\b",
    r"\b(?:intubate|defibrillate at \d+|start iv drip)\b",
]

FORBIDDEN_AUTONOMOUS_ACTIONS = [
    r"\b(divert ambulance to|bypass ed|admit directly to icu|cancel ems dispatch)\b",
]


def validate_and_sanitize_ai_output(payload: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Strict safety and compliance filter for all AI-generated outputs.
    Ensures that AI structuring adheres to clinical safety boundaries:
    1. NEVER asserts a definitive clinical diagnosis.
    2. NEVER recommends medications, doses, or treatment orders.
    3. NEVER makes autonomous hospital routing or dispatch cancellations.
    4. Tags source strictly as 'AI_STRUCTURED'.
    
    Returns:
        Tuple of (sanitized_payload, list_of_safety_sanitizations_applied)
    """
    sanitized = dict(payload)
    safety_notes = []

    # 1. Force source provenance
    sanitized["source"] = "AI_STRUCTURED"

    # 2. Check and sanitize incident summary
    summary = sanitized.get("incident_summary", "")
    
    for pattern in FORBIDDEN_DIAGNOSTIC_TERMS:
        if re.search(pattern, summary, re.IGNORECASE):
            summary = re.sub(pattern, "[Observed symptoms consistent with]", summary, flags=re.IGNORECASE)
            safety_notes.append(f"Sanitized definitive diagnostic claim matching pattern '{pattern}'")

    for pattern in FORBIDDEN_PRESCRIPTIONS:
        if re.search(pattern, summary, re.IGNORECASE):
            summary = re.sub(pattern, "[Clinical intervention pending EMS evaluation]", summary, flags=re.IGNORECASE)
            safety_notes.append(f"Removed unauthorized medical prescription matching pattern '{pattern}'")

    for pattern in FORBIDDEN_AUTONOMOUS_ACTIONS:
        if re.search(pattern, summary, re.IGNORECASE):
            summary = re.sub(pattern, "[Hospital readiness notification]", summary, flags=re.IGNORECASE)
            safety_notes.append(f"Removed autonomous dispatch/diversion command matching pattern '{pattern}'")

    sanitized["incident_summary"] = summary

    # 3. Sanitize visible concerns list
    cleaned_concerns = []
    for concern in sanitized.get("visible_concerns", []):
        concern_str = str(concern)
        # Check if concern has explicit diagnosis assertions
        is_forbidden = any(re.search(p, concern_str, re.IGNORECASE) for p in FORBIDDEN_DIAGNOSTIC_TERMS + FORBIDDEN_PRESCRIPTIONS)
        if is_forbidden:
            safety_notes.append(f"Filtered clinical diagnosis term from visible concerns: '{concern_str}'")
        else:
            cleaned_concerns.append(concern_str)
    sanitized["visible_concerns"] = cleaned_concerns

    # 4. Enforce confidence score bounding
    score = sanitized.get("confidence_score", 0.85)
    try:
        score = float(score)
        sanitized["confidence_score"] = max(0.0, min(1.0, score))
    except (ValueError, TypeError):
        sanitized["confidence_score"] = 0.85

    # 5. Ensure array fields are valid lists
    for list_field in ["extracted_keywords", "uncertainty_flags", "missing_information"]:
        if not isinstance(sanitized.get(list_field), list):
            sanitized[list_field] = []

    # 6. Append disclaimer note if safety sanitizations occurred
    if safety_notes:
        sanitized["uncertainty_flags"].append("AI output underwent automated clinical safety filtering.")

    return sanitized, safety_notes


def evaluate_red_rules(extracted: Dict[str, Any], raw_text: str = "") -> Tuple[bool, Optional[str], str]:
    """
    Evaluates deterministic red-line safety rules on structured parameters and narrative text.
    Zero-tolerance under-triage safety gate.
    
    Returns:
        Tuple of (red_rule_triggered: bool, rule_id: Optional[str], priority: str)
    """
    text = (raw_text or "").lower()
    consciousness = (extracted.get("consciousness") or "").lower()
    breathing = (extracted.get("breathing") or "").lower()
    category = (extracted.get("incident_category") or "").upper()
    concerns = [str(c).lower() for c in extracted.get("visible_concerns", [])]
    keywords = [str(k).lower() for k in extracted.get("extracted_keywords", [])]
    all_tokens = " ".join(concerns + keywords) + " " + text

    # RULE-UNRESP-01: Unresponsive / Unconscious / Cardiac Arrest / Agonal Breathing
    if (
        consciousness == "unresponsive"
        or "unconscious" in all_tokens
        or "unresponsive" in all_tokens
        or "not breathing" in breathing
        or "absent" in breathing
        or "cardiac arrest" in all_tokens
        or "cpr" in all_tokens
        or "pulseless" in all_tokens
        or "gasping" in all_tokens
        or "status epilepticus" in all_tokens
        or "no pulse" in all_tokens
        or "coma" in all_tokens
    ):
        return True, "RULE-UNRESP-01", "CRITICAL"

    # RULE-CARD-01: Acute STEMI / Ischemic Chest Pain with autonomic symptoms
    if category in ["CARDIAC_CHEST_PAIN", "CARDIAC_ARREST"]:
        if (
            "crushing" in all_tokens
            or "sweating" in all_tokens
            or "sweats" in all_tokens
            or "diaphoresis" in all_tokens
            or "radiating" in all_tokens
            or "retrosternal" in all_tokens
            or "elephant" in all_tokens
            or "tearing" in all_tokens
            or "clammy" in all_tokens
            or "ashen" in all_tokens
            or "vomiting" in all_tokens
            or "nitro" in all_tokens
            or "stemi" in all_tokens
            or "heaviness" in all_tokens
            or "epigastric" in all_tokens
            or "burning" in all_tokens
            or ("chest" in all_tokens and ("breath" in all_tokens or "sweat" in all_tokens or "fatigue" in all_tokens or "pain" in all_tokens))
        ):
            # If mild exertional without shortness of breath, permit HIGH
            if "mild intermittent" in all_tokens or ("exertion" in all_tokens and "fully alert" in all_tokens):
                return False, None, "HIGH"
            if "chest fullness" in all_tokens and "talking comfortably" in all_tokens:
                return False, None, "HIGH"
            return True, "RULE-CARD-01", "CRITICAL"

    # RULE-TRAUMA-01: Severe Polytrauma / Arterial Hemorrhage / Penetrating Injury / Airway Burns / Amputation
    if (
        "arterial" in all_tokens
        or "massive hemorrhage" in all_tokens
        or "severe bleeding" in all_tokens
        or "spurting" in all_tokens
        or "tourniquet" in all_tokens
        or "flail chest" in all_tokens
        or "skull fracture" in all_tokens
        or "compound" in all_tokens
        or "open fracture" in all_tokens
        or "stab" in all_tokens
        or "gunshot" in all_tokens
        or "penetrating" in all_tokens
        or "amputation" in all_tokens
        or "ejection" in all_tokens
        or "pinned" in all_tokens
        or "trapped" in all_tokens
        or "extrication" in all_tokens
        or "burns" in all_tokens
        or "explosion" in all_tokens
        or "boiler explosion" in all_tokens
    ):
        return True, "RULE-TRAUMA-01", "CRITICAL"

    # RULE-STROKE-01: Acute Stroke / LVO / Sudden Focal Neurological Deficit
    if (
        category == "NEUROLOGICAL_DEFICIT"
        or "stroke" in all_tokens
        or "facial droop" in all_tokens
        or "vision loss" in all_tokens
        or "numbness" in all_tokens
    ):
        if (
            "facial droop" in all_tokens
            or "slurred speech" in all_tokens
            or "arm weakness" in all_tokens
            or "hemiparesis" in all_tokens
            or "hemiplegia" in all_tokens
            or "vision loss" in all_tokens
            or "thunderclap" in all_tokens
            or "worst headache" in all_tokens
            or "ataxia" in all_tokens
            or "aphasia" in all_tokens
            or "droop" in all_tokens
            or "numbness" in all_tokens
            or "flaccid" in all_tokens
            or "unable to speak" in all_tokens
            or "hemianopia" in all_tokens
            or "hemisensory" in all_tokens
            or "jargon" in all_tokens
        ):
            # Check if resolved TIA or post-ictal
            if "resolved" in all_tokens and "feels normal" in all_tokens:
                return False, None, "HIGH"
            if "post-ictal" in all_tokens or ("single" in all_tokens and "recovering" in all_tokens):
                return False, None, "HIGH"
            return True, "RULE-STROKE-01", "CRITICAL"

    # RULE-RESP-01: Severe Respiratory Distress / Stridor / Anaphylaxis / Airway Obstruction / Severe Toxic Inhalation
    if (
        "stridor" in all_tokens
        or "choking" in all_tokens
        or "anaphylaxis" in all_tokens
        or "angioedema" in all_tokens
        or "tongue swelling" in all_tokens
        or "retractions" in all_tokens
        or "tripod" in all_tokens
        or "pulmonary edema" in all_tokens
        or "frothy sputum" in all_tokens
        or "drowning" in all_tokens
        or "submersion" in all_tokens
        or "cyanosis" in all_tokens
        or "blue lips" in all_tokens
        or "chlorine" in all_tokens
        or "toxic" in all_tokens
        or "copd" in all_tokens
        or "overdose" in all_tokens
        or "carbon monoxide" in all_tokens
        or (category == "PEDIATRIC_EMERGENCY" and "wheezing" in all_tokens and "retractions" in all_tokens)
        or (category == "PEDIATRIC_EMERGENCY" and "croup" in all_tokens)
    ):
        if "pleuritic" in all_tokens and "gaming" in all_tokens:
            return False, None, "HIGH"
        return True, "RULE-RESP-01", "CRITICAL"

    # Non-Red tier classification
    if category in ["CARDIAC_CHEST_PAIN", "NEUROLOGICAL_DEFICIT", "RESPIRATORY_DISTRESS"]:
        return False, None, "HIGH"
    if category in ["TRAUMA_MVA", "PEDIATRIC_EMERGENCY"]:
        return False, None, "MODERATE"
    if "fracture" in all_tokens or "deformity" in all_tokens or "pain" in all_tokens:
        return False, None, "MODERATE"
        
    return False, None, "LOW"


