import { apiClient } from './client';
import { EmergencyCase } from '@/types/hospital';

export interface ScenarioMetadata {
  id: string;
  scenario_number: number;
  title: string;
  clinical_domain: string;
  patient_description: string;
  incident_category: string;
  acuity_priority: string;
  target_hospital_id: string;
  target_hospital_name: string;
  assigned_unit_id: string;
  assigned_unit_type: string;
  recommended_bay: string;
  red_rule_id?: string | null;
  summary: string;
  demo_talking_points: string[];
}

export interface ScenarioResetResult {
  status: string;
  message: string;
  details: {
    cases: number;
    audit_events: number;
    vitals: number;
    verifications: number;
    ai_reports: number;
    citizen_reports: number;
  };
}

export const scenariosApi = {
  /**
   * List all 5 canonical PRD demonstration scenarios
   */
  listScenarios: async (): Promise<ScenarioMetadata[]> => {
    return apiClient<ScenarioMetadata[]>('/api/v1/scenarios');
  },

  /**
   * Get single scenario metadata by ID
   */
  getScenario: async (scenarioId: string): Promise<ScenarioMetadata> => {
    return apiClient<ScenarioMetadata>(`/api/v1/scenarios/${scenarioId}`);
  },

  /**
   * Load and initialize a canonical demo scenario (modifying only LS-SCENARIO-* records)
   */
  loadScenario: async (scenarioId: string): Promise<EmergencyCase> => {
    return apiClient<EmergencyCase>(`/api/v1/scenarios/${scenarioId}/load`, {
      method: 'POST',
    });
  },

  /**
   * Reset all synthetic scenario state (LS-SCENARIO-* only)
   */
  resetScenarios: async (): Promise<ScenarioResetResult> => {
    return apiClient<ScenarioResetResult>('/api/v1/scenarios/reset', {
      method: 'POST',
    });
  },
};
