'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  EmergencyCase, 
  HospitalProfile, 
  HospitalResourceItem, 
  ResourceStatus,
  CaseStatus,
  TimelineEvent 
} from '@/types/hospital';
import { 
  INITIAL_EMERGENCY_CASES, 
  INITIAL_HOSPITAL_PROFILE, 
  INITIAL_HOSPITAL_RESOURCES,
  DIVERT_REASON_OPTIONS
} from '@/lib/demo/hospital-data';
import {
  getHospital,
  getHospitalCases,
  acknowledgeHospitalCase,
  divertHospitalCase,
  patchHospitalResource,
} from '@/lib/api/hospitals';

interface HospitalContextType {
  cases: EmergencyCase[];
  hospitalProfile: HospitalProfile;
  resources: HospitalResourceItem[];
  getCaseById: (caseId: string) => EmergencyCase | undefined;
  acknowledgeCase: (caseId: string, notes?: string) => Promise<void>;
  divertCase: (caseId: string, reasonId: string, notes?: string) => Promise<void>;
  assignBayToCase: (caseId: string, bayId: string) => Promise<void>;
  toggleChecklistItem: (caseId: string, itemId: string) => void;
  updateResourceStatus: (resourceId: string, status: ResourceStatus) => Promise<void>;
  updateCaseStatus: (caseId: string, status: CaseStatus) => void;
  toggleDiversion: () => void;
  refreshHospitalData: () => Promise<void>;
  stats: {
    totalIncoming: number;
    awaitingAck: number;
    acknowledged: number;
    criticalCount: number;
    averageEta: number;
    availableBays: number;
    totalBays: number;
  };
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export function HospitalProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<EmergencyCase[]>(INITIAL_EMERGENCY_CASES);
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile>(INITIAL_HOSPITAL_PROFILE);
  const [resources, setResources] = useState<HospitalResourceItem[]>(INITIAL_HOSPITAL_RESOURCES);

  const refreshHospitalData = useCallback(async () => {
    try {
      const hospitalId = hospitalProfile.id;
      const [remoteHosp, remoteCases] = await Promise.allSettled([
        getHospital(hospitalId),
        getHospitalCases(hospitalId),
      ]);
      // If remote backend responded, we can keep the interface synced
    } catch {
      // Retain local state
    }
  }, [hospitalProfile.id]);

  useEffect(() => {
    refreshHospitalData();
  }, [refreshHospitalData]);

  const getCaseById = (caseId: string) => {
    return cases.find(c => c.id === caseId);
  };

