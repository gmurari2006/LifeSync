import math
from typing import Tuple, Dict, Any
from app.models.hospital import Hospital
from app.models.emergency_case import EmergencyCase


# Pre-defined default simulated distances/ETAs for 5 synthetic hospitals if coordinates are near metro center
DEFAULT_HOSPITAL_DISTANCES = {
    "HOSP-CITYCARE-01": {"distance_km": 3.8, "eta_minutes": 6},
    "HOSP-METRO-02": {"distance_km": 5.2, "eta_minutes": 9},
    "HOSP-STJUDE-03": {"distance_km": 7.4, "eta_minutes": 14},
    "HOSP-VALLEY-04": {"distance_km": 8.6, "eta_minutes": 16},
    "HOSP-NORTH-05": {"distance_km": 11.2, "eta_minutes": 22},
}


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes approximate distance in kilometers between two geographic coordinates.
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)


def compute_simulated_distance_and_eta(case: EmergencyCase, hospital: Hospital) -> Tuple[float, int]:
    """
    Computes deterministic simulated distance and algorithmic ETA.
    Clearly identified as simulated/algorithmic demo telemetry.
    """
    if case.latitude is not None and case.longitude is not None and hospital.latitude is not None and hospital.longitude is not None:
        dist_km = calculate_haversine_distance(case.latitude, case.longitude, hospital.latitude, hospital.longitude)
        # Emergency urban speed approx 42 km/h + 1.5 min dispatch buffer
        eta_min = max(2, int(math.ceil((dist_km / 42.0) * 60 + 1.5)))
        return max(0.5, dist_km), eta_min
    
    # Fallback to predefined deterministic lookup for synthetic demo facilities
    default_vals = DEFAULT_HOSPITAL_DISTANCES.get(hospital.id, {"distance_km": 6.0, "eta_minutes": 11})
    return default_vals["distance_km"], default_vals["eta_minutes"]


def compute_suitability_score(
    hospital: Hospital,
    case: EmergencyCase,
    distance_km: float,
    eta_minutes: int,
) -> Tuple[float, float, float, float]:
    """
    Calculates deterministic suitability score based strictly on the required formula:
    Suitability Score = 0.40 * Capability Match + 0.35 * ETA Proximity + 0.25 * Capacity Availability
    
    Strictly NO M_crit multiplier.
    
    Returns:
        Tuple of (total_score, capability_score, eta_score, capacity_score)
    """
    # 1. Capability Score (0.0 to 1.0)
    capabilities_list = hospital.capabilities or []
    cap_names = [c.get("name", "").lower() for c in capabilities_list if isinstance(c, dict)]
    incident_upper = (case.incident_type or "").upper()

    if "STEMI" in incident_upper or "CARDIAC" in incident_upper:
        if any("pci" in name or "cath" in name for name in cap_names):
            capability_score = 1.0
        elif any("cardiac" in name or "cardio" in name for name in cap_names):
            capability_score = 0.90
        elif hospital.trauma_level == "Level 1 Trauma Center":
            capability_score = 0.75
        else:
            capability_score = 0.50
    elif "TRAUMA" in incident_upper or "COLLISION" in incident_upper:
        if hospital.trauma_level in ["Level 1 Trauma Center", "Level 1 Comprehensive Trauma"]:
            capability_score = 1.0
        elif hospital.trauma_level == "Level 2 Trauma Center":
            capability_score = 0.85
        else:
            capability_score = 0.50
    elif "STROKE" in incident_upper or "NEURO" in incident_upper:
        if any("comprehensive stroke" in name for name in cap_names):
            capability_score = 1.0
        elif any("primary stroke" in name or "stroke ready" in name for name in cap_names):
            capability_score = 0.85
        else:
            capability_score = 0.50
    elif case.patient_age is not None and case.patient_age < 18:
        if any("pediatric" in name for name in cap_names):
            capability_score = 1.0
        elif hospital.trauma_level == "Level 1 Trauma Center":
            capability_score = 0.80
        else:
            capability_score = 0.60
    else:
        # General emergency presentation
        if hospital.trauma_level in ["Level 1 Trauma Center", "Level 1 Comprehensive Trauma"]:
            capability_score = 0.95
        elif hospital.trauma_level == "Level 2 Trauma Center":
            capability_score = 0.85
        else:
            capability_score = 0.70

    # 2. ETA Proximity Score (0.0 to 1.0)
    # Closer is higher: 0 mins -> 1.0, 30+ mins -> 0.0
    eta_score = max(0.0, min(1.0, 1.0 - (eta_minutes / 30.0)))

    # 3. Capacity Availability Score (0.0 to 1.0)
    # Normalized: 4 or more available bays -> 1.0
    available_bays = max(0, hospital.available_bays or 0)
    capacity_score = min(1.0, available_bays / 4.0)

    # 4. Total Additive Score
    total_score = (0.40 * capability_score) + (0.35 * eta_score) + (0.25 * capacity_score)
    total_score = round(max(0.0, min(1.0, total_score)), 2)

    return total_score, round(capability_score, 2), round(eta_score, 2), round(capacity_score, 2)
