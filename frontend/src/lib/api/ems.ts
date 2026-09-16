import { apiClient } from './client';

export interface EMSVerificationPayload {
  consciousness: string;
  breathing: string;
  bleeding: string;
  airway: string;
  clinical_notes?: string;
  verified_by?: string;
}

export interface EMSVitalsPayload {
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  oxygen_saturation: number;
  respiratory_rate: number;
  temperature: number;
  gcs: number;
  pain_score?: number;
  blood_glucose?: number;
  recorded_by?: string;
}

export interface EMSTransportStatusPayload {
  status: string;
  updated_by?: string;
}

export interface EMSHandoverPayload {
  receiving_staff: string;
  notes?: string;
}

export async function getEMSCases(params?: { unit_id?: string; status?: string }) {
  return apiClient<any[]>('/api/v1/ems/cases', {
    params,
  });
}

export async function getEMSCase(caseId: string) {
  return apiClient<any>(`/api/v1/ems/cases/${caseId}`);
}

export async function verifySceneAssessment(
  caseId: string,
  payload: EMSVerificationPayload
) {
  return apiClient<any>(`/api/v1/ems/cases/${caseId}/verify`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function streamPatientVitals(
  caseId: string,
  payload: EMSVitalsPayload
) {
  return apiClient<any>(`/api/v1/ems/cases/${caseId}/vitals`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateEMSTransportStatus(
  caseId: string,
  payload: EMSTransportStatusPayload
) {
  return apiClient<any>(`/api/v1/ems/cases/${caseId}/status`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function completeEMSHandover(
  caseId: string,
  payload: EMSHandoverPayload
) {
  return apiClient<any>(`/api/v1/ems/cases/${caseId}/handover`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
