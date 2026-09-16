'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useHospital } from '@/context/HospitalContext';
import { PriorityBadge } from '@/components/hospital/PriorityBadge';
import { StatusBadge } from '@/components/hospital/StatusBadge';
import { CaseSummaryCard } from '@/components/hospital/CaseSummaryCard';
import { AIStructuredReportCard } from '@/components/ems/AIStructuredReportCard';
import { EmsStatusCard } from '@/components/hospital/EmsStatusCard';
import { CaseTimeline } from '@/components/hospital/CaseTimeline';
import { AcknowledgementModal } from '@/components/hospital/AcknowledgementModal';
import { DivertModal } from '@/components/hospital/DivertModal';
import { formatEta } from '@/lib/demo/utils';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  BedDouble, 
  ShieldCheck, 
  AlertTriangle,
  UserCheck,
  CheckSquare
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
  const [selectedBay, setSelectedBay] = useState('');

  if (!caseData) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center space-y-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-400" />
        <h2 className="text-lg font-bold text-white">Emergency Case Not Found</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The requested Case ID <strong className="font-mono text-slate-200">{caseId}</strong> was not found in the active emergency registry.
        </p>
        <Link
          href="/hospital/cases"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
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

  const handleBaySelect = (bayId: string) => {
    setSelectedBay(bayId);
    if (bayId) {
      assignBayToCase(caseData.id, bayId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Back Navigation & Case Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/hospital/cases"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Emergency Cases Queue</span>
        </Link>

        {/* Live Sync Status */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Pre-Hospital Coordination Session</span>
        </div>
      </div>

      {/* Main Case Operations Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-mono font-extrabold text-white tracking-tight">
                {caseData.id}
              </h1>
              <PriorityBadge priority={caseData.operationalPriority} size="md" />
              <StatusBadge status={caseData.status} size="md" />
              {caseData.assignedBay && (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  {caseData.assignedBay}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200 font-medium">
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-xs border border-blue-800">
                {caseData.patientAge} {caseData.patientSex}
              </span>
              <span>—</span>
              <span className="text-base font-bold text-white">{caseData.incidentType}</span>
            </div>

            <p className="text-xs text-slate-400">
              Reported Location: <strong className="text-slate-300">{caseData.reportedLocation}</strong> • Alerted at {caseData.timeAlerted}
            </p>
          </div>

          {/* Prominent ETA & Transport Card */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0">
            <div className="text-right space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Estimated Transit Arrival
              </span>
              <div className="text-2xl font-mono font-extrabold text-red-400 flex items-center justify-end gap-1.5">
                <Clock className="h-5 w-5 text-red-400 animate-pulse" />
                <span>{formatEta(caseData.emsUnit.etaMinutes)}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {caseData.emsUnit.distanceRemainingKm} km remaining via {caseData.emsUnit.unitId}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Action Area */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {isAlerted && (
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsAckModalOpen(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/40 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Acknowledge Case & Stage ED</span>
              </button>

              <button
                onClick={() => setIsDivertModalOpen(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold transition-all"
              >
                <AlertOctagon className="h-4 w-4 text-red-400" />
                <span>Reject / Divert</span>
              </button>
            </div>
          )}

          {isAcknowledged && (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-blue-950/20 p-3 rounded-xl border border-blue-500/30">
              <div className="flex items-center gap-2.5 text-xs text-blue-200">
                <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0" />
                <div>
                  <span className="font-bold">Case Acknowledged</span>
                  <p className="text-slate-400 text-[11px]">
                    Acknowledged by {caseData.acknowledgedBy || hospitalProfile.onDutyCoordinator} at {caseData.timeAcknowledged || '14:08 UTC'}.
                  </p>
                </div>
              </div>

              {/* Bay Assignment Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-medium">Assign Bay:</span>
                <select
                  value={selectedBay}
                  onChange={(e) => handleBaySelect(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
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
            <div className="w-full bg-red-950/30 p-3 rounded-xl border border-red-500/40 text-xs text-red-300 flex items-center gap-2.5">
              <AlertOctagon className="h-5 w-5 text-red-400 shrink-0" />
              <div>
                <span className="font-bold">Case Diverted / Rejected by Hospital</span>
                <p className="text-red-400 text-[11px]">
                  Reason: {caseData.divertReason}. Secondary matching initiated.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Clinical & Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Structured Pre-Arrival Clinical Packet (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Structured Information Layer */}
          <AIStructuredReportCard caseId={caseData.id} />

          {/* Clinical Findings Packet */}
          <CaseSummaryCard caseData={caseData} />

          {/* Operational Readiness Checklist */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Operational Readiness Checklist
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {caseData.readinessChecklist.filter(i => i.completed).length} of {caseData.readinessChecklist.length} Complete
              </span>
            </div>

            <div className="space-y-2">
              {caseData.readinessChecklist.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    item.completed
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(caseData.id, item.id)}
                    className="mt-0.5 accent-emerald-500 h-4 w-4 rounded"
                  />
                  <div className="space-y-0.5">
                    <span className={`block font-medium ${item.completed ? 'line-through opacity-80' : ''}`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Required for: <strong>{item.requiredFor}</strong>
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: EMS Status & Decision Audit Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* EMS Telemetry Card */}
          <EmsStatusCard emsUnit={caseData.emsUnit} />

          {/* Chronological Audit Timeline */}
          <CaseTimeline events={caseData.timeline} />
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
    </div>
  );
}
