import Link from 'next/link';
import { 
  Activity, 
  ArrowRight, 
  AlertOctagon, 
  Ambulance, 
  Building2, 
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  const workflowSteps = [
    { label: 'REPORT', desc: 'Bystander scene intake' },
    { label: 'STRUCTURE', desc: 'Assistive AI formatting' },
    { label: 'VERIFY', desc: 'EMS clinical vitals' },
    { label: 'MATCH', desc: 'Multi-factor suitability' },
    { label: 'CONFIRM', desc: 'Human clinician assignment' },
    { label: 'TRANSPORT', desc: 'Simulated transit telemetry' },
    { label: 'ARRIVE', desc: 'Staged ED bay handover' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Brand Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                LifeSync
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Emergency Coordination Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Regional Network Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* The 7-Step Emergency Coordination Sequence */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Emergency Information Lifecycle
              </h2>
              <p className="text-xs text-slate-500">
                End-to-end synchronized lifecycle with strict data provenance and human confirmation gates
              </p>
            </div>
            <span className="text-xs font-mono text-blue-600 font-bold">
              7-STAGE PIPELINE
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1 text-center"
              >
                <div className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                  0{idx + 1}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {step.label}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Three Portal Launchers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Portal 1: Citizen / Bystander */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-red-300 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold uppercase">
                  Mobile First
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Citizen / Bystander Portal
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Simple, stress-free incident intake. Capture essential observations, people count, and location in seconds.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>5-step progressive intake</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>One-click simulated GPS auto-pin</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time response tracking</span>
                </li>
              </ul>
            </div>

            <Link
              href="/citizen"
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <span>Launch Citizen Intake</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Portal 2: EMS / Paramedic Operations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Ambulance className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold uppercase">
                  Field Operations
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  EMS Operations Console
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time paramedic field console. Verify clinical vitals, review assistive AI structuring, and execute hospital matching.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Clinical vitals & assessment recorder</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Assistive AI structuring (non-diagnostic)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Deterministic 40/35/25 hospital matching</span>
                </li>
              </ul>
            </div>

            <Link
              href="/ems"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>Launch EMS Console</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Portal 3: Hospital Command */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-indigo-300 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold uppercase">
                  Emergency Command
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Hospital Emergency Readiness
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ED pre-arrival staging command. Live transit countdowns, resuscitation bay allocation, and human clinical audit.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Pre-arrival patient packet & countdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Resuscitation bay & trauma team staging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Immutable clinical decision audit timeline</span>
                </li>
              </ul>
            </div>

            <Link
              href="/hospital"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-700"
            >
              <span>Launch Hospital Command</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Demo Synthetic Disclaimer */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500 space-y-0.5">
          <p className="font-semibold text-slate-700">
            LifeSync Pre-Hospital Emergency Information Coordination Platform
          </p>
          <p>
            Operating with synthetic benchmark scenarios and simulated transit telemetry for clinical demonstration.
          </p>
        </div>
      </div>
    </main>
  );
}
