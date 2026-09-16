import logging
from typing import Dict, Optional, Tuple
from sqlalchemy.orm import Session
from app.simulation.schemas import (
    AmbulanceTelemetryState,
    SimulationStatus,
    SimulationControlRequest,
)
from app.simulation.ambulance import AmbulanceSimulator
from app.models.emergency_case import EmergencyCase
from app.models.hospital import Hospital
from app.services.case_service import get_case_by_identifier, update_case_lifecycle_state
from app.services.audit_service import create_audit_event
from app.realtime.events import publish_case_event
from app.realtime.schemas import RealtimeEventType, ProvenanceSource

logger = logging.getLogger(__name__)


class SimulationService:
    """
    Simulation Coordinator for synthetic ambulance telemetry and live EMS-Hospital synchronization.
    Enforces mandatory safety rules:
    - Requires an existing human-confirmed destination from Step 7 before starting.
    - Never automatically changes hospital destination.
    - Never automatically executes bedside handover or closes the case upon arrival.
    """

    def __init__(self):
        # case_id -> AmbulanceSimulator
        self._simulators: Dict[str, AmbulanceSimulator] = {}

    def get_or_create_simulator(
        self,
        db: Session,
        case_id: str,
        speed_multiplier: float = 1.0,
    ) -> AmbulanceSimulator:
        """
        Retrieves active simulator or initializes a new one from authoritative case and hospital records.
        """
        case = get_case_by_identifier(db, case_id)
        if not case:
            raise ValueError(f"Emergency case '{case_id}' not found.")

        # Mandatory Safety Gate: Must have a confirmed destination hospital
        if not case.destination_hospital_id:
            raise ValueError(
                "Cannot start simulation: case destination has not been confirmed by an authorized human operator."
            )

        hospital = db.query(Hospital).filter(Hospital.id == case.destination_hospital_id).first()
        if not hospital:
            raise ValueError(f"Destination hospital '{case.destination_hospital_id}' not found in registry.")

        canonical_case_id = case.case_id or case.id
        if canonical_case_id in self._simulators:
            sim = self._simulators[canonical_case_id]
            # If destination was updated, re-anchor destination coordinates
            if sim.dest_hospital_id != hospital.id:
                sim.dest_hospital_id = hospital.id
                sim.dest_hospital_name = hospital.name
                sim.dest_lat = hospital.latitude or 37.7749
                sim.dest_lon = hospital.longitude or -122.4194
                sim.total_distance_km = 4.5
            return sim

        # Default synthetic origin coordinates if none recorded
        origin_lat = case.latitude if case.latitude is not None else 37.7833
        origin_lon = case.longitude if case.longitude is not None else -122.4167
        dest_lat = hospital.latitude if hospital.latitude is not None else 37.7749
        dest_lon = hospital.longitude if hospital.longitude is not None else -122.4194

        sim = AmbulanceSimulator(
            case_id=canonical_case_id,
            origin_lat=origin_lat,
            origin_lon=origin_lon,
            dest_lat=dest_lat,
            dest_lon=dest_lon,
            dest_hospital_id=hospital.id,
            dest_hospital_name=hospital.name,
            base_speed_kmh=45.0,
            speed_multiplier=speed_multiplier,
        )
        self._simulators[canonical_case_id] = sim
        return sim

    def control_simulation(
        self,
        db: Session,
        case_id: str,
        request: SimulationControlRequest,
    ) -> AmbulanceTelemetryState:
        """
        Executes a control action (START, PAUSE, RESUME, STOP, STEP, RESET) on the case simulation.
        """
        sim = self.get_or_create_simulator(
            db=db,
            case_id=case_id,
            speed_multiplier=request.speed_multiplier or 1.0,
        )

        case = get_case_by_identifier(db, case_id)
        if not case:
            raise ValueError(f"Emergency case '{case_id}' not found.")

        action = request.action.upper()

        if action == "START":
            sim.start(speed_multiplier=request.speed_multiplier or 1.0)
            # Advance case state to TRANSPORTING if currently in on-scene or dispatched
            if case.status in ("DISPATCHED", "ON_SCENE", "ASSESSMENT_UPDATED", "HOSPITAL_ACKNOWLEDGED"):
                try:
                    update_case_lifecycle_state(
                        db=db,
                        case_identifier=case.id,
                        target_status="TRANSPORTING",
                        actor_type="EMS",
                        actor_name="Paramedic Crew (Unit 12)",
                        notes="Commenced simulated patient transport.",
                    )
                except Exception:
                    pass

            create_audit_event(
                db=db,
                case_id=case.id,
                event_type="AMBULANCE_SIMULATION_STARTED",
                actor_type="SYSTEM",
                actor_name="Ambulance Telemetry Engine",
                title="Ambulance Transit Simulation Started",
                description=f"Simulated transit initiated towards {sim.dest_hospital_name} at {sim.speed_multiplier}x demo speed.",
                event_metadata=sim.get_state().model_dump(mode="json"),
            )
            db.commit()

        elif action == "PAUSE":
            sim.pause()
        elif action == "RESUME":
            sim.resume()
        elif action == "STOP":
            sim.stop()
        elif action == "RESET":
            sim.reset()
        elif action == "STEP":
            state, just_arrived = sim.step(delta_seconds=request.step_seconds or 5.0)
            self._handle_telemetry_broadcast(db, case, state, just_arrived)
            return state

        state = sim.get_state()
        self._handle_telemetry_broadcast(db, case, state, just_arrived=False)
        return state

    def step_simulation(
        self,
        db: Session,
        case_id: str,
        delta_seconds: float = 5.0,
    ) -> AmbulanceTelemetryState:
        """Advance simulation by a discrete time step."""
        sim = self.get_or_create_simulator(db=db, case_id=case_id)
        case = get_case_by_identifier(db, case_id)
        if not case:
            raise ValueError(f"Emergency case '{case_id}' not found.")

        state, just_arrived = sim.step(delta_seconds=delta_seconds)
        self._handle_telemetry_broadcast(db, case, state, just_arrived)
        return state

    def get_telemetry(
        self,
        db: Session,
        case_id: str,
    ) -> AmbulanceTelemetryState:
        """Retrieves the current telemetry snapshot for a case."""
        sim = self.get_or_create_simulator(db=db, case_id=case_id)
        return sim.get_state()

    def _handle_telemetry_broadcast(
        self,
        db: Session,
        case: EmergencyCase,
        state: AmbulanceTelemetryState,
        just_arrived: bool,
    ):
        """
        Emits delivery-only WebSocket events for position and ETA updates.
        If arrived, updates case state to ARRIVED without executing handover.
        """
        payload = state.model_dump(mode="json")

        # 1. Broadcast real-time position
        publish_case_event(
            case_id=case.case_id,
            event_type=RealtimeEventType.AMBULANCE_POSITION_UPDATED,
            source=ProvenanceSource.SIMULATED_TELEMETRY,
            payload=payload,
        )

        # 2. Broadcast real-time dynamic ETA
        publish_case_event(
            case_id=case.case_id,
            event_type=RealtimeEventType.ETA_UPDATED,
            source=ProvenanceSource.SIMULATED_TELEMETRY,
            payload={
                "eta_minutes": state.eta_minutes,
                "distance_remaining_km": state.distance_remaining_km,
                "progress_percent": state.progress_percent,
                "destination_hospital_name": state.destination_hospital_name,
            },
        )

        # 3. Handle Arrival (Delivery + Audit, strictly NO automatic handover)
        if just_arrived:
            if case.status in ("TRANSPORTING", "HOSPITAL_ACKNOWLEDGED", "READY_FOR_ARRIVAL"):
                try:
                    update_case_lifecycle_state(
                        db=db,
                        case_identifier=case.id,
                        target_status="ARRIVED",
                        actor_type="EMS",
                        actor_name="Paramedic Crew (Unit 12)",
                        notes=f"Ambulance arrived at {state.destination_hospital_name}. Awaiting bedside handover.",
                    )
                except Exception:
                    pass

            create_audit_event(
                db=db,
                case_id=case.id,
                event_type="AMBULANCE_ARRIVED_AT_HOSPITAL",
                actor_type="EMS",
                actor_name="Ambulance Telemetry Engine",
                title="Ambulance Arrived at Hospital ED",
                description=f"Ambulance arrived at {state.destination_hospital_name}. Ready for clinical handover.",
                event_metadata=payload,
            )
            db.commit()

            publish_case_event(
                case_id=case.case_id,
                event_type=RealtimeEventType.CASE_ARRIVED,
                source=ProvenanceSource.SIMULATED_TELEMETRY,
                payload={
                    "case_id": case.case_id,
                    "destination_hospital_id": state.destination_hospital_id,
                    "destination_hospital_name": state.destination_hospital_name,
                    "message": "Simulated ambulance has arrived at the hospital ED bay.",
                },
            )


# Global singleton simulation service
simulation_service = SimulationService()
