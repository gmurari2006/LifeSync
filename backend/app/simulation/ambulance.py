import math
from datetime import datetime
from typing import Tuple
from app.simulation.schemas import AmbulanceTelemetryState, SimulationStatus
from app.hospital_matching.scoring import calculate_haversine_distance


def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes the initial bearing (compass heading in degrees 0-360) between two coordinates."""
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    diff_lon_rad = math.radians(lon2 - lon1)

    x = math.sin(diff_lon_rad) * math.cos(lat2_rad)
    y = math.cos(lat1_rad) * math.sin(lat2_rad) - (
        math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(diff_lon_rad)
    )
    initial_bearing = math.atan2(x, y)
    initial_bearing_deg = math.degrees(initial_bearing)
    return round((initial_bearing_deg + 360) % 360, 1)


class AmbulanceSimulator:
    """
    Deterministic mathematical simulator for synthetic ambulance transit.
    Zero real GPS hardware: updates coordinates and dynamic ETA along geodesic trajectory.
    """

    def __init__(
        self,
        case_id: str,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
        dest_hospital_id: str,
        dest_hospital_name: str,
        base_speed_kmh: float = 45.0,
        speed_multiplier: float = 1.0,
    ):
        self.case_id = case_id
        self.origin_lat = origin_lat
        self.origin_lon = origin_lon
        self.dest_lat = dest_lat
        self.dest_lon = dest_lon
        self.dest_hospital_id = dest_hospital_id
        self.dest_hospital_name = dest_hospital_name
        self.base_speed_kmh = base_speed_kmh
        self.speed_multiplier = speed_multiplier

        # Calculate initial distance
        self.total_distance_km = calculate_haversine_distance(
            origin_lat, origin_lon, dest_lat, dest_lon
        )
        if self.total_distance_km <= 0.1:
            self.total_distance_km = 4.5  # Fallback synthetic urban radius

        self.current_lat = origin_lat
        self.current_lon = origin_lon
        self.progress_fraction = 0.0
        self.status = SimulationStatus.IDLE
        self.is_arrived = False
        self.last_updated = datetime.utcnow()

    def get_state(self) -> AmbulanceTelemetryState:
        """Returns the current immutable telemetry state snapshot."""
        remaining_dist = round(max(0.0, self.total_distance_km * (1.0 - self.progress_fraction)), 2)
        effective_speed = max(10.0, self.base_speed_kmh * self.speed_multiplier)
        
        # Dynamic ETA: (remaining_dist / effective_speed) * 60 + arrival cushion
        if self.is_arrived or remaining_dist <= 0.05:
            eta_min = 0.0
        else:
            eta_min = round(max(0.5, (remaining_dist / effective_speed) * 60.0), 1)

        heading = calculate_bearing(
            self.current_lat, self.current_lon, self.dest_lat, self.dest_lon
        )

        return AmbulanceTelemetryState(
            case_id=self.case_id,
            status=self.status,
            current_latitude=round(self.current_lat, 6),
            current_longitude=round(self.current_lon, 6),
            origin_latitude=round(self.origin_lat, 6),
            origin_longitude=round(self.origin_lon, 6),
            destination_latitude=round(self.dest_lat, 6),
            destination_longitude=round(self.dest_lon, 6),
            destination_hospital_id=self.dest_hospital_id,
            destination_hospital_name=self.dest_hospital_name,
            speed_kmh=round(effective_speed, 1),
            speed_multiplier=round(self.speed_multiplier, 2),
            distance_total_km=round(self.total_distance_km, 2),
            distance_remaining_km=remaining_dist,
            eta_minutes=eta_min,
            progress_percent=round(self.progress_fraction * 100.0, 1),
            heading_degrees=heading,
            is_arrived=self.is_arrived,
            last_updated=self.last_updated,
            source="SIMULATED_TELEMETRY",
        )

    def start(self, speed_multiplier: float = 1.0):
        """Starts the simulated ambulance movement."""
        self.speed_multiplier = speed_multiplier
        self.status = SimulationStatus.RUNNING
        self.last_updated = datetime.utcnow()

    def pause(self):
        """Pauses the transit simulation."""
        if self.status == SimulationStatus.RUNNING:
            self.status = SimulationStatus.PAUSED
            self.last_updated = datetime.utcnow()

    def resume(self):
        """Resumes a paused simulation."""
        if self.status == SimulationStatus.PAUSED:
            self.status = SimulationStatus.RUNNING
            self.last_updated = datetime.utcnow()

    def stop(self):
        """Stops the simulation."""
        self.status = SimulationStatus.STOPPED
        self.last_updated = datetime.utcnow()

    def reset(self):
        """Resets the simulation to starting origin coordinates."""
        self.current_lat = self.origin_lat
        self.current_lon = self.origin_lon
        self.progress_fraction = 0.0
        self.status = SimulationStatus.IDLE
        self.is_arrived = False
        self.last_updated = datetime.utcnow()

    def step(self, delta_seconds: float = 5.0) -> Tuple[AmbulanceTelemetryState, bool]:
        """
        Advances the simulation forward by delta_seconds.
        Returns (state, just_arrived).
        Note: Arrival triggers arrival state but NEVER executes clinical handover.
        """
        if self.status not in (SimulationStatus.RUNNING, SimulationStatus.IDLE):
            return self.get_state(), False

        # Calculate distance traveled in delta_seconds
        effective_speed_kms = (self.base_speed_kmh * self.speed_multiplier) / 3600.0
        dist_traveled = effective_speed_kms * delta_seconds
        progress_delta = dist_traveled / self.total_distance_km

        self.progress_fraction = min(1.0, self.progress_fraction + progress_delta)

        # Interpolate coordinates
        self.current_lat = self.origin_lat + (self.dest_lat - self.origin_lat) * self.progress_fraction
        self.current_lon = self.origin_lon + (self.dest_lon - self.origin_lon) * self.progress_fraction
        self.last_updated = datetime.utcnow()

        just_arrived = False
        if self.progress_fraction >= 1.0 and not self.is_arrived:
            self.progress_fraction = 1.0
            self.current_lat = self.dest_lat
            self.current_lon = self.dest_lon
            self.is_arrived = True
            self.status = SimulationStatus.ARRIVED
            just_arrived = True

        return self.get_state(), just_arrived
