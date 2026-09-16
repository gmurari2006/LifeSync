import Link from 'next/link';
import { Activity, ArrowRight, ShieldAlert, BedDouble, Inbox, Radio } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950 via-[#0a101f] to-slate-950">
      <div className="max-w-3xl w-full border border-slate-800/80 bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        
        {/* Synthetic Data Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          DEMO / SYNTHETIC DATA
        </div>

        {/* Header Branding */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
              <Activity className="h-7 w-7 animate-pulse" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              LifeSync
            </h1>
          </div>
          <p className="text-lg sm:text-xl font-medium text-slate-300 tracking-wide">
            AI-Powered Pre-Hospital Emergency Coordination
          </p>
        </div>

        {/* Core Principle */}
        <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-950/20 text-slate-200 shadow-inner">
          <p className="text-base sm:text-lg italic font-normal text-blue-100/90 leading-relaxed">
            &ldquo;Critical emergency information should reach the hospital before the patient does.&rdquo;
          </p>
        </div>

        {/* Portal Entry Call-to-Action */}
        <div className="space-y-3 pt-2">
          <Link
            href="/hospital"
            className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-900/40 transition-all transform hover:-translate-y-0.5"
          >
            <span>Launch Hospital Emergency Readiness Portal</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-slate-400">
            Simulated CityCare Emergency Department Operations Console
          </p>
        </div>

        {/* Module Status Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/60 text-xs text-left">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-blue-400 flex items-center gap-1.5">
              <Inbox className="h-3.5 w-3.5" /> Incoming Cases
            </span>
            <p className="text-slate-400 text-[11px]">Real-time queue & structured pre-arrival handoffs.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" /> Resource Readiness
            </span>
            <p className="text-slate-400 text-[11px]">1-click bay staging & specialist readiness checklists.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-purple-400 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5" /> EMS Telemetry
            </span>
            <p className="text-slate-400 text-[11px]">En-route vitals sync & distance tracking.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
