'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  EMSUnit, 
  EMSCase, 
  EMSUnitStatus, 
  EMSTransportStatus, 
  EMSVerification, 
  EMSVitals, 
  PatientOperationalStatus, 
  EMSTimelineEvent 
} from '@/types/ems';
import { DEFAULT_EMS_UNIT, INITIAL_EMS_CASES } from '@/lib/demo/ems-data';
import {
  getEMSCases,
  verifySceneAssessment,
  streamPatientVitals,
  updateEMSTransportStatus,
  completeEMSHandover,
} from '@/lib/api/ems';

interface EMSContextType {
  activeUnit: EMSUnit;
  cases: Record<string, EMSCase>;
  activeCaseId: string;
  setActiveCaseId: (caseId: string) => void;
  setUnitStatus: (status: EMSUnitStatus) => void;
  acceptAssignment: (caseId: string) => Promise<void>;
  updateTransportStatus: (caseId: string, status: EMSTransportStatus) => Promise<void>;
  updateVerification: (caseId: string, updates: Partial<EMSVerification>) => Promise<void>;
  updateVitals: (caseId: string, vitalsUpdates: Partial<EMSVitals>) => Promise<void>;
  updatePatientStatus: (caseId: string, status: PatientOperationalStatus) => void;
  updateDestination: (caseId: string, hospitalId: string, hospitalName: string) => void;
  completeHandover: (caseId: string, receivingStaff?: string, notes?: string) => Promise<void>;
  getCaseById: (caseId: string) => EMSCase | undefined;
  isLoading: boolean;
  error: string | null;
  refreshCases: () => Promise<void>;
}

const EMSContext = createContext<EMSContextType | undefined>(undefined);

