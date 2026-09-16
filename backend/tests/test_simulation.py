import pytest
from starlette.testclient import TestClient
from app.main import app
from app.simulation.service import SimulationService
from app.simulation.schemas import SimulationControlRequest, SimulationStatus
from app.models.emergency_case import EmergencyCase
from app.models.hospital import Hospital
from app.hospital_matching.service import HospitalMatchingService
from tests.conftest import TestingSessionLocal


def test_simulation_requires_confirmed_destination():
    """
    Mandatory Rule: Simulation must require an existing human-confirmed destination from Step 7.
    It must never select or change a hospital automatically. If no confirmed destination exists,
    it must return a clear backend error.
    """
    db = TestingSessionLocal()
    service = SimulationService()

    # Create a dummy case without destination
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-001").first()
    assert case is not None
    original_dest = case.destination_hospital_id

    try:
        case.destination_hospital_id = None
        db.commit()

        # Attempt to start simulation without confirmed destination
        with pytest.raises(ValueError) as excinfo:
            service.control_simulation(
                db=db,
                case_id=case.id,
                request=SimulationControlRequest(action="START"),
            )
        assert "Cannot start simulation: case destination has not been confirmed" in str(excinfo.value)
    finally:
        case.destination_hospital_id = original_dest
        db.commit()
        db.close()


def test_simulation_movement_and_dynamic_eta():
    """
    Ensure synthetic ambulance simulation advances position, decreases distance remaining,
    and dynamically recalculates ETA without real GPS.
    """
    db = TestingSessionLocal()
    service = SimulationService()
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-101").first()
    assert case is not None
    
    # Confirm destination if not set
    if not case.destination_hospital_id:
        case.destination_hospital_id = "HOSP-CITYCARE-01"
        db.commit()

    # 1. Start simulation
    initial_state = service.control_simulation(
        db=db,
        case_id=case.id,
        request=SimulationControlRequest(action="START", speed_multiplier=1.0),
    )
    assert initial_state.status == SimulationStatus.RUNNING
    assert initial_state.distance_remaining_km > 0
    assert initial_state.eta_minutes > 0
    assert initial_state.source == "SIMULATED_TELEMETRY"

    initial_dist = initial_state.distance_remaining_km
    initial_eta = initial_state.eta_minutes

    # 2. Step forward 60 seconds
    stepped_state = service.step_simulation(db=db, case_id=case.id, delta_seconds=60.0)
    assert stepped_state.distance_remaining_km < initial_dist
    assert stepped_state.progress_percent > 0.0
    assert stepped_state.eta_minutes <= initial_eta

    # 3. Pause and Resume
    paused_state = service.control_simulation(
        db=db,
        case_id=case.id,
        request=SimulationControlRequest(action="PAUSE"),
    )
    assert paused_state.status == SimulationStatus.PAUSED

    resumed_state = service.control_simulation(
        db=db,
        case_id=case.id,
        request=SimulationControlRequest(action="RESUME"),
    )
    assert resumed_state.status == SimulationStatus.RUNNING

    db.close()


def test_simulation_cannot_change_destination():
    """
    Mandatory Rule: Simulation cannot alter or select destination hospital.
    Destination hospital strictly matches the human-confirmed facility.
    """
    db = TestingSessionLocal()
    service = SimulationService()
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-101").first()
    assert case is not None
    if not case.destination_hospital_id:
        case.destination_hospital_id = "HOSP-CITYCARE-01"
        db.commit()

    state = service.get_telemetry(db=db, case_id=case.id)
    assert state.destination_hospital_id == case.destination_hospital_id

    # Step simulation multiple times
    for _ in range(5):
        service.step_simulation(db=db, case_id=case.id, delta_seconds=30.0)

    fresh_case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-101").first()
    assert fresh_case.destination_hospital_id == case.destination_hospital_id
    db.close()


def test_arrival_does_not_complete_handover():
    """
    Mandatory Rule: Simulation arrival must not automatically complete handover or close the case.
    Arrival transitions simulation state to ARRIVED, but HANDOVER_COMPLETED requires explicit human action.
    """
    db = TestingSessionLocal()
    service = SimulationService()
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-101").first()
    assert case is not None
    if not case.destination_hospital_id:
        case.destination_hospital_id = "HOSP-CITYCARE-01"
        db.commit()

    initial_status = case.status

    # Step simulation to completion (100% progress)
    sim = service.get_or_create_simulator(db=db, case_id=case.id, speed_multiplier=10.0)
    sim.start(speed_multiplier=10.0)

    # Fast forward to arrival
    for _ in range(20):
        state, just_arrived = sim.step(delta_seconds=300.0)
        service._handle_telemetry_broadcast(db, case, state, just_arrived)
        if state.is_arrived:
            break

    assert state.is_arrived is True
    assert state.status == SimulationStatus.ARRIVED
    assert state.distance_remaining_km == 0.0
    assert state.eta_minutes == 0.0

    # Verify case state did not automatically complete handover or close
    db.expire_all()
    fresh_case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-101").first()
    assert fresh_case.status != "HANDOVER_COMPLETE"
    assert fresh_case.status != "CLOSED"
    db.close()


def test_simulation_control_api_endpoints(client):
    """
    Verify REST API endpoints for simulation control, telemetry inspection, and manual stepping.
    """
    db = TestingSessionLocal()
    case = db.query(EmergencyCase).filter(EmergencyCase.case_id == "LS-2026-101").first()
    if case and not case.destination_hospital_id:
        case.destination_hospital_id = "HOSP-CITYCARE-01"
        db.commit()
    db.close()

    # 1. Start simulation via API
    res = client.post(
        "/api/v1/simulation/cases/LS-2026-101/control",
        json={"action": "START", "speed_multiplier": 2.0},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "RUNNING"
    assert data["speed_multiplier"] == 2.0
    assert data["source"] == "SIMULATED_TELEMETRY"

    # 2. Query telemetry
    res_get = client.get("/api/v1/simulation/cases/LS-2026-101/telemetry")
    assert res_get.status_code == 200
    telemetry = res_get.json()
    assert "current_latitude" in telemetry
    assert "distance_remaining_km" in telemetry
    assert "eta_minutes" in telemetry

    # 3. Step simulation
    res_step = client.post("/api/v1/simulation/cases/LS-2026-101/step?seconds=10.0")
    assert res_step.status_code == 200
    step_data = res_step.json()
    assert step_data["progress_percent"] >= 0.0
