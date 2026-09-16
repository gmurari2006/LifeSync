import { apiClient } from './client';
import {
  AIStructuredEmergencyInfo,
  AIStructuringRequest,
  AIStructuringResponse,
  AIStructuringHistoryResponse,
} from '@/types/ai';

export const aiApi = {
  /**
   * Trigger AI information structuring for an emergency case.
   */
  structureCase: async (
    caseId: string,
    payload?: AIStructuringRequest
  ): Promise<AIStructuringResponse> => {
    return apiClient<AIStructuringResponse>(`/api/v1/ai/cases/${caseId}/structure`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  },

  /**
   * Get latest AI-structured report for an emergency case.
   */
  getLatestReport: async (caseId: string): Promise<AIStructuredEmergencyInfo> => {
    return apiClient<AIStructuredEmergencyInfo>(`/api/v1/ai/cases/${caseId}`);
  },

  /**
   * Get versioned history of AI structuring reports for an emergency case.
   */
  getReportHistory: async (caseId: string): Promise<AIStructuringHistoryResponse> => {
    return apiClient<AIStructuringHistoryResponse>(`/api/v1/ai/cases/${caseId}/history`);
  },
};
