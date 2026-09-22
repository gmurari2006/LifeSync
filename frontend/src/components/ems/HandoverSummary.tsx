'use client';

import React, { useState } from 'react';
import { EMSCase } from '@/types/ems';
import { useEMS } from '@/context/EMSContext';
import { 
  FileCheck, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Building2, 
  Users, 
  Heart, 
  Eye, 
  Wind, 
  AlertTriangle,
  Stethoscope,
  ArrowRight,
  Clock
} from 'lucide-react';

interface HandoverSummaryProps {
  currentCase: EMSCase;
  onHandoverComplete?: () => void;
}

export function HandoverSummary({ currentCase, onHandoverComplete }: HandoverSummaryProps) {
  const { completeHandover } = useEMS();
  const [receivingStaff, setReceivingStaff] = useState(
    currentCase.handoverReceivingNurseOrPhysician || 'Dr. Sarah Jenkins (ED Lead)'
  );
  const [handoverNotes, setHandoverNotes] = useState(
    currentCase.handoverNotes || 'Verbal and telemetry handoff accepted at bedside. Patient placed in designated resuscitation suite.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCompleted = currentCase.transportStatus === 'Handover Complete' || Boolean(currentCase.handoverCompletedAt);

  const handleComplete = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      completeHandover(currentCase.id, receivingStaff, handoverNotes);
      setIsSubmitting(false);
      if (onHandoverComplete) onHandoverComplete();
    }, 400);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
      
      {/* Handover Status Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border ${
            isCompleted 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
              : 'bg-blue-50 border-blue-200 text-blue-600'
          }`}>
            {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <FileCheck className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900">
              {currentCase.id} &middot; Bedside Handover
            </h2>
            <p className="text-xs text-slate-500">
              Structured clinical transfer packet from {currentCase.assignedUnitId} to {currentCase.destinationHospital.name}
            </p>
          </div>
        </div>

        <div>
          {isCompleted ? (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>HANDOVER COMPLETED</span>
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
              <span>Ready for Bedside Handover</span>
            </span>
          )}
        </div>
      </div>

      {/* Grid of Verified Clinical Findings & Transfer Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* Section 1: Patient & Baseline Intake */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-blue-600" /> 1. Patient &amp; Incident Profile
          </h4>
          <div className="space-y-1 text-slate-700">
            <p className="text-sm font-bold text-slate-900">{currentCase.incidentType}</p>
            <p>Demographics: <strong className="text-slate-900">{currentCase.patientAge}y &middot; {currentCase.patientSex}</strong></p>
            <p>Scene Location: <span className="text-slate-700">{currentCase.citizenReport.reportedLocation}</span></p>
            <p>Reported By Citizen: <span className="text-slate-500 italic">&ldquo;{currentCase.citizenReport.reportedObservations}&rdquo;</span></p>
          </div>
        </div>

        {/* Section 2: EMS-Verified Findings */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 2. EMS-Verified Assessment
          </h4>
          <div className="grid grid-cols-2 gap-2 text-slate-700">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">Consciousness</span>
              <strong className="text-slate-900">{currentCase.emsVerification.consciousness}</strong>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">Breathing</span>
              <strong className="text-slate-900">{currentCase.emsVerification.breathing}</strong>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">Bleeding</span>
              <strong className="text-slate-900">{currentCase.emsVerification.bleeding}</strong>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">Airway</span>
              <strong className="text-slate-900">{currentCase.emsVerification.airway}</strong>
            </div>
          </div>
          {currentCase.emsVerification.clinicalNotes && (
            <p className="text-[11px] text-emerald-700 italic pt-1">
              &ldquo;{currentCase.emsVerification.clinicalNotes}&rdquo;
            </p>
          )}
        </div>

        {/* Section 3: Latest Verified Vitals */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-rose-600" /> 3. Latest Verified Vital Signs
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">Heart Rate</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{currentCase.vitals.heartRate} bpm</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">Blood Press.</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{currentCase.vitals.systolicBp}/{currentCase.vitals.diastolicBp}</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">SpO2</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{currentCase.vitals.oxygenSaturation}%</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">Resp. Rate</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{currentCase.vitals.respiratoryRate}/min</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">Temp</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{currentCase.vitals.temperature}°C</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">GCS</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{currentCase.vitals.gcs}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Destination & Handover Transfer Details */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-purple-600" /> 4. Hospital &amp; Staff Verification
          </h4>
          
          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Receiving Hospital Clinician / Lead:
              </label>
              <input
                type="text"
                disabled={isCompleted}
                value={receivingStaff}
                onChange={(e) => setReceivingStaff(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Handover Notes / Sign-Off Remarks:
              </label>
              <textarea
                disabled={isCompleted}
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none min-h-[55px] disabled:bg-slate-100 disabled:text-slate-600"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation & Completion CTA */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          {isCompleted ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Handover recorded at {currentCase.handoverCompletedAt || '14:40 UTC'}</span>
            </span>
          ) : (
            <span>Both EMS crew and receiving ED lead must confirm transfer of care.</span>
          )}
        </div>

        {!isCompleted ? (
          <button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>{isSubmitting ? 'Signing Transfer...' : 'Complete Clinical Handover'}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 font-bold text-xs flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Clinical Handover Certified</span>
          </button>
        )}
      </div>
    </div>
  );
}
