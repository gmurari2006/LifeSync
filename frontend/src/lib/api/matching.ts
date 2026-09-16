import { apiClient } from './client';
import {
  HospitalMatchingResult,
  DestinationConfirmRequest,
  DestinationRejectRequest,
  HospitalDivertRequest,
  HospitalMatchingHistoryResponse,
} from '@/types/matching';

export interface CalculateMatchingParams {
  case_id: string;
  search_radius_km?: number;
  require_bays?: boolean;
}

export const matchingApi = {
  /**
   * Calculate or recalculate deterministic hospital matching recommendations for a case.
   */
  calculateMatching: async (
    params: CalculateMatchingParams
  ): Promise<HospitalMatchingResult> => {
    return apiClient<HospitalMatchingResult>('/api/v1/hospital-matching/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Get latest matching result for a case.
   */
  getLatestMatching: async (caseId: string): Promise<HospitalMatchingResult> => {
    return apiClient<HospitalMatchingResult>(
      `/api/v1/hospital-matching/cases/${caseId}`
    );
  },

  /**
   * Explicitly confirm a destination hospital for a case (Authorized Human Confirmation).
   */
  confirmDestination: async (
    caseId: string,
    payload: DestinationConfirmRequest
  ): Promise<any> => {
    return apiClient<any>('/api/v1/hospital-matching/confirm', {
      method: 'POST',
      body: JSON.stringify({
        case_id: caseId,
        ...payload,
      }),
    });
  },

  /**
   * Record hospital rejection of destination and return alternative recommendations.
   */
  rejectDestination: async (
    caseId: string,
    payload: DestinationRejectRequest
  ): Promise<HospitalMatchingResult> => {
    return apiClient<HospitalMatchingResult>('/api/v1/hospital-matching/reject', {
      method: 'POST',
      body: JSON.stringify({
        case_id: caseId,
        ...payload,
      }),
    });
  },

  /**
   * Record hospital diversion request and return alternative recommendations.
   */
  divertHospital: async (
    caseId: string,
    payload: HospitalDivertRequest
  ): Promise<HospitalMatchingResult> => {
    return apiClient<HospitalMatchingResult>('/api/v1/hospital-matching/divert', {
      method: 'POST',
      body: JSON.stringify({
        case_id: caseId,
        ...payload,
      }),
    });
  },

  /**
   * Get complete matching calculation history and decision audit logs for a case.
   */
  getMatchingHistory: async (
    caseId: string
  ): Promise<HospitalMatchingHistoryResponse> => {
    return apiClient<HospitalMatchingHistoryResponse>(
      `/api/v1/hospital-matching/cases/${caseId}/history`
    );
  },
};
