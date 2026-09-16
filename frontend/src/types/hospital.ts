export type OperationalPriority = 'Critical' | 'High' | 'Moderate' | 'Low';

export type CaseStatus = 
  | 'Alerted'
  | 'Acknowledged'
  | 'Preparing'
  | 'En Route'
  | 'Arrived'
  | 'Handover'
  | 'Diverted'
  | 'Closed';

export type EmsTransportStatus = 
  | 'Dispatched'
  | 'En Route to Scene'
  | 'On Scene'
  | 'Transporting'
  | 'Arrived at Bay'
  | 'Handover Complete';

export type ConsciousnessLevel = 'Alert' | 'Voice' | 'Pain' | 'Unresponsive';

export type ResourceStatus = 'Ready' | 'Limited' | 'Unavailable' | 'Occupied';

export type ResourceCategory = 
  | 'Emergency Bay'
  | 'Resuscitation Unit'
  | 'Specialist Team'
  | 'Critical Equipment'
  | 'Diagnostics / Imaging'
  | 'Surgical / OR'
  | 'Blood Bank';

export interface PreArrivalVitals {
  heartRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  gcs?: number;
  temperature?: number;
  painScale?: number; // 1-10
  lastUpdated?: string;
  source: 'Reported / Bystander' | 'EMS Verified';
}

export interface PreArrivalClinicalSummary {
  chiefComplaint: string;
  reportedSymptoms: string[];
  pertinentNegatives: string[];
  mechanismOfInjury?: string;
  symptomOnsetMinutes?: number;
  consciousness: ConsciousnessLevel;
  knownAllergies: string[];
  knownMedications: string[];
  relevantHistory: string[];
  initialObservations: string;
  aiStructuringNotes?: string;
  specialtyRequirements: string[];
}

export interface EmsUnitInfo {
  unitId: string;
  vehicleType: 'ALS (Advanced Life Support)' | 'BLS (Basic Life Support)' | 'MICU (Mobile Intensive Care)';
  crewNames: string[];
  crewContact: string;
  currentLocationName: string;
  speedKmH: number;
  distanceRemainingKm: number;
  etaMinutes: number;
  transportStatus: EmsTransportStatus;
  lastTelemetryTimestamp: string;
  verifiedVitals?: PreArrivalVitals;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  relativeTime: string;
  title: string;
  description: string;
  actor: string;
  actorRole: string;
  stage: CaseStatus;
  type: 'system' | 'ems' | 'hospital' | 'bystander';
}

export interface EmergencyCase {
  id: string; // e.g., 'LS-2026-001'
  incidentType: string;
  operationalPriority: OperationalPriority;
  status: CaseStatus;
  patientAge: number;
  patientSex: 'Male' | 'Female' | 'Unknown';
  patientCount: number;
  reportedLocation: string;
  destinationHospitalId: string;
  destinationHospitalName: string;
  assignedBay?: string;
  timeReported: string;
  timeAlerted: string;
  timeAcknowledged?: string;
  acknowledgedBy?: string;
  divertedAt?: string;
  divertReason?: string;
  divertNotes?: string;
  clinicalSummary: PreArrivalClinicalSummary;
  emsUnit: EmsUnitInfo;
  timeline: TimelineEvent[];
  readinessChecklist: {
    id: string;
    label: string;
    completed: boolean;
    requiredFor: string;
  }[];
}

export interface HospitalResourceItem {
  id: string;
  name: string;
  category: ResourceCategory;
  status: ResourceStatus;
  totalCapacity: number;
  availableCapacity: number;
  assignedCaseId?: string;
  location: string;
  lastUpdated: string;
  notes?: string;
}

export interface HospitalProfile {
  id: string;
  name: string;
  shortName: string;
  traumaLevel: string;
  operationalStatus: 'Operational' | 'Degraded' | 'Offline';
  diversionActive: boolean;
  activeSurgeLevel: 'Normal' | 'Level 1 Surge' | 'Level 2 Surge' | 'Maximum Capacity';
  totalBays: number;
  availableBays: number;
  onDutyCoordinator: string;
  coordinatorRole: string;
  phone: string;
  address: string;
  capabilities: {
    name: string;
    available: boolean;
    description: string;
  }[];
}
