import { apiClient } from './client';

export interface HospitalAcknowledgePayload {
  assigned_bay?: string;
  acknowledged_by?: string;
  notes?: string;
}

export interface HospitalDivertPayload {
  divert_reason_code: string;
  divert_notes?: string;
  diverted_by?: string;
}

export interface HospitalResourceUpdatePayload {
  status?: string;
  available_capacity?: number;
  assigned_case_id?: string;
  notes?: string;
}

export async function getHospitals() {
  return apiClient<any[]>('/api/v1/hospitals');
}

export async function getHospital(hospitalId: string) {
  return apiClient<any>(`/api/v1/hospitals/${hospitalId}`);
}

export async function getHospitalCases(
  hospitalId: string,
  params?: { status?: string }
) {
  return apiClient<any[]>(`/api/v1/hospitals/${hospitalId}/cases`, {
    params,
  });
}

export async function acknowledgeHospitalCase(
  hospitalId: string,
  caseId: string,
  payload: HospitalAcknowledgePayload
) {
  return apiClient<any>(
    `/api/v1/hospitals/${hospitalId}/cases/${caseId}/acknowledge`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function divertHospitalCase(
  hospitalId: string,
  caseId: string,
  payload: HospitalDivertPayload
) {
  return apiClient<any>(
    `/api/v1/hospitals/${hospitalId}/cases/${caseId}/divert`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function getHospitalReadiness(hospitalId: string) {
  return apiClient<any>(`/api/v1/hospitals/${hospitalId}/readiness`);
}

export async function patchHospitalResource(
  hospitalId: string,
  resourceId: string,
  payload: HospitalResourceUpdatePayload
) {
  return apiClient<any>(
    `/api/v1/hospitals/${hospitalId}/readiness/${resourceId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}
