import { apiClient } from './client';

export interface CaseListResponse {
  total: number;
  cases: any[];
}

export async function getCases(params?: {
  status?: string;
  priority?: string;
  hospital_id?: string;
  unit_id?: string;
  limit?: number;
  offset?: number;
}) {
  return apiClient<CaseListResponse>('/api/v1/cases', {
    params,
  });
}

export async function getCase(caseId: string) {
  return apiClient<any>(`/api/v1/cases/${caseId}`);
}

export async function updateCaseStatus(
  caseId: string,
  payload: {
    status: string;
    actor_type?: string;
    actor_name?: string;
    notes?: string;
  }
) {
  return apiClient<any>(`/api/v1/cases/${caseId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