  const acknowledgeCase = async (caseId: string, notes?: string) => {
    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;

      const newTimelineEvent: TimelineEvent = {
        id: `evt-ack-${Date.now()}`,
        timestamp: '14:08:15 UTC',
        relativeTime: 'Just now',
        title: 'Hospital Emergency Department Acknowledged',
        description: notes 
          ? `Case acknowledged by ${hospitalProfile.onDutyCoordinator}. Note: ${notes}`
          : `Case acknowledged by ${hospitalProfile.onDutyCoordinator}. Staging resources & monitoring telemetry.`,
        actor: hospitalProfile.onDutyCoordinator,
        actorRole: 'Hospital ED Lead',
        stage: 'Acknowledged',
        type: 'hospital',
      };

      return {
        ...c,
        status: 'Acknowledged' as CaseStatus,
        timeAcknowledged: '14:08 UTC',
        acknowledgedBy: `${hospitalProfile.onDutyCoordinator} (${hospitalProfile.coordinatorRole})`,
        timeline: [newTimelineEvent, ...c.timeline],
      };
    }));

    try {
      await acknowledgeHospitalCase(hospitalProfile.id, caseId, {
        acknowledged_by: hospitalProfile.onDutyCoordinator,
        notes,
      });
    } catch (err: any) {
      console.warn('Backend hospital acknowledge note:', err.message);
    }
  };

  const divertCase = async (caseId: string, reasonId: string, notes?: string) => {
    const reasonObj = DIVERT_REASON_OPTIONS.find(r => r.id === reasonId);
    const reasonText = reasonObj ? reasonObj.label : reasonId;

    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;

      const newTimelineEvent: TimelineEvent = {
        id: `evt-div-${Date.now()}`,
        timestamp: '14:08:45 UTC',
        relativeTime: 'Just now',
        title: 'Case Rejected / Diverted by Receiving Hospital',
        description: `Hospital logged diversion reason: "${reasonText}". ${notes ? `Justification: ${notes}` : ''} Automated secondary hospital routing triggered.`,
        actor: hospitalProfile.onDutyCoordinator,
        actorRole: 'Hospital ED Lead',
        stage: 'Diverted',
        type: 'hospital',
      };

      return {
        ...c,
        status: 'Diverted' as CaseStatus,
        divertedAt: '14:08 UTC',
        divertReason: reasonText,
        divertNotes: notes,
        timeline: [newTimelineEvent, ...c.timeline],
      };
    }));

    try {
      await divertHospitalCase(hospitalProfile.id, caseId, {
        divert_reason_code: reasonId,
        divert_notes: notes,
        diverted_by: hospitalProfile.onDutyCoordinator,
      });
    } catch (err: any) {
      console.warn('Backend hospital divert note:', err.message);
    }
  };

  const assignBayToCase = async (caseId: string, bayId: string) => {
    const targetBay = resources.find(r => r.id === bayId);
    const bayName = targetBay ? targetBay.name : bayId;

    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;

      const newTimelineEvent: TimelineEvent = {
        id: `evt-bay-${Date.now()}`,
        timestamp: '14:09:00 UTC',
        relativeTime: 'Just now',
        title: `Assigned to ${bayName}`,
        description: `Bay allocated for pre-arrival staging by ${hospitalProfile.onDutyCoordinator}.`,
        actor: hospitalProfile.onDutyCoordinator,
        actorRole: 'Hospital ED Lead',
        stage: 'Preparing',
        type: 'hospital',
      };

      return {
        ...c,
        assignedBay: bayName,
        status: 'Preparing' as CaseStatus,
        timeline: [newTimelineEvent, ...c.timeline],
      };
    }));

    setResources(prev => prev.map(r => {
      if (r.id === bayId) {
        return {
          ...r,
          status: 'Occupied' as ResourceStatus,
          availableCapacity: Math.max(0, r.availableCapacity - 1),
          assignedCaseId: caseId,
          lastUpdated: 'Just now',
        };
      }
      return r;
    }));

    try {
      await acknowledgeHospitalCase(hospitalProfile.id, caseId, {
        assigned_bay: bayId,
        acknowledged_by: hospitalProfile.onDutyCoordinator,
      });
    } catch (err: any) {
      console.warn('Backend hospital bay assign note:', err.message);
    }
  };

  const toggleChecklistItem = (caseId: string, itemId: string) => {
    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      return {
        ...c,
        readinessChecklist: c.readinessChecklist.map(item => {
          if (item.id === itemId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        }),
      };
    }));
  };

  const updateResourceStatus = async (resourceId: string, status: ResourceStatus) => {
    setResources(prev => prev.map(r => {
      if (r.id === resourceId) {
        const available = status === 'Ready' ? r.totalCapacity : status === 'Limited' ? 1 : 0;
        return {
          ...r,
          status,
          availableCapacity: available,
          lastUpdated: 'Just now',
        };
      }
      return r;
    }));

    try {
      await patchHospitalResource(hospitalProfile.id, resourceId, {
        status,
      });
    } catch (err: any) {
      console.warn('Backend resource update note:', err.message);
    }
  };

  const updateCaseStatus = (caseId: string, status: CaseStatus) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return { ...c, status };
      }
      return c;
    }));
  };

  const toggleDiversion = () => {
    setHospitalProfile(prev => ({
      ...prev,
      diversionActive: !prev.diversionActive,
      operationalStatus: !prev.diversionActive ? 'Degraded' : 'Operational',
    }));
  };

  // Compute live stats
  const activeCases = cases.filter(c => c.status !== 'Closed' && c.status !== 'Diverted');
  const awaitingAck = cases.filter(c => c.status === 'Alerted');
  const criticalCount = activeCases.filter(c => c.operationalPriority === 'Critical').length;
  
  const incomingWithEta = activeCases.filter(c => c.emsUnit.etaMinutes > 0);
  const avgEta = incomingWithEta.length 
    ? Math.round(incomingWithEta.reduce((acc, curr) => acc + curr.emsUnit.etaMinutes, 0) / incomingWithEta.length)
    : 0;

  const availableBays = resources
    .filter(r => r.category === 'Emergency Bay' || r.category === 'Resuscitation Unit')
    .filter(r => r.status === 'Ready').length;

  const totalBays = resources
    .filter(r => r.category === 'Emergency Bay' || r.category === 'Resuscitation Unit').length;

  const stats = {
    totalIncoming: activeCases.length,
    awaitingAck: awaitingAck.length,
    acknowledged: activeCases.length - awaitingAck.length,
    criticalCount,
    averageEta: avgEta,
    availableBays,
    totalBays,
  };

  return (
    <HospitalContext.Provider
      value={{
        cases,
        hospitalProfile,
        resources,
        getCaseById,
        acknowledgeCase,
        divertCase,
        assignBayToCase,
        toggleChecklistItem,
        updateResourceStatus,
        updateCaseStatus,
        toggleDiversion,
        refreshHospitalData,
        stats,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
}

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
}
