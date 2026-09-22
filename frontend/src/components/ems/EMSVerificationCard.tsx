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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              EMS Verification Assessment
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Verified clinical findings by on-scene paramedic crew
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-[11px] font-bold text-emerald-700 animate-fade-in flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Auto-Saved
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
            EMS-VERIFIED RECORD
          </span>
        </div>
      </div>

      {/* Verification Parameters Grid */}
      <div className="space-y-4">
        
        {/* Parameter 1: Consciousness / Responsiveness */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-blue-600" /> Consciousness Verification
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Current: <strong className="text-slate-900">{verification.consciousness}</strong>
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
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? isAlert
                        ? 'border-red-600 bg-red-600 text-white shadow-xs'
                        : 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameter 2: Breathing Quality */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Wind className="h-4 w-4 text-blue-600" /> Breathing Assessment
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Current: <strong className="text-slate-900">{verification.breathing}</strong>
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
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? isAlert
                        ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                        : 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameter 3: Visible Bleeding */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Observable Hemorrhage / Bleeding
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Current: <strong className="text-slate-900">{verification.bleeding}</strong>
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
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? isAlert
                        ? 'border-red-600 bg-red-600 text-white shadow-xs'
                        : 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameter 4: Airway Status */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-purple-600" /> Airway Patency
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Current: <strong className="text-slate-900">{verification.airway}</strong>
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
                        ? 'border-red-600 bg-red-600 text-white shadow-xs'
                        : 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
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
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-600" /> Paramedic Field Clinical Notes
            </span>
            {verification.lastVerifiedAt && (
              <span className="text-[11px] font-mono text-slate-500">
                Verified at: {verification.lastVerifiedAt}
              </span>
            )}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Record verified clinical findings, interventions performed (IV access, oxygen therapy, medications given)..."
            className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none min-h-[85px] shadow-xs"
          />
        </div>
      </div>
    </div>
  );
}
