export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950 via-[#0a101f] to-slate-950">
      <div className="max-w-3xl w-full border border-slate-800/80 bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8">
        
        {/* Synthetic Data Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          DEMO / SYNTHETIC DATA
        </div>

        {/* Header Branding */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            LifeSync
          </h1>
          <p className="text-lg sm:text-xl font-medium text-slate-300 tracking-wide">
            AI-Powered Pre-Hospital Emergency Coordination
          </p>
        </div>

        {/* Core Principle */}
        <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-950/20 text-slate-200 shadow-inner">
          <p className="text-base sm:text-lg italic font-normal text-blue-100/90 leading-relaxed">
            &ldquo;Critical emergency information should reach the hospital before the patient does.&rdquo;
          </p>
        </div>

        {/* Foundation Status */}
        <div className="pt-4 border-t border-slate-800/60 text-xs text-slate-400 space-y-1">
          <p className="font-mono text-slate-400">Step 1 — Technical Foundation Initialized</p>
          <p className="text-slate-500">Citizen, EMS & Hospital Readiness Portals reserved for subsequent phases</p>
        </div>

      </div>
    </main>
  );
}