export function EMSProvider({ children }: { children: ReactNode }) {
  const [activeUnit, setActiveUnit] = useState<EMSUnit>(DEFAULT_EMS_UNIT);
  const [cases, setCases] = useState<Record<string, EMSCase>>(INITIAL_EMS_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>('LS-2026-001');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNowFormatted = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} UTC`;
  };

  const refreshCases = useCallback(async () => {
    try {
      const backendCases = await getEMSCases();
      if (backendCases && backendCases.length > 0) {
        // Hydrate backend cases into EMSCase format if needed
      }
    } catch {
      // Retain local state
    }
  }, []);

  useEffect(() => {
    refreshCases();
  }, [refreshCases]);

  const setUnitStatus = (status: EMSUnitStatus) => {
    setActiveUnit(prev => ({ ...prev, status }));
  };

  const acceptAssignment = async (caseId: string) => {
    const nowTime = getNowFormatted();
    
    // Update local optimistic state
    setCases(prev => {
      const current = prev[caseId];
      if (!current) return prev;

      const newTimelineEvent: EMSTimelineEvent = {
        id: `t-gen-${Date.now()}`,
        timestamp: nowTime,
        relativeTime: 'Just now',
        title: 'Assignment Accepted by EMS',
        description: `Unit ${activeUnit.unitId} (${activeUnit.crew.leadParamedic}) accepted dispatch and commenced route navigation.`,
        actor: 'EMS',
        stage: 'Responding to Scene',
      };

      return {
        ...prev,
        [caseId]: {
          ...current,
          transportStatus: 'Responding to Scene',
          lastUpdated: `${nowTime} (Just now)`,
          timeline: [newTimelineEvent, ...current.timeline],
        },
      };
    });

    setActiveUnit(prev => ({ ...prev, status: 'Responding' }));

    // Send to backend
    try {
      await updateEMSTransportStatus(caseId, {
        status: 'EMS_ACCEPTED',
        updated_by: `${activeUnit.unitId} Crew`,
      });
    } catch (err: any) {
      console.warn('Backend update note:', err.message);
    }
  };

  const updateTransport = async (caseId: string, status: EMSTransportStatus) => {
    const nowTime = getNowFormatted();
    setCases(prev => {
      const current = prev[caseId];
      if (!current) return prev;

      let title = `Transport Status: ${status}`;
      let desc = `Paramedic crew marked status as ${status}.`;

      if (status === 'On Scene') {
        title = 'Arrived On Scene';
        desc = `Unit ${activeUnit.unitId} reached coordinates. Patient triage in progress.`;
      } else if (status === 'Patient Loaded') {
        title = 'Patient Loaded into Ambulance';
        desc = 'Patient secured on stretcher. Pre-transit vital baseline recorded.';
      } else if (status === 'Transporting') {
        title = 'Transit to Hospital Commenced';
        desc = `En-route to ${current.destinationHospital.name}. Telemetry actively streaming.`;
      } else if (status === 'Arrived at Hospital') {
        title = 'Ambulance Arrived at Emergency Bay';
        desc = `Vehicle docked at ${current.destinationHospital.assignedBay || 'ED Bay'}. Bedside handover initiation ready.`;
      } else if (status === 'Handover Complete') {
        title = 'Bedside Clinical Handover Complete';
        desc = 'Patient care officially transferred to ED attending team.';
      }

      const newTimelineEvent: EMSTimelineEvent = {
        id: `t-gen-${Date.now()}`,
        timestamp: nowTime,
        relativeTime: 'Just now',
        title,
        description: desc,
        actor: 'EMS',
        stage: status,
      };

      return {
        ...prev,
        [caseId]: {
          ...current,
          transportStatus: status,
          lastUpdated: `${nowTime} (Just now)`,
          timeline: [newTimelineEvent, ...current.timeline],
        },
      };
    });

    if (status === 'On Scene') setUnitStatus('On Scene');
    else if (status === 'Transporting') setUnitStatus('Transporting');
    else if (status === 'Arrived at Hospital') setUnitStatus('At Destination');
    else if (status === 'Handover Complete') setUnitStatus('Handover Complete');

    // Map to backend lifecycle enum
    let backendStatus = 'TRANSPORTING';
    if (status === 'On Scene') backendStatus = 'ON_SCENE';
    else if (status === 'Patient Loaded') backendStatus = 'PATIENT_LOADED';
    else if (status === 'Transporting') backendStatus = 'TRANSPORTING';
    else if (status === 'Arrived at Hospital') backendStatus = 'ARRIVED';
    else if (status === 'Handover Complete') backendStatus = 'HANDOVER_COMPLETE';

    try {
      await updateEMSTransportStatus(caseId, {
        status: backendStatus,
        updated_by: `${activeUnit.unitId} Crew`,
      });
    } catch (err: any) {
      console.warn('Backend update note:', err.message);
    }
  };

  const updateVerification = async (caseId: string, updates: Partial<EMSVerification>) => {
    const nowTime = getNowFormatted();
    let currentVerif: EMSVerification | null = null;

    setCases(prev => {
      const current = prev[caseId];
      if (!current) return prev;

      const updatedVerif: EMSVerification = {
        ...current.emsVerification,
        ...updates,
        lastVerifiedAt: nowTime,
        verifiedBy: activeUnit.crew.leadParamedic,
      };
      currentVerif = updatedVerif;

      const newTimelineEvent: EMSTimelineEvent = {
        id: `t-gen-${Date.now()}`,
        timestamp: nowTime,
        relativeTime: 'Just now',
        title: 'EMS Verification Assessment Updated',
        description: `Verified clinical observations recorded by ${activeUnit.crew.leadParamedic}.`,
        actor: 'EMS',
        stage: current.transportStatus,
      };

      return {
        ...prev,
        [caseId]: {
          ...current,
          emsVerification: updatedVerif,
          lastUpdated: `${nowTime} (Just now)`,
          timeline: [newTimelineEvent, ...current.timeline],
        },
      };
    });

    try {
      const current = cases[caseId];
      await verifySceneAssessment(caseId, {
        consciousness: updates.consciousness || current?.emsVerification.consciousness || 'Responding',
        breathing: updates.breathing || current?.emsVerification.breathing || 'Normal',
        bleeding: updates.bleeding || current?.emsVerification.bleeding || 'Not present',
        airway: updates.airway || current?.emsVerification.airway || 'Patent',
        clinical_notes: updates.clinicalNotes || current?.emsVerification.clinicalNotes || '',
        verified_by: activeUnit.crew.leadParamedic,
      });
    } catch (err: any) {
      console.warn('Backend verification note:', err.message);
    }
  };

  const updateVitals = async (caseId: string, vitalsUpdates: Partial<EMSVitals>) => {
    const nowTime = getNowFormatted();
    let updatedV: EMSVitals | null = null;

    setCases(prev => {
      const current = prev[caseId];
      if (!current) return prev;

      const updatedVitals: EMSVitals = {
        ...current.vitals,
        ...vitalsUpdates,
        recordedAt: nowTime,
        recordedBy: activeUnit.crew.leadParamedic,
        isVerified: true,
      };
      updatedV = updatedVitals;

      const newTimelineEvent: EMSTimelineEvent = {
        id: `t-gen-${Date.now()}`,
        timestamp: nowTime,
        relativeTime: 'Just now',
        title: 'EMS-Verified Vitals Synchronized',
        description: `HR ${updatedVitals.heartRate} bpm, BP ${updatedVitals.systolicBp}/${updatedVitals.diastolicBp}, SpO2 ${updatedVitals.oxygenSaturation}%, RR ${updatedVitals.respiratoryRate}/min, GCS ${updatedVitals.gcs}.`,
        actor: 'EMS',
        stage: current.transportStatus,
      };

      return {
        ...prev,
        [caseId]: {
          ...current,
          vitals: updatedVitals,
          lastUpdated: `${nowTime} (Just now)`,
          timeline: [newTimelineEvent, ...current.timeline],
        },
      };
    });

    try {
      const current = cases[caseId];
      await streamPatientVitals(caseId, {
        heart_rate: vitalsUpdates.heartRate ?? current?.vitals.heartRate ?? 80,
        systolic_bp: vitalsUpdates.systolicBp ?? current?.vitals.systolicBp ?? 120,
        diastolic_bp: vitalsUpdates.diastolicBp ?? current?.vitals.diastolicBp ?? 80,
        oxygen_saturation: vitalsUpdates.oxygenSaturation ?? current?.vitals.oxygenSaturation ?? 98,
        respiratory_rate: vitalsUpdates.respiratoryRate ?? current?.vitals.respiratoryRate ?? 16,
        temperature: vitalsUpdates.temperature ?? current?.vitals.temperature ?? 37.0,
        gcs: vitalsUpdates.gcs ?? current?.vitals.gcs ?? 15,
        pain_score: vitalsUpdates.painScore ?? current?.vitals.painScore ?? 0,
        blood_glucose: vitalsUpdates.bloodGlucose ?? current?.vitals.bloodGlucose ?? 100,
        recorded_by: activeUnit.crew.leadParamedic,
      });
    } catch (err: any) {
      console.warn('Backend vitals note:', err.message);
    }
  };

  const updatePatientStatus = (caseId: string, status: PatientOperationalStatus) => {
    const nowTime = getNowFormatted();
    setCases(prev => {
      const current = prev[caseId];
      if (!current) return prev;

      const newTimelineEvent: EMSTimelineEvent = {
        id: `t-gen-${Date.now()}`,
        timestamp: nowTime,
        relativeTime: 'Just now',
        title: `Patient Status Marked: ${status}`,
        description: `Field operational status updated to "${status}" by paramedic crew.`,
        actor: 'EMS',
        stage: current.transportStatus,
      };

      return {
        ...prev,
        [caseId]: {
          ...current,
          patientStatus: status,
          lastUpdated: `${nowTime} (Just now)`,
          timeline: [newTimelineEvent, ...current.timeline],
        },
      };
    });
  };

  const completeHandover = async (
    caseId: string,
    receivingStaff = 'Dr. Sarah Jenkins (ED Lead)',
    notes = 'Clinical handover packet signed & verified at bedside.'
  ) => {
    const nowTime = getNowFormatted();
    setCases(prev => {
      const current = prev[caseId];
      if (!current) return prev;

      const newTimelineEvent: EMSTimelineEvent = {
        id: `t-gen-${Date.now()}`,
        timestamp: nowTime,
        relativeTime: 'Just now',
        title: 'Hospital Bedside Handover Complete',
        description: `Transferred patient to ${receivingStaff}. Notes: ${notes}`,
        actor: 'Hospital',
        stage: 'Handover Complete',
      };

      return {
        ...prev,
        [caseId]: {
          ...current,
          transportStatus: 'Handover Complete',
          handoverCompletedAt: nowTime,
          handoverReceivingNurseOrPhysician: receivingStaff,
          handoverNotes: notes,
          lastUpdated: `${nowTime} (Just now)`,
          timeline: [newTimelineEvent, ...current.timeline],
        },
      };
    });

    setUnitStatus('Available');

    try {
      await completeEMSHandover(caseId, {
        receiving_staff: receivingStaff,
        notes,
      });
    } catch (err: any) {
      console.warn('Backend handover note:', err.message);
    }
  };

  const getCaseById = (caseId: string): EMSCase | undefined => {
    const normalized = caseId.trim().toUpperCase();
    return cases[normalized];
  };

  const updateDestination = (caseId: string, hospitalId: string, hospitalName: string) => {
    const nowTime = getNowFormatted();
    setCases(prev => {
      const current = prev[caseId];
      if (!current) return prev;

      const newTimelineEvent: EMSTimelineEvent = {
        id: `t-gen-${Date.now()}`,
        timestamp: nowTime,
        relativeTime: 'Just now',
        title: `Destination Confirmed: ${hospitalName}`,
        description: `Hospital destination confirmed via deterministic matching recommendation.`,
        actor: 'EMS',
        stage: current.transportStatus,
      };

      return {
        ...prev,
        [caseId]: {
          ...current,
          destinationHospital: {
            ...current.destinationHospital,
            hospitalId: hospitalId,
            name: hospitalName,
          },
          lastUpdated: `${nowTime} (Just now)`,
          timeline: [newTimelineEvent, ...current.timeline],
        },
      };
    });
  };

  return (
    <EMSContext.Provider
      value={{
        activeUnit,
        cases,
        activeCaseId,
        setActiveCaseId,
        setUnitStatus,
        acceptAssignment,
        updateTransportStatus: updateTransport,
        updateVerification,
        updateVitals,
        updatePatientStatus,
        updateDestination,
        completeHandover,
        getCaseById,
        isLoading,
        error,
        refreshCases,
      }}
    >
      {children}
    </EMSContext.Provider>
  );
}

export function useEMS() {
  const context = useContext(EMSContext);
  if (!context) {
    throw new Error('useEMS must be used within an EMSProvider');
  }
  return context;
}
