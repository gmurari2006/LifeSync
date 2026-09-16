from enum import Enum
from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field


class SimulationStatus(str, Enum):
    """Lifecycle status of synthetic ambulance transit simulation."""
    IDLE = "IDLE"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    STOPPED = "STOPPED"
    ARRIVED = "ARRIVED"


class AmbulanceTelemetryState(BaseModel):
    """
    Synthetic telemetry representation of ambulance transit.
    Strictly simulated: zero real GPS or vehicle hardware.
    """
    case_id: str
    status: SimulationStatus = SimulationStatus.IDLE
    current_latitude: float
    current_longitude: float
    origin_latitude: float
    origin_longitude: float
    destination_latitude: float
    destination_longitude: float
    destination_hospital_id: Optional[str] = None
    destination_hospital_name: Optional[str] = None
    speed_kmh: float = 45.0
    speed_multiplier: float = 1.0
    distance_total_km: float
    distance_remaining_km: float
    eta_minutes: float
    progress_percent: float = Field(0.0, ge=0.0, le=100.0)
    heading_degrees: float = 0.0
    is_arrived: bool = False
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    source: str = "SIMULATED_TELEMETRY"


class SimulationControlRequest(BaseModel):
    """Control commands for managing synthetic ambulance movements."""
    action: Literal["START", "PAUSE", "RESUME", "STOP", "STEP", "RESET"]
    speed_multiplier: Optional[float] = Field(1.0, ge=0.1, le=50.0)
    step_seconds: Optional[float] = Field(5.0, ge=0.5, le=60.0)
