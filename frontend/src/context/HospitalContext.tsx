'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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

interface HospitalContextType {
  cases: EmergencyCase[];
  hospitalProfile: HospitalProfile;
  resources: HospitalResourceItem[];
  getCaseById: (caseId: string) => EmergencyCase | undefined;
  acknowledgeCase: (caseId: string, notes?: string) => void;
  divertCase: (caseId: string, reasonId: string, notes?: string) => void;
  assignBayToCase: (caseId: string, bayId: string) => void;
  toggleChecklistItem: (caseId: string, itemId: string) => void;
  updateResourceStatus: (resourceId: string, status: ResourceStatus) => void;
  updateCaseStatus: (caseId: string, status: CaseStatus) => void;
  toggleDiversion: () => void;
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

  const getCaseById = (caseId: string) => {
    return cases.find(c => c.id === caseId);
  };

  const acknowledgeCase = (caseId: string, notes?: string) => {
    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;

      const newTimelineEvent: TimelineEvent = {
        id: `evt-ack-${Date.now()}`,
        timestamp: '14:08:15 UTC',
        relativeTime: 'Just now',
        title: 'Hospital Emergency Department Acknowledged',
        description: notes 
          ? `Case acknowledged by Dr. Sarah Jenkins. Note: ${notes}`
          : 'Case acknowledged by Dr. Sarah Jenkins. Staging resources & monitoring telemetry.',
        actor: 'Dr. Sarah Jenkins',
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
  };

  const divertCase = (caseId: string, reasonId: string, notes?: string) => {
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
        actor: 'Dr. Sarah Jenkins',
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
  };

  const assignBayToCase = (caseId: string, bayId: string) => {
    const targetBay = resources.find(r => r.id === bayId);
    const bayName = targetBay ? targetBay.name : bayId;

    // Update case
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

    // Update resource status
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

  const updateResourceStatus = (resourceId: string, status: ResourceStatus) => {
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
