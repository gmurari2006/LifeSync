export type OverrideParameter = 'OPERATIONAL_PRIORITY' | 'DESTINATION_HOSPITAL' | 'AMBULANCE_CLASS';

export type OverrideActorRole =
  | 'EMS_PARAMEDIC'
  | 'EMERGENCY_PHYSICIAN'
  | 'ED_COORDINATOR'
  | 'REGIONAL_DISPATCHER';

export interface HumanOverrideRequest {
  parameter_overridden: OverrideParameter;
  new_value: string;
  reason_code: string;
  free_text_justification: string;
}

export interface HumanOverrideResponse {
  case_id: string;
  parameter_overridden: OverrideParameter;
  previous_value: string | null;
  new_value: string;
  reason_code: string;
  free_text_justification: string;
  actor_user_id: string;
  actor_role: OverrideActorRole;
  actor_name: string;
  recorded_at: string;
  audit_event_id: string;
}

export interface ReasonCodeOption {
  code: string;
  label: string;
  description: string;
}

export const REASON_CODES_BY_PARAMETER: Record<OverrideParameter, ReasonCodeOption[]> = {
  OPERATIONAL_PRIORITY: [
    {
      code: 'CLINICAL_ACUITY_DISCREPANCY',
      label: 'Clinical Acuity Discrepancy',
      description: 'Physical patient presentation differs significantly from initial report.',
    },
    {
      code: 'PARAMEDIC_FIELD_JUDGMENT',
      label: 'Paramedic Field Judgment',
      description: 'On-scene clinical assessment warrants elevated or downgraded priority.',
    },
    {
      code: 'OTHER',
      label: 'Other Justification',
      description: 'Specific clinical reason detailed in mandatory notes.',
    },
  ],
  DESTINATION_HOSPITAL: [
    {
      code: 'SPECIALIST_UNAVAILABLE',
      label: 'Specialist / Service Unavailable',
      description: 'Destination cannot provide required specialist immediately.',
    },
    {
      code: 'DIVERT_OVERRIDE',
      label: 'Divert Status Override',
      description: 'Critical proximity override despite hospital diversion warning.',
    },
    {
      code: 'CLINICAL_PREFERENCE',
      label: 'Clinical Protocol Preference',
      description: 'Standard protocol requires designated tertiary care destination.',
    },
    {
      code: 'NO_SPECIALTY_AVAILABLE',
      label: 'No Specialty Available',
      description: 'Required specialty care service not operational.',
    },
    {
      code: 'MAXIMUM_SURGE_CAPACITY',
      label: 'Maximum Surge Capacity Exceeded',
      description: 'Receiving facility experiencing severe surge overcrowding.',
    },
    {
      code: 'CT_CATH_LAB_OFFLINE',
      label: 'CT / Cath Lab Offline',
      description: 'Diagnostic equipment undergoing emergency downtime.',
    },
    {
      code: 'TRAUMA_TEAM_COMMITTED',
      label: 'Trauma Team Committed',
      description: 'Emergency trauma resuscitation team actively engaged in concurrent surgery.',
    },
    {
      code: 'OTHER',
      label: 'Other Operational Justification',
      description: 'Operational override justified with documented notes.',
    },
  ],
  AMBULANCE_CLASS: [
    {
      code: 'ACUITY_UPGRADE_REQUIRED',
      label: 'Acuity Upgrade to ALS Required',
      description: 'Patient requires Advanced Life Support airway, cardiac, or IV medications.',
    },
    {
      code: 'BLS_SUFFICIENT',
      label: 'BLS Unit Sufficient',
      description: 'Patient stable, basic life support transport adequate.',
    },
    {
      code: 'OTHER',
      label: 'Other Justification',
      description: 'Vehicle class override with documented rationale.',
    },
  ],
};
