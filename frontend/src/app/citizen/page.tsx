'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCitizen } from '@/context/CitizenContext';
import { 
  AlertOctagon, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Clock,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';

export default function CitizenLandingPage() {
  const router = useRouter();
  const { resetDraftReport, submittedCases } = useCitizen();
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [showLookup, setShowLookup] = useState(false);

  const handleStartReport = () => {
    resetDraftReport();
    router.push('/citizen/report');
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = lookupId.trim().toUpperCase();
    if (!cleanId) {
      setLookupError('Please enter a valid Case ID.');
      return;
    }
    router.push(`/citizen/emergency/${cleanId}`);
  };

  return (
    <div className="space-y-6 py-2">
      {/* Primary Emergency Intake Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 text-center space-y-6 shadow-sm">
        {/* Urgent Emergency Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200 shadow-xs">
          <AlertOctagon className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Emergency Assistance
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Tell us what is happening on scene. Your observations are immediately structured and shared with dispatch, responding paramedics, and the receiving hospital.
          </p>
        </div>

        {/* The One Dominant Primary Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStartReport}
            className="w-full sm:w-auto min-w-[280px] py-3.5 px-8 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2.5 mx-auto focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <span>START EMERGENCY REPORT</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-[11px] text-slate-400 mt-2">
            Takes under 60 seconds &middot; No medical knowledge needed
          </p>
        </div>

        {/* Secondary Action: Track Existing Report */}
        <div className="pt-4 border-t border-slate-100">
          {!showLookup ? (
            <button
              type="button"
              onClick={() => setShowLookup(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Already submitted a report? Track by Case ID &rarr;
            </button>
          ) : (
            <form onSubmit={handleLookupSubmit} className="space-y-3 max-w-sm mx-auto pt-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Enter your Case ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => { setLookupId(e.target.value); setLookupError(''); }}
                  placeholder="e.g. LS-2026-001"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Track
                </button>
              </div>
              {lookupError && (
                <p className="text-xs text-red-600">{lookupError}</p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Submitted Cases Quick List (if any from current session) */}
      {(() => {
        const casesList = Object.values(submittedCases || {});
        if (casesList.length === 0) return null;
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Your Active Emergency Reports
            </span>
            <div className="space-y-2">
              {casesList.map((c) => (
                <Link
                  key={c.caseId}
                  href={`/citizen/emergency/${c.caseId}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <span className="font-mono font-bold text-xs text-blue-600 block">
                      {c.caseId}
                    </span>
                    <span className="text-xs text-slate-700 font-medium">
                      {c.report?.incidentType} &middot; {c.report?.location?.address || 'GPS Location Captured'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span>Track Status</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
