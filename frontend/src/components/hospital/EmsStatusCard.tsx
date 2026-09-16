import React from 'react';
import { EmsUnitInfo } from '@/types/hospital';
import { formatEta } from '@/lib/demo/utils';
import { 
  Navigation, 
  Clock, 
  Activity, 
  Gauge, 
  MapPin, 
  Phone, 
  Users, 
  ShieldCheck,
  Heart,
  Wind
} from 'lucide-react';

interface EmsStatusCardProps {
  emsUnit: EmsUnitInfo;
}

export function EmsStatusCard({ emsUnit }: EmsStatusCardProps) {
  const vitals = emsUnit.verifiedVitals;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-5">
      {/* Header: Unit ID, Vehicle Type, Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <Navigation className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">{emsUnit.unitId}</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-semibold border border-blue-800">
                {emsUnit.vehicleType}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transport Status: <span className="text-blue-400 font-medium">{emsUnit.transportStatus}</span>
            </p>
          </div>
        </div>

        {/* ETA & Distance Telemetry Block */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Arrival</div>
            <div className="text-lg font-mono font-extrabold text-red-400 flex items-center justify-end gap-1">
              <Clock className="h-4 w-4 text-red-400" />
              <span>{formatEta(emsUnit.etaMinutes)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Transit Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Gauge className="h-3.5 w-3.5 text-blue-400" /> Transit Speed
          </span>
          <span className="font-mono text-sm font-bold text-slate-200">
            {emsUnit.speedKmH} km/h
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Navigation className="h-3.5 w-3.5 text-emerald-400" /> Distance to Bay
          </span>
          <span className="font-mono text-sm font-bold text-slate-200">
            {emsUnit.distanceRemainingKm} km
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-purple-400" /> Current Vector
          </span>
          <span className="text-slate-300 truncate block font-medium" title={emsUnit.currentLocationName}>
            {emsUnit.currentLocationName}
          </span>
        </div>
      </div>

      {/* Crew Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-1 gap-2">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span>Crew: <strong className="text-slate-300">{emsUnit.crewNames.join(', ')}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-mono text-slate-300">{emsUnit.crewContact}</span>
        </div>
      </div>

      {/* Verified On-Scene Clinical Vitals */}
      {vitals && (
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <span>Verified En-Route Telemetry</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Synced: {vitals.lastUpdated}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Heart Rate */}
            <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2.5 text-center space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Heart className="h-3 w-3 text-red-400" /> Heart Rate
              </span>
              <span className="text-base font-mono font-bold text-red-400">
                {vitals.heartRate ?? '--'} <span className="text-[10px] font-normal text-slate-400">BPM</span>
              </span>
            </div>

            {/* Blood Pressure */}
            <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2.5 text-center space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Activity className="h-3 w-3 text-sky-400" /> Blood Pressure
              </span>
              <span className="text-base font-mono font-bold text-slate-200">
                {vitals.systolicBp}/{vitals.diastolicBp} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
              </span>
            </div>

            {/* SpO2 */}
            <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2.5 text-center space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Wind className="h-3 w-3 text-emerald-400" /> Oxygen (SpO2)
              </span>
              <span className="text-base font-mono font-bold text-emerald-400">
                {vitals.oxygenSaturation ?? '--'}%
              </span>
            </div>

            {/* GCS */}
            <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2.5 text-center space-y-1">
              <span className="text-[11px] text-slate-400">Glasgow Coma (GCS)</span>
              <span className="text-base font-mono font-bold text-slate-200">
                {vitals.gcs ?? '--'}/15
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
