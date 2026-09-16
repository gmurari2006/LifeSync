'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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

interface EMSContextType {
  activeUnit: EMSUnit;
  cases: Record<string, EMSCase>;
  activeCaseId: string;
  setActiveCaseId: (caseId: string) => void;
  setUnitStatus: (status: EMSUnitStatus) => void;
  acceptAssignment: (caseId: string) => void;
  updateTransportStatus: (caseId: string, status: EMSTransportStatus) => void;
  updateVerification: (caseId: string, updates: Partial<EMSVerification>) => void;
  updateVitals: (caseId: string, vitalsUpdates: Partial<EMSVitals>) => void;
  updatePatientStatus: (caseId: string, status: PatientOperationalStatus) => void;
  completeHandover: (caseId: string, receivingStaff?: string, notes?: string) => void;
  getCaseById: (caseId: string) => EMSCase | undefined;
}

const EMSContext = createContext<EMSContextType | undefined>(undefined);

export function EMSProvider({ children }: { children: ReactNode }) {
  const [activeUnit, setActiveUnit] = useState<EMSUnit>(DEFAULT_EMS_UNIT);
  const [cases, setCases] = useState<Record<string, EMSCase>>(INITIAL_EMS_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>('LS-2026-001');

  const getNowFormatted = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} UTC`;
  };

  const setUnitStatus = (status: EMSUnitStatus) => {
    setActiveUnit(prev => ({ ...prev, status }));
  };

  const acceptAssignment = (caseId: string) => {
    const nowTime = getNowFormatted();
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
  };

  const updateTransportStatus = (caseId: string, status: EMSTransportStatus) => {
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

    // Map to unit status
    if (status === 'On Scene') setUnitStatus('On Scene');
    else if (status === 'Transporting') setUnitStatus('Transporting');
    else if (status === 'Arrived at Hospital') setUnitStatus('At Destination');
    else if (status === 'Handover Complete') setUnitStatus('Handover Complete');
  };

  const updateVerification = (caseId: string, updates: Partial<EMSVerification>) => {
    const nowTime = getNowFormatted();
    setCases(prev => {
      const current = prev[caseId];
      if (!current) return prev;

      const updatedVerif: EMSVerification = {
        ...current.emsVerification,
        ...updates,
        lastVerifiedAt: nowTime,
        verifiedBy: activeUnit.crew.leadParamedic,
      };

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
  };

  const updateVitals = (caseId: string, vitalsUpdates: Partial<EMSVitals>) => {
    const nowTime = getNowFormatted();
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

  const completeHandover = (caseId: string, receivingStaff = 'Dr. Sarah Jenkins (ED Lead)', notes = 'Clinical handover packet signed & verified at bedside.') => {
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
  };

  const getCaseById = (caseId: string): EMSCase | undefined => {
    const normalized = caseId.trim().toUpperCase();
    return cases[normalized];
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
        updateTransportStatus,
        updateVerification,
        updateVitals,
        updatePatientStatus,
        completeHandover,
        getCaseById,
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
