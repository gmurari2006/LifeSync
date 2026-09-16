import { apiClient } from './client';
import { CaseAuditTimelineResponse } from '@/types/audit';

export async function getCaseAuditTimeline(caseId: string): Promise<CaseAuditTimelineResponse> {
  return apiClient<CaseAuditTimelineResponse>(`/api/v1/cases/${caseId}/audit-timeline`);
}
