import { apiClient } from './client';
import {
  AmbulanceTelemetryState,
  SimulationControlAction,
  SimulationControlRequest,
} from '@/types/realtime';

export const simulationApi = {
  /**
   * Control the synthetic ambulance movement simulation.
   * Actions: START, PAUSE, RESUME, STOP, STEP, RESET.
   * Requires confirmed destination from Step 7 before starting.
   */
  controlSimulation: async (
    caseId: string,
    action: SimulationControlAction,
    speedMultiplier: number = 1.0
  ): Promise<AmbulanceTelemetryState> => {
    const payload: SimulationControlRequest = {
      action,
      speed_multiplier: speedMultiplier,
    };
    return apiClient<AmbulanceTelemetryState>(
      `/api/v1/simulation/cases/${caseId}/control`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Retrieve current synthetic ambulance telemetry snapshot.
   */
  getTelemetry: async (caseId: string): Promise<AmbulanceTelemetryState> => {
    return apiClient<AmbulanceTelemetryState>(
      `/api/v1/simulation/cases/${caseId}/telemetry`
    );
  },

  /**
   * Step the simulation forward by discrete seconds.
   */
  stepSimulation: async (
    caseId: string,
    seconds: number = 10.0
  ): Promise<AmbulanceTelemetryState> => {
    return apiClient<AmbulanceTelemetryState>(
      `/api/v1/simulation/cases/${caseId}/step?seconds=${seconds}`,
      {
        method: 'POST',
      }
    );
  },
};
