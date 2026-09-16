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
