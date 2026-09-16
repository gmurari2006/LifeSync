import { apiClient } from './client';
import {
  HumanOverrideRequest,
  HumanOverrideResponse,
  OverrideActorRole,
} from '@/types/override';

export interface OverrideActorCredentials {
  actorRole: OverrideActorRole;
  actorId: string;
  actorName: string;
}

export async function submitHumanOverride(
  caseId: string,
  request: HumanOverrideRequest,
  credentials: OverrideActorCredentials
): Promise<HumanOverrideResponse> {
  return apiClient<HumanOverrideResponse>(`/api/v1/cases/${caseId}/override`, {
    method: 'POST',
    headers: {
      'X-Actor-Role': credentials.actorRole,
      'X-Actor-Id': credentials.actorId,
      'X-Actor-Name': credentials.actorName,
    },
    body: JSON.stringify(request),
  });
}
