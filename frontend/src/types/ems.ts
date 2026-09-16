export type OperationalPriority = 'Critical' | 'High' | 'Moderate' | 'Low';

export type EMSUnitStatus = 
  | 'Available'
  | 'Assigned'
  | 'Responding'
  | 'On Scene'
  | 'Transporting'
  | 'At Destination'
  | 'Handover Complete'
  | 'Returning';

export type EMSTransportStatus = 
  | 'Assigned'
  | 'Responding to Scene'
  | 'On Scene'
  | 'Patient Loaded'
  | 'Transporting'
  | 'Arrived at Hospital'
  | 'Handover Complete';

export type VerificationState = 'Confirmed' | 'Not Confirmed' | 'Unable to Assess' | 'Unverified';

export type ObservationState = 'Responding' | 'Not responding' | 'Unable to assess' | 'Unverified';
export type BreathingState = 'Normal' | 'Abnormal' | 'Unable to assess' | 'Unverified';
export type BleedingState = 'Present' | 'Not present' | 'Unable to assess' | 'Unverified';
export type AirwayState = 'Patent' | 'Compromised' | 'Maintained with Adjunct' | 'Unable to assess' | 'Unverified';

export type PatientOperationalStatus = 
  | 'Stable'
  | 'Requires close monitoring'
  | 'Deteriorating'
  | 'Unable to assess';

export interface EMSCrew {
  leadParamedic: string;
  driverParamedic: string;
  medicalDirector: string;
  contactNumber: string;
}

export interface EMSUnit {
  unitId: string; // e.g. 'ALS-04'
  unitType: 'ALS (Advanced Life Support)' | 'BLS (Basic Life Support)' | 'MICU (Mobile Intensive Care)';
  callSign: string;
  status: EMSUnitStatus;
  crew: EMSCrew;
  currentSpeedKmH: number;
  fuelOrBatteryPercent: number;
  currentLocationName: string;
}

export interface EMSVerification {
  consciousness: ObservationState;
  breathing: BreathingState;
  bleeding: BleedingState;
  airway: AirwayState;
  lastVerifiedAt?: string;
  verifiedBy?: string;
  clinicalNotes?: string;
}

export interface EMSVitals {
  heartRate: number; // bpm
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  oxygenSaturation: number; // %
  respiratoryRate: number; // /min
  temperature: number; // °C
  gcs: number; // 3-15
  painScore?: number; // 0-10
  bloodGlucose?: number; // mg/dL
  recordedAt: string;
  recordedBy: string;
  isVerified: boolean;
}

export interface EMSTimelineEvent {
  id: string;
  timestamp: string;
  relativeTime: string;
  title: string;
  description: string;
  actor: 'Citizen' | 'EMS' | 'Hospital' | 'System';
  stage?: EMSTransportStatus;
}


export interface CitizenReportSummary {
  incidentType: string;
  reportedObservations: string;
  reportedConsciousness: string;
  reportedBreathing: string;
  reportedConcerns: string[];
  reportedPeopleCount: number | '4+';
  reportedLocation: string;
  landmark?: string;
  additionalNotes?: string;
  reportedAt: string;
}

export interface HospitalDestinationInfo {
  hospitalId: string;
  name: string;
  traumaLevel: string;
  distanceKm: number;
  etaMinutes: number;
  acknowledgementState: 'Acknowledged' | 'Alerted / Pending' | 'Pre-Alert Queued';
  assignedBay?: string;
  traumaTeamStatus: 'Ready' | 'Preparing' | 'Not Required' | 'Standby';
  cathLabStatus?: 'Ready' | 'Preparing' | 'Standby';
  coordinatorName: string;
  coordinatorContact: string;
}

export interface EMSCase {
  id: string; // e.g. 'LS-2026-001'
  incidentType: string;
  operationalPriority: OperationalPriority;
  patientAge: number;
  patientSex: 'Male' | 'Female' | 'Unknown';
  patientCount: number;
  citizenReport: CitizenReportSummary;
  emsVerification: EMSVerification;
  vitals: EMSVitals;
  patientStatus: PatientOperationalStatus;
  transportStatus: EMSTransportStatus;
  destinationHospital: HospitalDestinationInfo;
  assignedUnitId: string;
  distanceRemainingKm: number;
  etaMinutes: number;
  timeAssigned: string;
  lastUpdated: string;
  timeline: EMSTimelineEvent[];
  handoverCompletedAt?: string;
  handoverReceivingNurseOrPhysician?: string;
  handoverNotes?: string;
}
