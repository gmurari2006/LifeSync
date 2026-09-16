'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { 
  CitizenEmergencyReport, 
  CitizenCase 
} from '@/types/citizen';
import { 
  DEFAULT_SIMULATED_LOCATION, 
  INITIAL_CITIZEN_CASES 
} from '@/lib/demo/citizen-data';
import { submitCitizenReport, getCitizenCaseStatus } from '@/lib/api/citizen';

interface CitizenContextType {
  draftReport: CitizenEmergencyReport;
  updateDraftReport: (updates: Partial<CitizenEmergencyReport>) => void;
  resetDraftReport: () => void;
  submitReport: () => Promise<string>;
  getCaseById: (caseId: string) => CitizenCase | undefined;
  fetchCaseById: (caseId: string) => Promise<CitizenCase | undefined>;
  submittedCases: Record<string, CitizenCase>;
  isLoading: boolean;
  error: string | null;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDraftReport = (updates: Partial<CitizenEmergencyReport>) => {
    setDraftReport(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const resetDraftReport = () => {
    setDraftReport(INITIAL_DRAFT);
    setError(null);
  };

  const submitReport = async (): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await submitCitizenReport({
        incident_category: draftReport.incidentType,
        people_count: Number(draftReport.peopleCount) || 1,
        has_unconscious: draftReport.hasUnconscious,
        is_awake: draftReport.isAwake,
        is_breathing: draftReport.isBreathingNormally,
        visible_concerns: draftReport.visibleConcerns,
        location_address: draftReport.location.address,
        location_landmark: draftReport.location.landmark,
        latitude: draftReport.location.coordinates?.latitude,
        longitude: draftReport.location.coordinates?.longitude,
        additional_notes: draftReport.additionalNotes,
      });

      const newCaseId = res.case_id;
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} UTC (Just now)`;

      const newCase: CitizenCase = {
        caseId: newCaseId,
        report: { ...draftReport },
        submittedAt: timeStr,
        status: 'Report Received',
        currentStage: 1,
        destinationHospitalName: 'Hospital Pre-Alert (Pending Dispatch)',
        assignedEmsUnit: 'Dispatching Nearest Unit',
        estimatedEtaMinutes: 8,
      };

      setSubmittedCases(prev => ({
        ...prev,
        [newCaseId]: newCase,
      }));

      resetDraftReport();
      setIsLoading(false);
      return newCaseId;
    } catch (err: any) {
      setIsLoading(false);
      const errMsg = err.message || 'Failed to submit emergency report to LifeSync backend.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const fetchCaseById = useCallback(async (caseId: string): Promise<CitizenCase | undefined> => {
    const normalized = caseId.trim().toUpperCase();
    try {
      const remoteCase = await getCitizenCaseStatus(normalized);
      const formattedCase: CitizenCase = {
        caseId: remoteCase.case_id,
        report: {
          incidentType: remoteCase.report.incident_category as any,
          peopleCount: remoteCase.report.people_count,
          hasUnconscious: remoteCase.report.has_unconscious as any,
          isAwake: remoteCase.report.is_awake as any,
          isBreathingNormally: remoteCase.report.is_breathing as any,
          visibleConcerns: remoteCase.report.visible_concerns as any,
          location: {
            address: remoteCase.report.location_address,
            landmark: remoteCase.report.location_landmark || '',
            coordinates: {
              latitude: remoteCase.report.latitude || 37.7749,
              longitude: remoteCase.report.longitude || -122.4194,
            },
            accuracyText: 'Approx. 5m via Cellular/GPS',
            isSimulated: true,
          },
          additionalNotes: remoteCase.report.additional_notes || '',
        },
        submittedAt: new Date(remoteCase.time_reported).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: remoteCase.status === 'REPORTED' 
          ? 'Report Received' 
          : remoteCase.status === 'INFORMATION_STRUCTURED' 
          ? 'Information Structured' 
          : 'Awaiting EMS',
        currentStage: remoteCase.status === 'REPORTED' ? 1 : 2,
        destinationHospitalName: 'LifeSync Emergency Center',
        assignedEmsUnit: 'Responding Unit',
        estimatedEtaMinutes: 6,
      };

      setSubmittedCases(prev => ({
        ...prev,
        [normalized]: formattedCase,
      }));
      return formattedCase;
    } catch {
      return submittedCases[normalized];
    }
  }, [submittedCases]);

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
        fetchCaseById,
        submittedCases,
        isLoading,
        error,
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
