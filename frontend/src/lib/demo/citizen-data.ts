import { 
  IncidentCategory, 
  VisibleConcern, 
  LocationData, 
  CitizenCase 
} from '@/types/citizen';

export interface IncidentOption {
  id: IncidentCategory;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
}

export const INCIDENT_OPTIONS: IncidentOption[] = [
  {
    id: 'Road Accident',
    title: 'Road Accident',
    description: 'Vehicle crash, pedestrian collision, or rollover',
    iconName: 'Car',
    badge: 'High Impact',
  },
  {
    id: 'Chest Pain',
    title: 'Chest Pain',
    description: 'Crushing pain, pressure, or heart attack signs',
    iconName: 'HeartPulse',
    badge: 'Time Critical',
  },
  {
    id: 'Breathing Problem',
    title: 'Breathing Problem',
    description: 'Severe shortness of breath, choking, or wheezing',
    iconName: 'Wind',
    badge: 'Time Critical',
  },
  {
    id: 'Unconscious Person',
    title: 'Unconscious Person',
    description: 'Unresponsive, collapsed, or unable to wake',
    iconName: 'UserX',
    badge: 'Red Rule',
  },
  {
    id: 'Fall',
    title: 'Fall / Slip Injury',
    description: 'Fell from height, stairs, or slip with injury',
    iconName: 'PersonStanding',
  },
  {
    id: 'Sudden Illness',
    title: 'Sudden Severe Illness',
    description: 'Sudden weakness, stroke signs, or intense pain',
    iconName: 'Activity',
  },
  {
    id: 'Fire / Burn',
    title: 'Fire / Thermal Burn',
    description: 'Severe burn injury or smoke inhalation',
    iconName: 'Flame',
  },
  {
    id: 'Other',
    title: 'Other Emergency',
    description: 'Any acute trauma or health emergency',
    iconName: 'HelpCircle',
  },
];

export const VISIBLE_CONCERN_OPTIONS: VisibleConcern[] = [
  'Heavy bleeding',
  'Difficulty breathing',
  'Chest discomfort',
  'Severe pain',
  'Confusion',
  'Seizure-like activity',
  'Major injury',
  'Trapped in vehicle / debris',
  'None noticed',
  'Not sure',
];

export const DEFAULT_SIMULATED_LOCATION: LocationData = {
  address: 'GD Goenka University Area, Sohna Road, Sector 48',
  landmark: 'Near Main Campus Gate & Metro Junction',
  coordinates: {
    latitude: 28.3496,
    longitude: 77.0658,
  },
  accuracyText: 'Accuracy: ±25 meters',
  isSimulated: true,
};

export const INITIAL_CITIZEN_CASES: Record<string, CitizenCase> = {
  'LS-2026-101': {
    caseId: 'LS-2026-101',
    submittedAt: '14:12 UTC (3 mins ago)',
    status: 'Information Structured',
    currentStage: 2,
    destinationHospitalName: 'CityCare Emergency Hospital',
    assignedEmsUnit: 'ALS-04 (Awaiting Dispatch Handshake)',
    estimatedEtaMinutes: 8,
    report: {
      incidentType: 'Road Accident',
      peopleCount: 2,
      hasUnconscious: 'Yes',
      isAwake: 'No',
      isBreathingNormally: 'No',
      visibleConcerns: ['Heavy bleeding', 'Major injury', 'Trapped in vehicle / debris'],
      location: {
        address: 'GD Goenka University Area, Sohna Road, Sector 48',
        landmark: 'Main Boulevard Intersection',
        coordinates: { latitude: 28.3496, longitude: 77.0658 },
        accuracyText: 'Accuracy: ±25 meters',
        isSimulated: true,
      },
      additionalNotes: 'Two cars involved in collision. Front passenger door jammed. Driver appears unconscious.',
    },
  },
  'LS-2026-102': {
    caseId: 'LS-2026-102',
    submittedAt: '14:05 UTC (10 mins ago)',
    status: 'Hospital Alerted',
    currentStage: 3,
    destinationHospitalName: 'CityCare Emergency Hospital (Cath Lab Ready)',
    assignedEmsUnit: 'ALS-02',
    estimatedEtaMinutes: 6,
    report: {
      incidentType: 'Chest Pain',
      peopleCount: 1,
      hasUnconscious: 'No',
      isAwake: 'Yes',
      isBreathingNormally: 'No',
      visibleConcerns: ['Chest discomfort', 'Difficulty breathing', 'Severe pain'],
      location: {
        address: 'Sector 29 Market Center, Building B',
        landmark: 'Near Metro Pillar 142',
        coordinates: { latitude: 28.4682, longitude: 77.0628 },
        accuracyText: 'Accuracy: ±30 meters',
        isSimulated: true,
      },
      additionalNotes: 'Middle aged male clutching chest and sweating heavily while climbing stairs.',
    },
  },
};
