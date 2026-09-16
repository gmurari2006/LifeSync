export interface HospitalMatchCandidate {
  hospital_id: string;
  hospital_name: string;
  short_name?: string | null;
  trauma_level?: string | null;
  operational_status: string;
  diversion_active: boolean;
  active_surge_level?: string | null;
  is_eligible: boolean;
  exclusion_reasons: string[];
  suitability_score: number;
  capability_score: number;
  eta_score: number;
  capacity_score: number;
  distance_km: number;
  eta_minutes: number;
  available_bays: number;
  total_bays: number;
  capabilities: Array<{
    name: string;
    badge?: string;
    category?: string;
    description?: string;
  }>;
  explanation: string;
  rank?: number | null;
}

export interface HospitalMatchingResult {
  id?: string;
  case_id: string;
  current_destination_id?: string | null;
  recommended_hospital_id?: string | null;
  confirmed_destination_id?: string | null;
  recommendation_label: string;
  status:
    | 'MATCHING_CALCULATED'
    | 'RECOMMENDATION_PRESENTED'
    | 'HUMAN_CONFIRMED'
    | 'REJECTION_RECORDED'
    | 'DIVERSION_RECORDED';
  candidates: HospitalMatchCandidate[];
  generated_at: string;
}

export interface DestinationConfirmRequest {
  hospital_id: string;
  actor_name: string;
  actor_role: 'EMS_PARAMEDIC' | 'ED_COORDINATOR' | 'REGIONAL_DISPATCHER';
  notes?: string;
}

export interface DestinationRejectRequest {
  hospital_id: string;
  reason_code:
    | 'NO_SPECIALTY_AVAILABLE'
    | 'MAXIMUM_SURGE_CAPACITY'
    | 'CT_CATH_LAB_OFFLINE'
    | 'TRAUMA_TEAM_COMMITTED'
    | 'CLINICAL_PREFERENCE'
    | 'OTHER';
  reason_description?: string;
  actor_name: string;
  actor_role: 'EMS_PARAMEDIC' | 'ED_COORDINATOR' | 'REGIONAL_DISPATCHER';
}

export interface HospitalDivertRequest {
  hospital_id: string;
  reason_code:
    | 'NO_SPECIALTY_AVAILABLE'
    | 'MAXIMUM_SURGE_CAPACITY'
    | 'CT_CATH_LAB_OFFLINE'
    | 'TRAUMA_TEAM_COMMITTED'
    | 'ED_GRIDLOCK'
    | 'OTHER';
  reason_description?: string;
  actor_name: string;
  actor_role: 'ED_COORDINATOR' | 'HOSPITAL_PHYSICIAN' | 'HOSPITAL_ADMIN';
}

export interface HospitalDecisionLogItem {
  id: string;
  case_id: string;
  hospital_id: string;
  decision_type: string;
  reason_code?: string | null;
  reason_description?: string | null;
  actor_name: string;
  actor_role: string;
  created_at: string;
}

export interface HospitalMatchingHistoryResponse {
  case_id: string;
  current_destination_id?: string | null;
  total_matching_runs: number;
  matching_runs: HospitalMatchingResult[];
  decision_logs: HospitalDecisionLogItem[];
}
