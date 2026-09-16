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
    <div className="space-y-8 py-4">
      {/* Hero Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-10 text-center space-y-6 shadow-2xl">
        {/* Urgent Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-600/20 border border-red-500/40 text-red-400">
          <AlertOctagon className="h-9 w-9 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Emergency Assistance
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
            Share essential emergency observations so responding ambulance crews and receiving hospitals can stage resources before arrival.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStartReport}
            className="w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-extrabold text-lg shadow-2xl shadow-red-950/80 transition-all flex items-center justify-center gap-3 mx-auto"
          >
            <span>Report an Emergency</span>
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>

        {/* Secondary Lookup Action */}
        <div className="pt-2 border-t border-slate-800/80">
          {!showLookup ? (
            <button
              type="button"
              onClick={() => setShowLookup(true)}
              className="text-xs sm:text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              I already reported an emergency (Track by Case ID)
            </button>
          ) : (
            <form onSubmit={handleLookupSubmit} className="space-y-3 max-w-sm mx-auto pt-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Enter your Case ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => { setLookupId(e.target.value); setLookupError(''); }}
                  placeholder="e.g. LS-2026-101"
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 uppercase focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                >
                  Track
                </button>
              </div>
              {lookupError && (
                <p className="text-xs text-red-400">{lookupError}</p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Demo Scenario Shortcuts for Hackathon */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Demo Cases Available for Tracking:
          </span>
          <span className="text-[10px] font-mono text-slate-500">Synthetic Scenarios</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Link
            href="/citizen/emergency/LS-2026-101"
            className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-slate-700 transition-all flex items-center justify-between"
          >
            <div>
              <span className="font-mono font-bold text-blue-400 block">LS-2026-101</span>
              <span className="text-slate-300">Road Accident (2 People)</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500" />
          </Link>

          <Link
            href="/citizen/emergency/LS-2026-102"
            className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-slate-700 transition-all flex items-center justify-between"
          >
            <div>
              <span className="font-mono font-bold text-blue-400 block">LS-2026-102</span>
              <span className="text-slate-300">Chest Pain (Suspected Cardiac)</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}
