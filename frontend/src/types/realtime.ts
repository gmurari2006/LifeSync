export type RealtimeEventType =
  | 'EMS_VITALS_UPDATED'
  | 'TELEMETRY_UPDATED'
  | 'CASE_ASSIGNED'
  | 'DESTINATION_CONFIRMED'
  | 'HOSPITAL_ACKNOWLEDGED'
  | 'BAY_ASSIGNED'
  | 'DIVERSION_REQUESTED'
  | 'CASE_ARRIVED'
  | 'HANDOVER_COMPLETED'
  | 'SIMULATION_STARTED'
  | 'SIMULATION_PAUSED'
  | 'SIMULATION_RESUMED'
  | 'SIMULATION_STOPPED'
  | 'HEARTBEAT';

export type ProvenanceSource =
  | 'CITIZEN_REPORTED'
  | 'AI_STRUCTURED'
  | 'EMS_VERIFIED'
  | 'HOSPITAL_COORDINATOR'
  | 'SIMULATED_TELEMETRY'
  | 'SYSTEM';

export interface RealtimeEventEnvelope<T = Record<string, unknown>> {
  event_type: RealtimeEventType;
  case_id: string;
  source: ProvenanceSource;
  timestamp: string;
  payload: T;
  version: string;
}

export type SimulationStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'PAUSED'
  | 'STOPPED'
  | 'ARRIVED';

export type SimulationControlAction =
  | 'START'
  | 'PAUSE'
  | 'RESUME'
  | 'STOP'
  | 'STEP'
  | 'RESET';

export interface AmbulanceTelemetryState {
  case_id: string;
  current_latitude: number;
  current_longitude: number;
  speed_kmh: number;
  distance_remaining_km: number;
  eta_minutes: number;
  progress_percent: number;
  status: SimulationStatus;
  speed_multiplier: number;
  destination_hospital_id?: string | null;
  destination_hospital_name?: string | null;
  is_arrived: boolean;
  last_updated: string;
  source: 'SIMULATED_TELEMETRY';
  disclaimer: string;
}

export interface SimulationControlRequest {
  action: SimulationControlAction;
  speed_multiplier?: number;
}
