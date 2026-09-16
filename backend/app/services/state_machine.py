from typing import Dict, Set
from enum import Enum


class CaseStatus(str, Enum):
    REPORTED = "REPORTED"
    INFORMATION_STRUCTURED = "INFORMATION_STRUCTURED"
    EMS_ASSIGNED = "EMS_ASSIGNED"
    EMS_ACCEPTED = "EMS_ACCEPTED"
    ON_SCENE = "ON_SCENE"
    ASSESSMENT_UPDATED = "ASSESSMENT_UPDATED"
    PATIENT_LOADED = "PATIENT_LOADED"
    TRANSPORTING = "TRANSPORTING"
    HOSPITAL_ALERTED = "HOSPITAL_ALERTED"
    HOSPITAL_ACKNOWLEDGED = "HOSPITAL_ACKNOWLEDGED"
    ARRIVED = "ARRIVED"
    HANDOVER_COMPLETE = "HANDOVER_COMPLETE"
    DIVERTED = "DIVERTED"
    CLOSED = "CLOSED"


class InvalidStateTransitionError(Exception):
    """Raised when an illegal emergency case state transition is attempted."""
    def __init__(self, current_state: str, target_state: str):
        self.current_state = current_state
        self.target_state = target_state
        super().__init__(
            f"Invalid emergency case transition from '{current_state}' to '{target_state}'."
        )


# Strict deterministic lifecycle transition graph based on LifeSync PRD v1.2.0
VALID_TRANSITIONS: Dict[CaseStatus, Set[CaseStatus]] = {
    CaseStatus.REPORTED: {
        CaseStatus.INFORMATION_STRUCTURED,
        CaseStatus.EMS_ASSIGNED,
        CaseStatus.CLOSED,
    },
    CaseStatus.INFORMATION_STRUCTURED: {
        CaseStatus.EMS_ASSIGNED,
        CaseStatus.HOSPITAL_ALERTED,
        CaseStatus.CLOSED,
    },
    CaseStatus.EMS_ASSIGNED: {
        CaseStatus.EMS_ACCEPTED,
        CaseStatus.CLOSED,
    },
    CaseStatus.EMS_ACCEPTED: {
        CaseStatus.ON_SCENE,
        CaseStatus.HOSPITAL_ALERTED,
        CaseStatus.CLOSED,
    },
    CaseStatus.ON_SCENE: {
        CaseStatus.ASSESSMENT_UPDATED,
        CaseStatus.PATIENT_LOADED,
        CaseStatus.TRANSPORTING,
        CaseStatus.HOSPITAL_ALERTED,
        CaseStatus.DIVERTED,
        CaseStatus.CLOSED,
    },
    CaseStatus.ASSESSMENT_UPDATED: {
        CaseStatus.PATIENT_LOADED,
        CaseStatus.ON_SCENE,
        CaseStatus.TRANSPORTING,
        CaseStatus.HOSPITAL_ALERTED,
        CaseStatus.DIVERTED,
        CaseStatus.CLOSED,
    },
    CaseStatus.PATIENT_LOADED: {
        CaseStatus.TRANSPORTING,
        CaseStatus.HOSPITAL_ALERTED,
        CaseStatus.DIVERTED,
        CaseStatus.CLOSED,
    },
    CaseStatus.TRANSPORTING: {
        CaseStatus.HOSPITAL_ALERTED,
        CaseStatus.HOSPITAL_ACKNOWLEDGED,
        CaseStatus.ARRIVED,
        CaseStatus.DIVERTED,
        CaseStatus.CLOSED,
    },
    CaseStatus.HOSPITAL_ALERTED: {
        CaseStatus.HOSPITAL_ACKNOWLEDGED,
        CaseStatus.DIVERTED,
        CaseStatus.ARRIVED,
        CaseStatus.TRANSPORTING,
        CaseStatus.CLOSED,
    },
    CaseStatus.HOSPITAL_ACKNOWLEDGED: {
        CaseStatus.ARRIVED,
        CaseStatus.TRANSPORTING,
        CaseStatus.DIVERTED,
        CaseStatus.HANDOVER_COMPLETE,
        CaseStatus.CLOSED,
    },
    CaseStatus.DIVERTED: {
        CaseStatus.HOSPITAL_ALERTED,
        CaseStatus.HOSPITAL_ACKNOWLEDGED,
        CaseStatus.TRANSPORTING,
        CaseStatus.ARRIVED,
        CaseStatus.CLOSED,
    },
    CaseStatus.ARRIVED: {
        CaseStatus.HANDOVER_COMPLETE,
        CaseStatus.CLOSED,
    },
    CaseStatus.HANDOVER_COMPLETE: {
        CaseStatus.CLOSED,
    },
    CaseStatus.CLOSED: set(),
}


def validate_transition(current_state_str: str, target_state_str: str) -> bool:
    """
    Validates whether transitioning from current_state to target_state is permitted.
    Raises InvalidStateTransitionError if the transition is prohibited.
    """
    try:
        current_state = CaseStatus(current_state_str.upper())
        target_state = CaseStatus(target_state_str.upper())
    except ValueError:
        raise InvalidStateTransitionError(current_state_str, target_state_str)

    if current_state == target_state:
        return True  # Idempotent re-affirmation

    allowed_targets = VALID_TRANSITIONS.get(current_state, set())
    if target_state not in allowed_targets:
        raise InvalidStateTransitionError(current_state.value, target_state.value)

    return True
