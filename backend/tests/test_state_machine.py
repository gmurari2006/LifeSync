import pytest
from app.services.state_machine import validate_transition, InvalidStateTransitionError, CaseStatus


def test_valid_state_transitions():
    """Verify permitted emergency case state transitions."""
    assert validate_transition("REPORTED", "INFORMATION_STRUCTURED") is True
    assert validate_transition("REPORTED", "EMS_ASSIGNED") is True
    assert validate_transition("EMS_ASSIGNED", "EMS_ACCEPTED") is True
    assert validate_transition("EMS_ACCEPTED", "ON_SCENE") is True
    assert validate_transition("ON_SCENE", "ASSESSMENT_UPDATED") is True
    assert validate_transition("ON_SCENE", "PATIENT_LOADED") is True
    assert validate_transition("PATIENT_LOADED", "TRANSPORTING") is True
    assert validate_transition("TRANSPORTING", "HOSPITAL_ALERTED") is True
    assert validate_transition("TRANSPORTING", "HOSPITAL_ACKNOWLEDGED") is True
    assert validate_transition("HOSPITAL_ACKNOWLEDGED", "ARRIVED") is True
    assert validate_transition("ARRIVED", "HANDOVER_COMPLETE") is True
    assert validate_transition("HANDOVER_COMPLETE", "CLOSED") is True


def test_idempotent_transition():
    """Verify transitions to identical state are permitted as idempotent re-affirmations."""
    assert validate_transition("TRANSPORTING", "TRANSPORTING") is True
    assert validate_transition("REPORTED", "REPORTED") is True


def test_prohibited_state_transitions():
    """Verify illegal jumps across lifecycle boundaries raise InvalidStateTransitionError."""
    # Cannot jump directly from REPORTED to HANDOVER_COMPLETE
    with pytest.raises(InvalidStateTransitionError):
        validate_transition("REPORTED", "HANDOVER_COMPLETE")

    # Cannot jump from REPORTED directly to ARRIVED
    with pytest.raises(InvalidStateTransitionError):
        validate_transition("REPORTED", "ARRIVED")

    # Cannot reopen from CLOSED
    with pytest.raises(InvalidStateTransitionError):
        validate_transition("CLOSED", "REPORTED")


def test_unknown_state():
    """Verify invalid state name strings raise InvalidStateTransitionError."""
    with pytest.raises(InvalidStateTransitionError):
        validate_transition("NON_EXISTENT_STATE", "TRANSPORTING")
