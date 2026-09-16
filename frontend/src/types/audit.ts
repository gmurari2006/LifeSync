export interface CaseAuditEventItem {
  id: string;
  case_id: string;
  timestamp: string;
  event_type: string;
  actor_type: 'CITIZEN' | 'EMS' | 'HOSPITAL' | 'SYSTEM';
  actor_name: string;
  previous_state?: string | null;
  new_state?: string | null;
  title: string;
  description: string;
  event_metadata: Record<string, any>;
}

export interface CaseAuditTimelineResponse {
  case_id: string;
  case_code: string;
  total_events: number;
  current_status: string;
  events: CaseAuditEventItem[];
}

