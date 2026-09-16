'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  CitizenEmergencyReport, 
  CitizenCase 
} from '@/types/citizen';
import { 
  DEFAULT_SIMULATED_LOCATION, 
  INITIAL_CITIZEN_CASES 
} from '@/lib/demo/citizen-data';

interface CitizenContextType {
  draftReport: CitizenEmergencyReport;
  updateDraftReport: (updates: Partial<CitizenEmergencyReport>) => void;
  resetDraftReport: () => void;
  submitReport: () => string;
  getCaseById: (caseId: string) => CitizenCase | undefined;
  submittedCases: Record<string, CitizenCase>;
}

const INITIAL_DRAFT: CitizenEmergencyReport = {
  incidentType: '',
  peopleCount: 1,
  hasUnconscious: 'No',
  isAwake: 'Yes',
  isBreathingNormally: 'Yes',
  visibleConcerns: [],
  location: DEFAULT_SIMULATED_LOCATION,
  additionalNotes: '',
};

const CitizenContext = createContext<CitizenContextType | undefined>(undefined);

export function CitizenProvider({ children }: { children: ReactNode }) {
  const [draftReport, setDraftReport] = useState<CitizenEmergencyReport>(INITIAL_DRAFT);
  const [submittedCases, setSubmittedCases] = useState<Record<string, CitizenCase>>(INITIAL_CITIZEN_CASES);

  const updateDraftReport = (updates: Partial<CitizenEmergencyReport>) => {
    setDraftReport(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const resetDraftReport = () => {
    setDraftReport(INITIAL_DRAFT);
  };

  const submitReport = (): string => {
    // Generate new Case ID in sequence: LS-2026-103, 104, etc.
    const count = Object.keys(submittedCases).length;
    const newCaseId = `LS-2026-${100 + count + 1}`;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} UTC (Just now)`;

    const newCase: CitizenCase = {
      caseId: newCaseId,
      report: { ...draftReport },
      submittedAt: timeStr,
      status: 'Information Structured',
      currentStage: 2,
      destinationHospitalName: 'CityCare Emergency Hospital (Pre-Alert Queued)',
      assignedEmsUnit: 'ALS Unit En Route to Dispatch',
      estimatedEtaMinutes: 7,
    };

    setSubmittedCases(prev => ({
      ...prev,
      [newCaseId]: newCase,
    }));

    // Reset draft
    resetDraftReport();

    return newCaseId;
  };

  const getCaseById = (caseId: string): CitizenCase | undefined => {
    const normalized = caseId.trim().toUpperCase();
    return submittedCases[normalized];
  };

  return (
    <CitizenContext.Provider
      value={{
        draftReport,
        updateDraftReport,
        resetDraftReport,
        submitReport,
        getCaseById,
        submittedCases,
      }}
    >
      {children}
    </CitizenContext.Provider>
  );
}

export function useCitizen() {
  const context = useContext(CitizenContext);
  if (!context) {
    throw new Error('useCitizen must be used within a CitizenProvider');
  }
  return context;
}
