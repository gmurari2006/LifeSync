export type EscalationTier = 'TIER_0_NORMAL' | 'TIER_1_VISUAL' | 'TIER_2_PUSH' | 'TIER_3_DISPATCH' | 'ACKNOWLEDGED';

export interface AlertEscalationStatus {
  case_id: string;
  case_code: string;
  hospital_id: string;
  hospital_name: string;
  time_alerted: string;
  seconds_elapsed: number;
  escalation_tier: EscalationTier;
  is_escalated: boolean;
  requires_audible_chime: boolean;
  requires_dispatch_alert: boolean;
  acknowledged: boolean;
}

export interface HospitalAlertEscalationsResponse {
  hospital_id: string;
  hospital_name: string;
  total_unacknowledged_alerts: number;
  max_escalation_tier: EscalationTier;
  escalations: AlertEscalationStatus[];
}
