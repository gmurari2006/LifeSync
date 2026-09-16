'use client';

import React, { useState } from 'react';
import { EMSVitals } from '@/types/ems';
import { useEMS } from '@/context/EMSContext';
import { 
  Heart, 
  Activity, 
  Wind, 
  Thermometer, 
  Brain, 
  ShieldCheck, 
  Plus, 
  Minus, 
  Clock, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface VitalsCardProps {
  caseId: string;
  vitals: EMSVitals;
}

export function VitalsCard({ caseId, vitals }: VitalsCardProps) {
  const { updateVitals } = useEMS();

  const [hr, setHr] = useState(vitals.heartRate || 80);
  const [sys, setSys] = useState(vitals.systolicBp || 120);
  const [dia, setDia] = useState(vitals.diastolicBp || 80);
  const [spo2, setSpo2] = useState(vitals.oxygenSaturation || 98);
  const [rr, setRr] = useState(vitals.respiratoryRate || 16);
  const [temp, setTemp] = useState(vitals.temperature || 36.8);
  const [gcs, setGcs] = useState(vitals.gcs || 15);
  const [isSaved, setIsSaved] = useState(false);

  const handleSyncVitals = () => {
    updateVitals(caseId, {
      heartRate: hr,
      systolicBp: sys,
      diastolicBp: dia,
      oxygenSaturation: spo2,
      respiratoryRate: rr,
      temperature: temp,
      gcs: gcs,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="rounded-3xl border border-red-500/40 bg-gradient-to-b from-red-950/20 via-slate-900/80 to-slate-950 p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-red-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
              EMS-Verified Vital Signs
            </h3>
            <p className="text-[11px] text-red-300 font-medium">
              Synchronized pre-arrival telemetry stream &middot; Recorded {vitals.recordedAt}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold uppercase tracking-wider">
          EMS-Verified Vitals
        </span>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        
        {/* Heart Rate */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-rose-400">
              <Heart className="h-3.5 w-3.5" /> Heart Rate
            </span>
            <span className="text-[10px] font-mono">bpm</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setHr(prev => Math.max(30, prev - 2))}
              className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono font-black text-2xl text-white">
              {hr}
            </span>
            <button
              type="button"
              onClick={() => setHr(prev => Math.min(220, prev + 2))}
              className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <Activity className="h-3.5 w-3.5" /> Blood Pressure
            </span>
            <span className="text-[10px] font-mono">mmHg</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <input
              type="number"
              value={sys}
              onChange={(e) => setSys(parseInt(e.target.value) || 0)}
              className="w-12 bg-transparent text-center font-mono font-black text-xl text-white border-b border-slate-700 focus:border-amber-400 focus:outline-none"
            />
            <span className="text-slate-500 font-bold">/</span>
            <input
              type="number"
              value={dia}
              onChange={(e) => setDia(parseInt(e.target.value) || 0)}
              className="w-12 bg-transparent text-center font-mono font-black text-xl text-white border-b border-slate-700 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Oxygen Saturation */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-sky-400">
              <Wind className="h-3.5 w-3.5" /> SpO2 Saturation
            </span>
            <span className="text-[10px] font-mono">%</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSpo2(prev => Math.max(50, prev - 1))}
              className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className={`font-mono font-black text-2xl ${spo2 < 92 ? 'text-red-400' : 'text-white'}`}>
              {spo2}%
            </span>
            <button
              type="button"
              onClick={() => setSpo2(prev => Math.min(100, prev + 1))}
              className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <Wind className="h-3.5 w-3.5" /> Resp. Rate
            </span>
            <span className="text-[10px] font-mono">/min</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setRr(prev => Math.max(4, prev - 1))}
              className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono font-black text-2xl text-white">
              {rr}
            </span>
            <button
              type="button"
              onClick={() => setRr(prev => Math.min(60, prev + 1))}
              className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Temperature */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-orange-400">
              <Thermometer className="h-3.5 w-3.5" /> Temp
            </span>
            <span className="text-[10px] font-mono">°C</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setTemp(prev => parseFloat((Math.max(32, prev - 0.2)).toFixed(1)))}
              className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono font-black text-2xl text-white">
              {temp}°
            </span>
            <button
              type="button"
              onClick={() => setTemp(prev => parseFloat((Math.min(42, prev + 0.2)).toFixed(1)))}
              className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Glasgow Coma Scale (GCS) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-purple-400">
              <Brain className="h-3.5 w-3.5" /> GCS Total
            </span>
            <span className="text-[10px] font-mono">3 - 15</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setGcs(prev => Math.max(3, prev - 1))}
              className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className={`font-mono font-black text-2xl ${gcs < 9 ? 'text-red-400' : 'text-white'}`}>
              {gcs}
            </span>
            <button
              type="button"
              onClick={() => setGcs(prev => Math.min(15, prev + 1))}
              className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Sync Action & Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>Recorded by {vitals.recordedBy} &middot; {vitals.recordedAt}</span>
        </div>

        <button
          type="button"
          onClick={handleSyncVitals}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-red-950/60 transition-all flex items-center gap-2"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-white" />
              <span>Vitals Broadcast Synchronized!</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Broadcast Updated Vitals</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
