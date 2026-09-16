import { apiClient } from './client';

export interface CitizenReportPayload {
  incident_category: string;
  people_count: number;
  has_unconscious: string;
  is_awake: string;
  is_breathing: string;
  visible_concerns: string[];
  location_address: string;
  location_landmark?: string;
  latitude?: number;
  longitude?: number;
  additional_notes?: string;
}

export interface CitizenCaseResponse {
  id: string;
  case_id: string;
  status: string;
  operational_priority: string;
  time_reported: string;
  report: {
    id: string;
    case_id: string;
    incident_category: string;
    people_count: number;
    has_unconscious: string;
    is_awake: string;
    is_breathing: string;
    visible_concerns: string[];
    location_address: string;
    location_landmark?: string;
    latitude?: number;
    longitude?: number;
    additional_notes?: string;
    source: string;
    reported_at: string;
  };
}

export async function submitCitizenReport(
  payload: CitizenReportPayload
): Promise<CitizenCaseResponse> {
  return apiClient<CitizenCaseResponse>('/api/v1/citizen/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCitizenCaseStatus(
  caseId: string
): Promise<CitizenCaseResponse> {
  return apiClient<CitizenCaseResponse>(`/api/v1/citizen/cases/${caseId}`);
}
