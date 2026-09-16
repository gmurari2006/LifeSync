'use client';

import React, { useState } from 'react';
import { 
  EMSVerification, 
  ObservationState, 
  BreathingState, 
  BleedingState, 
  AirwayState 
} from '@/types/ems';
import { useEMS } from '@/context/EMSContext';
import { 
  CheckSquare, 
  Eye, 
  Wind, 
  ShieldCheck, 
  AlertTriangle, 
  Stethoscope, 
  FileText,
  Clock
} from 'lucide-react';

interface EMSVerificationCardProps {
  caseId: string;
  verification: EMSVerification;
}

export function EMSVerificationCard({ caseId, verification }: EMSVerificationCardProps) {
  const { updateVerification } = useEMS();
  const [notes, setNotes] = useState(verification.clinicalNotes || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleConsciousness = (val: ObservationState) => {
    updateVerification(caseId, { consciousness: val });
    triggerSaveFeedback();
  };

  const handleBreathing = (val: BreathingState) => {
    updateVerification(caseId, { breathing: val });
    triggerSaveFeedback();
  };

  const handleBleeding = (val: BleedingState) => {
    updateVerification(caseId, { bleeding: val });
    triggerSaveFeedback();
  };

  const handleAirway = (val: AirwayState) => {
    updateVerification(caseId, { airway: val });
    triggerSaveFeedback();
  };

  const handleNotesBlur = () => {
    updateVerification(caseId, { clinicalNotes: notes });
    triggerSaveFeedback();
  };

  const triggerSaveFeedback = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-slate-900/80 to-slate-950 p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
              EMS Verification Assessment
            </h3>
            <p className="text-[11px] text-emerald-300 font-medium">
              Verified clinical findings by on-scene paramedic crew
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-[11px] font-bold text-emerald-400 animate-fade-in flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Auto-Saved
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider">
            EMS-Verified Record
          </span>
        </div>
      </div>

      {/* Verification Parameters Grid */}
      <div className="space-y-4">
        
        {/* Parameter 1: Consciousness / Responsiveness */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-amber-400" /> Consciousness Verification
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Current: <strong className="text-white">{verification.consciousness}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['Responding', 'Not responding', 'Unable to assess'] as ObservationState[]).map((opt) => {
              const isSelected = verification.consciousness === opt;
              const isAlert = opt === 'Not responding';
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleConsciousness(opt)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? isAlert
                        ? 'border-red-500 bg-red-950 text-white shadow-md ring-2 ring-red-500/50'
                        : 'border-emerald-500 bg-emerald-950 text-white shadow-md ring-2 ring-emerald-500/40'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameter 2: Breathing Quality */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Wind className="h-4 w-4 text-sky-400" /> Breathing Assessment
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Current: <strong className="text-white">{verification.breathing}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['Normal', 'Abnormal', 'Unable to assess'] as BreathingState[]).map((opt) => {
              const isSelected = verification.breathing === opt;
              const isAlert = opt === 'Abnormal';
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleBreathing(opt)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? isAlert
                        ? 'border-amber-500 bg-amber-950 text-white shadow-md ring-2 ring-amber-500/50'
                        : 'border-emerald-500 bg-emerald-950 text-white shadow-md ring-2 ring-emerald-500/40'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameter 3: Visible Bleeding */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-400" /> Observable Hemorrhage / Bleeding
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Current: <strong className="text-white">{verification.bleeding}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['Present', 'Not present', 'Unable to assess'] as BleedingState[]).map((opt) => {
              const isSelected = verification.bleeding === opt;
              const isAlert = opt === 'Present';
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleBleeding(opt)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? isAlert
                        ? 'border-red-500 bg-red-950 text-white shadow-md ring-2 ring-red-500/50'
                        : 'border-emerald-500 bg-emerald-950 text-white shadow-md ring-2 ring-emerald-500/40'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameter 4: Airway Status */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-purple-400" /> Airway Patency
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Current: <strong className="text-white">{verification.airway}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {(['Patent', 'Compromised', 'Maintained with Adjunct', 'Unable to assess'] as AirwayState[]).map((opt) => {
              const isSelected = verification.airway === opt;
              const isAlert = opt === 'Compromised';
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleAirway(opt)}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all active:scale-95 ${
                    isSelected
                      ? isAlert
                        ? 'border-red-500 bg-red-950 text-white ring-2 ring-red-500/50'
                        : 'border-emerald-500 bg-emerald-950 text-white ring-2 ring-emerald-500/40'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clinical Field Notes */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-orange-400" /> Paramedic Field Clinical Notes
            </span>
            {verification.lastVerifiedAt && (
              <span className="text-[11px] font-mono text-slate-400">
                Verified at: {verification.lastVerifiedAt}
              </span>
            )}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Record verified clinical findings, interventions performed (IV access, oxygen therapy, medications given)..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none min-h-[85px]"
          />
        </div>
      </div>
    </div>
  );
}
