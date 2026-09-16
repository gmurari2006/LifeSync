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
  Activity,
  Building2,
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
        'Transit simulation requires an explicit human-confirmed destination from Step 7 before starting.'
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            TRANSIT RUNNING ({telemetry?.speed_multiplier || speedMultiplier}x)
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Pause className="w-3 h-3" />
            TRANSIT PAUSED
          </span>
        );
      case 'ARRIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            ARRIVED AT HOSPITAL
          </span>
        );
      case 'STOPPED':
      case 'IDLE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/40">
            <Clock className="w-3 h-3" />
            SIMULATION READY
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-card/90 border border-border/80 rounded-xl p-5 shadow-lg backdrop-blur-sm space-y-4 ${className}`}
    >
      {/* Header & Safety Banners */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Navigation className="w-5 h-5 text-sky-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wide uppercase text-foreground">
                Ambulance Telemetry Simulation
              </h3>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-muted-foreground">
              Synthetic route interpolation and dynamic ETA computation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            SIMULATED TELEMETRY
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            DEMO ONLY
          </span>
        </div>
      </div>

      {/* Destination Constraint Warning */}
      {!hasConfirmedDestination && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Awaiting Confirmed Destination</span>
            Ambulance transit simulation requires an explicit human-confirmed destination from Step 7 before starting.
          </div>
        </div>
      )}

      {/* Arrival Notice */}
      {simStatus === 'ARRIVED' && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Ambulance Has Reached Emergency Department</span>
            Simulated transit has completed. Clinical handover is NOT automatically completed — the paramedic team must confirm clinical handover in the EMS portal.
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive-foreground text-xs">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="flex-1">{errorMessage}</p>
        </div>
      )}

      {/* Live Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Dynamic ETA */}
        <div className="p-3 rounded-lg bg-background/60 border border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Simulated ETA</span>
          </div>
          <div className="text-xl font-mono font-bold text-foreground">
            {telemetry ? `${telemetry.eta_minutes.toFixed(1)} min` : '--'}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            {telemetry?.is_arrived ? 'Arrived at destination' : 'Dynamic traffic ETA'}
          </span>
        </div>

        {/* Distance Remaining */}
        <div className="p-3 rounded-lg bg-background/60 border border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Distance Left</span>
          </div>
          <div className="text-xl font-mono font-bold text-foreground">
            {telemetry ? `${telemetry.distance_remaining_km.toFixed(2)} km` : '--'}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            Geodesic waypoint distance
          </span>
        </div>

        {/* Speed */}
        <div className="p-3 rounded-lg bg-background/60 border border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>Speed</span>
          </div>
          <div className="text-xl font-mono font-bold text-foreground">
            {telemetry ? `${telemetry.speed_kmh.toFixed(1)} km/h` : '--'}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            Synthetic velocity profile
          </span>
        </div>

        {/* Destination Facility */}
        <div className="p-3 rounded-lg bg-background/60 border border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target ED</span>
          </div>
          <div
            className="text-xs font-semibold text-foreground truncate"
            title={destinationHospitalName || destinationHospitalId || 'None'}
          >
            {destinationHospitalName || destinationHospitalId || 'Not confirmed'}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono truncate block">
            {destinationHospitalId || 'Awaiting Step 7 selection'}
          </span>
        </div>
      </div>

      {/* Transit Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>Route Progress</span>
          <span className="font-bold text-foreground">
            {telemetry ? `${telemetry.progress_percent.toFixed(1)}%` : '0.0%'}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden border border-border/40 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              simStatus === 'ARRIVED'
                ? 'bg-gradient-to-r from-blue-500 to-emerald-400'
                : 'bg-gradient-to-r from-sky-500 to-indigo-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, telemetry?.progress_percent || 0))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>Incident Location</span>
          <span>Hospital ED Bay</span>
        </div>
      </div>

      {/* Simulation Controls & Speed Multiplier */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
        <div className="flex items-center gap-2 flex-wrap">
          {simStatus !== 'RUNNING' ? (
            <button
              onClick={() => handleControlAction(simStatus === 'PAUSED' ? 'RESUME' : 'START')}
              disabled={isLoading || !hasConfirmedDestination || simStatus === 'ARRIVED'}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {simStatus === 'PAUSED' ? 'Resume Transit' : 'Start Simulation'}
            </button>
          ) : (
            <button
              onClick={() => handleControlAction('PAUSE')}
              disabled={isLoading}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors shadow"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          )}

          <button
            onClick={() => handleStepAction(10.0)}
            disabled={isLoading || !hasConfirmedDestination || simStatus === 'ARRIVED'}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border/60 disabled:opacity-50 transition-colors"
            title="Advance 10 seconds forward in simulation"
          >
            <StepForward className="w-3.5 h-3.5" />
            Step +10s
          </button>

          <button
            onClick={() => handleControlAction('RESET')}
            disabled={isLoading}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-50 transition-colors"
            title="Reset simulation to initial position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Speed Multiplier Toggle */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted-foreground mr-1">Speed:</span>
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
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors ${
                speedMultiplier === multiplier
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
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
