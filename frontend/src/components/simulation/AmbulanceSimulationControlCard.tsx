'use client';

import React, { useState } from 'react';
import {
  AmbulanceTelemetryState,
  SimulationControlAction,
  SimulationStatus,
} from '@/types/realtime';
import { simulationApi } from '@/lib/api/simulation';
import {
  Navigation,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Clock,
  MapPin,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Radio,
} from 'lucide-react';

interface AmbulanceSimulationControlCardProps {
  caseId: string;
  hasConfirmedDestination: boolean;
  destinationHospitalName?: string | null;
  destinationHospitalId?: string | null;
  liveTelemetry?: AmbulanceTelemetryState | null;
  onTelemetryUpdate?: (telemetry: AmbulanceTelemetryState) => void;
  className?: string;
}

export const AmbulanceSimulationControlCard: React.FC<
  AmbulanceSimulationControlCardProps
> = ({
  caseId,
  hasConfirmedDestination,
  destinationHospitalName,
  destinationHospitalId,
  liveTelemetry,
  onTelemetryUpdate,
  className = '',
}) => {
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(2.0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const telemetry = liveTelemetry;
  const simStatus: SimulationStatus = telemetry?.status || 'IDLE';

  const handleControlAction = async (action: SimulationControlAction) => {
    if (!hasConfirmedDestination && action === 'START') {
      setErrorMessage(
        'Transit simulation requires an explicit human-confirmed destination before starting.'
      );
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const updated = await simulationApi.controlSimulation(
        caseId,
        action,
        speedMultiplier
      );
      if (onTelemetryUpdate) {
        onTelemetryUpdate(updated);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to execute simulation control action.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepAction = async (seconds: number = 10.0) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const updated = await simulationApi.stepSimulation(caseId, seconds);
      if (onTelemetryUpdate) {
        onTelemetryUpdate(updated);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to advance simulation step.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (simStatus) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            TRANSIT RUNNING ({telemetry?.speed_multiplier ?? speedMultiplier}x)
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Pause className="w-3 h-3 text-amber-600" />
            TRANSIT PAUSED
          </span>
        );
      case 'ARRIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            ARRIVED AT ED
          </span>
        );
      case 'STOPPED':
      case 'IDLE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            SIMULATION READY
          </span>
        );
    }
  };

  // Safe numerical metric formatters
  const etaText =
    typeof telemetry?.eta_minutes === 'number' && !isNaN(telemetry.eta_minutes)
      ? `${telemetry.eta_minutes.toFixed(1)} min`
      : '--';

  const distanceText =
    typeof telemetry?.distance_remaining_km === 'number' &&
    !isNaN(telemetry.distance_remaining_km)
      ? `${telemetry.distance_remaining_km.toFixed(2)} km`
      : '--';

  const speedText =
    typeof telemetry?.speed_kmh === 'number' && !isNaN(telemetry.speed_kmh)
      ? `${telemetry.speed_kmh.toFixed(1)} km/h`
      : '--';

  const progressPercent =
    typeof telemetry?.progress_percent === 'number' && !isNaN(telemetry.progress_percent)
      ? Math.min(100, Math.max(0, telemetry.progress_percent))
      : 0;

  const transportStatusLabel = telemetry?.is_arrived
    ? 'ARRIVED AT ED'
    : simStatus === 'RUNNING'
    ? 'TRANSPORTING'
    : simStatus === 'PAUSED'
    ? 'PAUSED'
    : 'STANDBY';

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm text-slate-900 ${className}`}
    >
      {/* 1. Header & Provenance Warning */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shrink-0">
            <Navigation className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-wide uppercase text-slate-900">
                Ambulance Telemetry
              </h3>
              {getStatusBadge()}
            </div>
            <p className="text-[11px] text-slate-500">
              Synthetic route interpolation and dynamic ETA computation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
            SIMULATED TELEMETRY
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
            DEMO ONLY
          </span>
        </div>
      </div>

      {/* Destination Warning */}
      {!hasConfirmedDestination && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950">Awaiting Confirmed Destination</span>
            Ambulance transit simulation requires an explicit human-confirmed destination before starting.
          </div>
        </div>
      )}

      {/* Arrival Notice */}
      {simStatus === 'ARRIVED' && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-blue-950">Ambulance Has Reached Emergency Department</span>
            Simulated transit complete. Clinical handover is NOT automatically completed — paramedic team must confirm clinical handover.
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="flex-1">{errorMessage}</p>
        </div>
      )}

      {/* 2. Compact Telemetry Dashboard Strip */}
      {!telemetry ? (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-mono">
          Awaiting telemetry...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          {/* ETA */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-600" /> ETA
            </span>
            <div className="text-base font-bold text-slate-900 tracking-tight">{etaText}</div>
            <span className="text-[9px] text-slate-500 block truncate">
              {telemetry.is_arrived ? 'At Destination' : 'Dynamic traffic ETA'}
            </span>
          </div>

          {/* Distance */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" /> Distance
            </span>
            <div className="text-base font-bold text-slate-900 tracking-tight">{distanceText}</div>
            <span className="text-[9px] text-slate-500 block truncate">Geodesic waypoint</span>
          </div>

          {/* Speed */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <Gauge className="w-3 h-3 text-amber-600" /> Speed
            </span>
            <div className="text-base font-bold text-slate-900 tracking-tight">{speedText}</div>
            <span className="text-[9px] text-slate-500 block truncate">Velocity Profile</span>
          </div>

          {/* Transport Status & Destination */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-600" /> Status
            </span>
            <div className="text-xs font-bold text-blue-700 truncate">{transportStatusLabel}</div>
            <span className="text-[9px] text-slate-600 block truncate" title={destinationHospitalName || 'Not confirmed'}>
              {destinationHospitalName || destinationHospitalId || 'Awaiting selection'}
            </span>
          </div>
        </div>
      )}

      {/* 3. Transit Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs font-mono text-slate-500">
          <span className="text-[10px] uppercase font-bold">Transit Route Progress</span>
          <span className="font-bold text-slate-900">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              simStatus === 'ARRIVED'
                ? 'bg-emerald-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>Incident Location</span>
          <span>Hospital ED Bay</span>
        </div>
      </div>

      {/* 4. Simulation Controls & Speed Multipliers */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          {simStatus !== 'RUNNING' ? (
            <button
              onClick={() => handleControlAction(simStatus === 'PAUSED' ? 'RESUME' : 'START')}
              disabled={isLoading || !hasConfirmedDestination || simStatus === 'ARRIVED'}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{simStatus === 'PAUSED' ? 'Resume' : 'Start Simulation'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleControlAction('PAUSE')}
              disabled={isLoading}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={() => handleStepAction(10.0)}
            disabled={isLoading || !hasConfirmedDestination || simStatus === 'ARRIVED'}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 disabled:opacity-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            title="Advance 10 seconds forward in simulation"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step +10s</span>
          </button>

          <button
            onClick={() => handleControlAction('RESET')}
            disabled={isLoading}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 disabled:opacity-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            title="Reset simulation to initial position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed Multipliers */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 mr-1 text-[11px]">Speed:</span>
          {[1.0, 2.0, 5.0, 10.0].map((multiplier) => (
            <button
              key={multiplier}
              onClick={() => {
                setSpeedMultiplier(multiplier);
                if (simStatus === 'RUNNING') {
                  simulationApi.controlSimulation(caseId, 'START', multiplier);
                }
              }}
              type="button"
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                speedMultiplier === multiplier
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {multiplier}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
