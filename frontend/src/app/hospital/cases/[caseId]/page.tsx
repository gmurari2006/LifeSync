'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useHospital } from '@/context/HospitalContext';
import { useCaseWebSocket } from '@/hooks/useCaseWebSocket';
import { ConnectionStatusBadge } from '@/components/common/ConnectionStatusBadge';
import { AmbulanceSimulationControlCard } from '@/components/simulation/AmbulanceSimulationControlCard';
import { PriorityBadge } from '@/components/hospital/PriorityBadge';
import { StatusBadge } from '@/components/hospital/StatusBadge';
import { CaseSummaryCard } from '@/components/hospital/CaseSummaryCard';
import { AIStructuredReportCard } from '@/components/ems/AIStructuredReportCard';
import { HospitalMatchingCard } from '@/components/ems/HospitalMatchingCard';
import { EmsStatusCard } from '@/components/hospital/EmsStatusCard';
import { CaseTimeline } from '@/components/hospital/CaseTimeline';
import { AcknowledgementModal } from '@/components/hospital/AcknowledgementModal';
import { DivertModal } from '@/components/hospital/DivertModal';
import { HumanOverrideModal } from '@/components/common/HumanOverrideModal';
import { allocateHospitalBay, updateCaseReadinessChecklist } from '@/lib/api/hospitals';
import { formatEta } from '@/lib/demo/utils';
import { AmbulanceTelemetryState } from '@/types/realtime';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  BedDouble, 
  ShieldCheck, 
  AlertTriangle,
  UserCheck,
  CheckSquare,
  Sliders,
  MapPin,
  Radio,
  Building2
} from 'lucide-react';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.caseId as string;
  
  const { 
    getCaseById, 
    acknowledgeCase, 
    divertCase, 
    assignBayToCase, 
    toggleChecklistItem,
    resources,
    hospitalProfile 
  } = useHospital();

  const caseData = getCaseById(caseId);

  const [isAckModalOpen, setIsAckModalOpen] = useState(false);
  const [isDivertModalOpen, setIsDivertModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedBay, setSelectedBay] = useState('');
  const [bayError, setBayError] = useState<string | null>(null);
  const [liveTelemetry, setLiveTelemetry] = useState<AmbulanceTelemetryState | null>(null);

  // Authoritative REST refresh callback for WebSocket reconnect
  const handleReloadAuthoritativeState = useCallback(() => {
    // In full backend integration this re-fetches /api/v1/hospitals/cases/{caseId}
  }, [caseId]);

  // Real-Time WebSocket Hook for ED Coordinator
  const { connectionStatus, reconnect } = useCaseWebSocket({
    caseId,
    role: 'ED_COORDINATOR',
    onReconnect: handleReloadAuthoritativeState,
    onEvent: (envelope) => {
      if (envelope.event_type === 'TELEMETRY_UPDATED' && envelope.payload) {
        setLiveTelemetry(envelope.payload as unknown as AmbulanceTelemetryState);
      }
    },
  });

  if (!caseData) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">Emergency Case Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The requested Case ID <strong className="font-mono text-slate-800">{caseId}</strong> was not found in the active emergency registry.
        </p>
        <Link
          href="/hospital/cases"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Emergency Queue</span>
        </Link>
      </div>
    );
  }

  const isAlerted = caseData.status === 'Alerted';
  const isAcknowledged = caseData.status === 'Acknowledged' || caseData.status === 'Preparing';
  const isDiverted = caseData.status === 'Diverted';

  const availableBays = resources.filter(
    r => (r.category === 'Emergency Bay' || r.category === 'Resuscitation Unit') && r.status === 'Ready'
  );

  const handleBaySelect = async (bayId: string) => {
    setSelectedBay(bayId);
    setBayError(null);
    if (bayId) {
      try {
        await allocateHospitalBay(hospitalProfile.id, caseData.id, {
          bay_id: bayId,
          allocated_by: hospitalProfile.onDutyCoordinator,
          notes: 'Bay staged via Emergency Readiness Portal',
        });
        assignBayToCase(caseData.id, bayId);
      } catch (err: any) {
        setBayError(err?.message || 'Failed to allocate bay. It may be currently occupied or cleaning.');
      }
    }
  };

  const handleChecklistToggle = async (itemId: string, itemLabel: string, currentStatus: boolean) => {
    toggleChecklistItem(caseData.id, itemId);
    try {
      await updateCaseReadinessChecklist(hospitalProfile.id, caseData.id, {
        checklist_item: itemLabel,
        is_completed: !currentStatus,
        updated_by: hospitalProfile.onDutyCoordinator,
      });
    } catch {
      // Background sync
    }
  };

  const displayEta = liveTelemetry?.eta_minutes != null
    ? `${liveTelemetry.eta_minutes.toFixed(1)}m`
    : formatEta(caseData.emsUnit.etaMinutes);

  const displayDistance = liveTelemetry?.distance_remaining_km != null
    ? liveTelemetry.distance_remaining_km.toFixed(1)
    : caseData.emsUnit.distanceRemainingKm;

  return (
    <div className="space-y-6">
      {/* Top Back Navigation & Real-Time Sync Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/hospital/cases"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Emergency Cases Queue</span>
          </Link>
          <ConnectionStatusBadge
            status={connectionStatus}
            onReconnect={reconnect}
          />
        </div>

        {/* Live Sync Status */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] font-medium">LIVE COORDINATION CONSOLE</span>
        </div>
      </div>

      {/* 1. EMERGENCY COMMAND HEADER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left Block: Case ID, Priority, Status, Demographics & Location */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                CASE ID
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 tracking-tight">
                {caseData.id}
              </h1>
              <PriorityBadge priority={caseData.operationalPriority} size="md" />
              <StatusBadge status={caseData.status} size="md" />
              {caseData.assignedBay && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {caseData.assignedBay}
                </span>
              )}
            </div>

            {/* Patient & Incident */}
            <div className="flex flex-wrap items-center gap-2.5 text-sm text-slate-700">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                {caseData.patientAge} &bull; {caseData.patientSex}
              </span>
              <span className="text-slate-300 font-bold">&mdash;</span>
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {caseData.incidentType}
              </span>
            </div>

            {/* Operational Context Metadata Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 pt-1 text-xs text-slate-600 font-mono">
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 truncate">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Reported Location</span>
                <strong className="text-slate-800 font-sans truncate block">{caseData.reportedLocation}</strong>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Alerted At</span>
                <strong className="text-slate-800">{caseData.timeAlerted}</strong>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 truncate">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned EMS</span>
                <strong className="text-slate-800">{caseData.emsUnit.unitId} ({caseData.emsUnit.vehicleType})</strong>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 truncate">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Destination</span>
                <strong className="text-emerald-700 truncate block">{hospitalProfile.name}</strong>
              </div>
            </div>
          </div>

          {/* Right Block: Prominent Command ETA Card */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shrink-0 text-right space-y-1 shadow-sm min-w-[170px]">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
              Estimated Transit Arrival
            </span>
            <div className="text-3xl font-mono font-black text-rose-700 flex items-center justify-end gap-2">
              <Clock className="h-6 w-6 text-rose-600 animate-pulse" />
              <span>{displayEta}</span>
            </div>
            <span className="text-xs text-slate-500 font-mono block">
              {displayDistance} km &middot; via {caseData.emsUnit.unitId}
            </span>
          </div>
        </div>

        {/* 2. OPERATIONAL ACTION BAR */}
        <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {bayError && (
            <div className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{bayError}</span>
            </div>
          )}

          {isAlerted && (
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Dominant Primary Action */}
              <button
                onClick={() => setIsAckModalOpen(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Acknowledge Case &amp; Stage ED</span>
              </button>

              {/* Clearly Separated Destructive Action */}
              <button
                onClick={() => setIsDivertModalOpen(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <AlertOctagon className="h-4 w-4 text-rose-600" />
                <span>Reject / Divert</span>
              </button>
            </div>
          )}

          {isAcknowledged && (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2.5 text-xs text-blue-900">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold">Case Acknowledged &amp; ED Staged</span>
                  <p className="text-slate-600 text-[11px]">
                    Acknowledged by {caseData.acknowledgedBy || hospitalProfile.onDutyCoordinator} at {caseData.timeAcknowledged || '14:08 UTC'}.
                  </p>
                </div>
              </div>

              {/* Bay Assignment Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700 font-medium">Assign Bay:</span>
                <select
                  value={selectedBay}
                  onChange={(e) => handleBaySelect(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="">{caseData.assignedBay ? `Assigned: ${caseData.assignedBay}` : 'Select Available Bay...'}</option>
                  {availableBays.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.location})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {isDiverted && (
            <div className="w-full bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-center gap-2.5">
              <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold">Case Diverted / Rejected by Hospital</span>
                <p className="text-rose-700 text-[11px]">
                  Reason: {caseData.divertReason || 'Specialty Unavailable'}. Secondary regional matching active.
                </p>
              </div>
            </div>
          )}

          {/* Tertiary Action: Human Clinical Override */}
          <div className="flex justify-end w-full pt-1">
            <button
              onClick={() => setIsOverrideModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <Sliders className="h-3.5 w-3.5 text-slate-500" />
              <span>Record Human Clinical Override</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Command Center Grid (Desktop Left ~65% / Right ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Structured Pre-Arrival Clinical & Verification Packet (7 or 8 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          {/* 4. AI Structured Information Layer */}
          <AIStructuredReportCard caseId={caseData.id} />

          {/* 3. Pre-Arrival Clinical Summary Packet */}
          <CaseSummaryCard caseData={caseData} />

          {/* 5. EMS Verified Information (Vitals, Crew & Observations) */}
          <EmsStatusCard emsUnit={caseData.emsUnit} />

          {/* 7. Operational Readiness Checklist / Handover Staging */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Operational Readiness Checklist
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {caseData.readinessChecklist.filter(i => i.completed).length} of {caseData.readinessChecklist.length} Complete
              </span>
            </div>

            <div className="space-y-2">
              {caseData.readinessChecklist.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    item.completed
                      ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleChecklistToggle(item.id, item.label, item.completed)}
                    className="mt-0.5 accent-emerald-600 h-4 w-4 rounded"
                  />
                  <div className="space-y-0.5">
                    <span className={`block font-medium ${item.completed ? 'line-through opacity-80' : ''}`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Required for: <strong className="text-slate-700">{item.requiredFor}</strong>
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 8. Chronological Decision Audit Timeline */}
          <CaseTimeline events={caseData.timeline} caseId={caseData.id} />
        </div>

        {/* Right Column: Hospital Matching, Confirmed Destination & Real-Time Telemetry (5 cols on desktop) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* 3. Destination & Hospital Matching Intelligence */}
          <HospitalMatchingCard 
            caseId={caseData.id} 
            currentDestinationId={caseData.destinationHospitalId || hospitalProfile.id}
          />

          {/* 6. Real-Time Ambulance Simulation & Telemetry Controls */}
          <AmbulanceSimulationControlCard
            caseId={caseData.id}
            hasConfirmedDestination={true}
            destinationHospitalId={caseData.destinationHospitalId || hospitalProfile.id}
            destinationHospitalName={hospitalProfile.name}
            liveTelemetry={liveTelemetry}
            onTelemetryUpdate={(tel) => setLiveTelemetry(tel)}
          />
        </div>
      </div>

      {/* Modals */}
      <AcknowledgementModal
        isOpen={isAckModalOpen}
        onClose={() => setIsAckModalOpen(false)}
        onConfirm={(notes) => acknowledgeCase(caseData.id, notes)}
        caseId={caseData.id}
        incidentType={caseData.incidentType}
        priority={caseData.operationalPriority}
        onDutyUser={hospitalProfile.onDutyCoordinator}
      />

      <DivertModal
        isOpen={isDivertModalOpen}
        onClose={() => setIsDivertModalOpen(false)}
        onConfirm={(reasonId, notes) => divertCase(caseData.id, reasonId, notes)}
        caseId={caseData.id}
        incidentType={caseData.incidentType}
      />

      <HumanOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        caseId={caseData.id}
        currentPriority={caseData.operationalPriority}
        currentDestinationId={caseData.destinationHospitalId || hospitalProfile.id}
        userRole="ED_COORDINATOR"
        userName={hospitalProfile.onDutyCoordinator}
        userId="ED-COORD-01"
      />
    </div>
  );
}
