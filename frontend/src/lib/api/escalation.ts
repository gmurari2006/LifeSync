import { apiClient } from './client';
import { HospitalAlertEscalationsResponse } from '@/types/escalation';

export async function getHospitalAlertEscalations(
  hospitalId: string
): Promise<HospitalAlertEscalationsResponse> {
  return apiClient<HospitalAlertEscalationsResponse>(
    `/api/v1/hospitals/${hospitalId}/alerts/escalations`
  );
}
