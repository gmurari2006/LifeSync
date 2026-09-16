import Link from 'next/link';
import { 
  Activity, 
  ArrowRight, 
  AlertOctagon, 
  Building2, 
  BedDouble, 
  Inbox, 
  Radio, 
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 text-center bg-gradient-to-b from-slate-950 via-[#0a101f] to-slate-950">
      <div className="max-w-4xl w-full border border-slate-800/80 bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        
        {/* Synthetic Data Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>DEMO / SYNTHETIC DATA &middot; STEP 3 COMPLETE</span>
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
          <p className="text-base sm:text-lg font-medium text-slate-300 tracking-wide max-w-xl mx-auto">
            AI-Assisted Pre-Hospital Emergency Coordination Platform
          </p>
        </div>

        {/* Core Principle */}
        <div className="p-5 sm:p-6 rounded-2xl border border-blue-500/20 bg-blue-950/20 text-slate-200 shadow-inner max-w-2xl mx-auto">
          <p className="text-sm sm:text-base italic font-normal text-blue-100/90 leading-relaxed">
            &ldquo;Critical emergency information should reach the hospital before the patient does.&rdquo;
          </p>
        </div>

        {/* Dual Portal Launcher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left pt-2">
          
          {/* Portal 1: Citizen / Bystander Portal */}
          <div className="rounded-3xl border border-red-500/40 bg-gradient-to-b from-red-950/30 via-slate-900/60 to-slate-950 p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group hover:border-red-500/70 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400">
                  <AlertOctagon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/60 uppercase font-semibold">
                  Module C (Step 3)
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-white group-hover:text-red-300 transition-colors">
                  Citizen / Bystander Portal
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mobile-first emergency intake. Report scene observations, people affected, observed condition, and location in seconds.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-400" />
                  <span>5-Step low cognitive load flow</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-400" />
                  <span>Simulated GPS location capture</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-400" />
                  <span>Real-time pre-hospital lifecycle tracker</span>
                </div>
              </div>
            </div>

            <Link
              href="/citizen"
              className="py-3.5 px-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Launch Citizen Emergency Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Portal 2: Hospital Emergency Readiness Portal */}
          <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-b from-blue-950/30 via-slate-900/60 to-slate-950 p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group hover:border-blue-500/70 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 uppercase font-semibold">
                  Module H (Step 2)
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-white group-hover:text-blue-300 transition-colors">
                  Hospital Readiness Portal
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Emergency department command console. Monitor incoming pre-arrivals, clinical summaries, and stage trauma/cardiac bay readiness.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Incoming emergency pre-arrival queue</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Pre-arrival structured clinical handoff</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>1-Click ED Bay readiness staging</span>
                </div>
              </div>
            </div>

            <Link
              href="/hospital"
              className="py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-950/60 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Launch Hospital ED Console</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

        {/* Global Architecture Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/60 text-xs text-left">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-red-400 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" /> Citizen Intake
            </span>
            <p className="text-slate-400 text-[11px]">Structured scene observations without diagnostic jargon.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-blue-400 flex items-center gap-1.5">
              <Inbox className="h-3.5 w-3.5" /> Pre-Arrival Queue
            </span>
            <p className="text-slate-400 text-[11px]">Hospital ED alerts before patient arrives at the door.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" /> Resource Staging
            </span>
            <p className="text-slate-400 text-[11px]">Trauma team activation, blood units & cath lab prep.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
