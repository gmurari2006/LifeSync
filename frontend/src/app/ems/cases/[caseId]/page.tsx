'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEMS } from '@/context/EMSContext';
import { CitizenReportCard } from '@/components/ems/CitizenReportCard';
import { AIStructuredReportCard } from '@/components/ems/AIStructuredReportCard';
import { EMSVerificationCard } from '@/components/ems/EMSVerificationCard';
import { VitalsCard } from '@/components/ems/VitalsCard';
import { PatientStatusCard } from '@/components/ems/PatientStatusCard';
import { TransportStatusCard } from '@/components/ems/TransportStatusCard';
import { HospitalDestinationCard } from '@/components/ems/HospitalDestinationCard';
import { HospitalMatchingCard } from '@/components/ems/HospitalMatchingCard';
import { EMSTimeline } from '@/components/ems/EMSTimeline';
import { StatusActionBar } from '@/components/ems/StatusActionBar';
import { 
  ArrowLeft, 
  AlertCircle, 
  AlertOctagon, 
  MapPin, 
  Building2, 
  Clock, 
  Users, 
  Radio, 
  Navigation,
  FileCheck
} from 'lucide-react';

export default function EMSCaseDetailPage({
  params,
}: {
  params: { caseId: string };
}) {
  const router = useRouter();
  const { getCaseById, activeUnit, updateDestination } = useEMS();
  const caseId = params.caseId;
  const currentCase = getCaseById(caseId);

  if (!currentCase) {
    return (
      <div className="space-y-6 py-12 text-center">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 max-w-lg mx-auto space-y-4 shadow-2xl">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white">Emergency Case Not Found</h2>
            <p className="text-xs text-slate-300">
              No active EMS dispatch found matching Case ID <span className="font-mono font-bold text-amber-300">&ldquo;{caseId}&rdquo;</span>.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/ems/cases"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all"
            >
              Return to Case Queue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'High':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-blue-950 text-blue-300 border-blue-800';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/ems/cases"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Case Queue</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/ems/handover"
            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Bedside Handover</span>
          </Link>
          <Link
            href="/ems/active"
            className="px-3 py-1.5 rounded-xl border border-orange-500/40 bg-orange-950/40 hover:bg-orange-900/50 text-orange-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Navigation className="h-3.5 w-3.5 text-orange-400" />
            <span>In-Transit View</span>
          </Link>
        </div>
      </div>

      {/* Case Header Hero Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono font-black text-2xl sm:text-3xl text-white">
                {currentCase.id}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${getPriorityBadge(currentCase.operationalPriority)}`}>
                {currentCase.operationalPriority} Priority
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold border border-orange-500/40 bg-orange-950/60 text-orange-300">
                Status: {currentCase.transportStatus}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {currentCase.incidentType}
            </h1>
          </div>

          {/* Quick Telemetry Pill */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-right space-y-0.5 shrink-0 self-start md:self-auto">
            <div className="flex items-center md:justify-end gap-1 font-mono font-black text-lg text-amber-300">
              <Clock className="h-4 w-4" />
              <span>ETA {currentCase.etaMinutes} min</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {currentCase.distanceRemainingKm} km to {currentCase.destinationHospital.name}
            </p>
          </div>
        </div>

        {/* Demographics & Metadata strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="space-y-0.5">
            <span className="text-slate-500 block text-[10px] uppercase">Patient</span>
            <span className="font-bold text-white">{currentCase.patientAge}y &middot; {currentCase.patientSex}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-500 block text-[10px] uppercase">Patient Count</span>
            <span className="font-bold text-white">{currentCase.patientCount} Patient{currentCase.patientCount > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-500 block text-[10px] uppercase">Assigned Unit</span>
            <span className="font-bold text-orange-400 font-mono">{currentCase.assignedUnitId}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-500 block text-[10px] uppercase">Last Sync</span>
            <span className="font-bold text-slate-300">{currentCase.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Assessment & Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Citizen Reported Info */}
          <CitizenReportCard citizenReport={currentCase.citizenReport} />

          {/* 2. AI Structured Information Layer */}
          <AIStructuredReportCard caseId={currentCase.id} />

          {/* 3. EMS Verification Assessment */}
          <EMSVerificationCard caseId={currentCase.id} verification={currentCase.emsVerification} />

          {/* 3. EMS Verified Vital Signs */}
          <VitalsCard caseId={currentCase.id} vitals={currentCase.vitals} />

          {/* 4. Patient Operational Status */}
          <PatientStatusCard caseId={currentCase.id} patientStatus={currentCase.patientStatus} />
        </div>

        {/* Right Column: Transport, Matching & Receiving Hospital (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 5. Deterministic Hospital Matching & Readiness Intelligence */}
          <HospitalMatchingCard
            caseId={currentCase.id}
            currentDestinationId={currentCase.destinationHospital.hospitalId}
            onDestinationConfirmed={(hospitalId, hospitalName) =>
              updateDestination(currentCase.id, hospitalId, hospitalName)
            }
          />

          {/* 6. Ambulance & Transport Status Progression */}
          <TransportStatusCard caseId={currentCase.id} transportStatus={currentCase.transportStatus} />

          {/* 7. Receiving Hospital Destination Card */}
          <HospitalDestinationCard destination={currentCase.destinationHospital} />

          {/* 8. Emergency Coordination Multi-Actor Timeline */}
          <EMSTimeline events={currentCase.timeline} />
        </div>

      </div>

      {/* Sticky Bottom Contextual Action Bar */}
      <div className="fixed bottom-3 left-4 right-4 max-w-7xl mx-auto z-30">
        <StatusActionBar currentCase={currentCase} />
      </div>

    </div>
  );
}
