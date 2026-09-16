export interface AIStructuredEmergencyInfo {
  id?: string;
  case_id: string;
  citizen_report_id?: string | null;
  incident_summary: string;
  incident_category: string;
  people_count: number;
  consciousness: string;
  breathing: string;
  visible_concerns: string[];
  location_summary: string;
  extracted_keywords: string[];
  uncertainty_flags: string[];
  missing_information: string[];
  confidence_score: number;
  source: 'AI_STRUCTURED';
  model_name: string;
  model_version: string;
  prompt_version: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  generated_at: string;
}

export interface AIStructuringRequest {
  force_reprocess?: boolean;
  additional_context?: string;
}

export interface AIStructuringResponse {
  case_id: string;
  status: string;
  ai_structured_info?: AIStructuredEmergencyInfo | null;
  message: string;
}

export interface AIStructuringHistoryResponse {
  case_id: string;
  total_versions: number;
  reports: AIStructuredEmergencyInfo[];
}
