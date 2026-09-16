export type IncidentCategory = 
  | 'Road Accident'
  | 'Fall'
  | 'Sudden Illness'
  | 'Breathing Problem'
  | 'Chest Pain'
  | 'Unconscious Person'
  | 'Fire / Burn'
  | 'Other';

export type YesNoNotSure = 'Yes' | 'No' | 'Not Sure';

export type VisibleConcern = 
  | 'Heavy bleeding'
  | 'Difficulty breathing'
  | 'Chest discomfort'
  | 'Severe pain'
  | 'Confusion'
  | 'Seizure-like activity'
  | 'Major injury'
  | 'Trapped in vehicle / debris'
  | 'None noticed'
  | 'Not sure';

export interface LocationData {
  address: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  accuracyText: string;
  isSimulated: boolean;
}

export interface CitizenEmergencyReport {
  incidentType: IncidentCategory | '';
  peopleCount: number | '4+';
  hasUnconscious: YesNoNotSure;
  isAwake: YesNoNotSure;
  isBreathingNormally: YesNoNotSure;
  visibleConcerns: VisibleConcern[];
  location: LocationData;
  additionalNotes?: string;
}

export interface CitizenCase {
  caseId: string; // e.g. 'LS-2026-101'
  report: CitizenEmergencyReport;
  submittedAt: string;
  status: 'Report Received' | 'Information Structured' | 'Awaiting EMS' | 'Hospital Alerted';
  currentStage: number; // 1 to 4
  destinationHospitalName?: string;
  assignedEmsUnit?: string;
  estimatedEtaMinutes?: number;
}
