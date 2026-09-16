'use client';

import React, { useState } from 'react';
import { LocationData } from '@/types/citizen';
import { DEFAULT_SIMULATED_LOCATION } from '@/lib/demo/citizen-data';
import { 
  MapPin, 
  Navigation, 
  Edit3, 
  MessageSquare, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface LocationSelectorProps {
  location: LocationData;
  additionalNotes?: string;
  onLocationChange: (loc: LocationData) => void;
  onNotesChange: (notes: string) => void;
}

export function LocationSelector({
  location,
  additionalNotes = '',
  onLocationChange,
  onNotesChange,
}: LocationSelectorProps) {
  const [isManual, setIsManual] = useState(false);
  const [manualAddress, setManualAddress] = useState(location.address);
  const [manualLandmark, setManualLandmark] = useState(location.landmark || '');

  const handleSimulateLocation = () => {
    setIsManual(false);
    onLocationChange(DEFAULT_SIMULATED_LOCATION);
  };

  const handleManualSave = () => {
    onLocationChange({
      address: manualAddress || DEFAULT_SIMULATED_LOCATION.address,
      landmark: manualLandmark || undefined,
      accuracyText: 'Manually Entered',
      isSimulated: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Location Section Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
          <MapPin className="h-6 w-6 text-red-400" />
          <span>Where is the emergency?</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Accurate location enables nearest ambulance routing and hospital catchment matching.
        </p>
      </div>

      {/* Simulated Location Box */}
      <div className="rounded-2xl border border-blue-500/40 bg-slate-900/70 p-4 sm:p-5 space-y-3 shadow-lg shadow-blue-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">
              Location Captured
            </span>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
            {location.accuracyText}
          </span>
        </div>

        {!isManual ? (
          <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-start gap-2.5">
              <Navigation className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white leading-snug">
                  {location.address}
                </p>
                {location.landmark && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Landmark: <span className="text-slate-300">{location.landmark}</span>
                  </p>
                )}
              </div>
            </div>

            {location.coordinates && (
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>GPS Vector: {location.coordinates.latitude.toFixed(4)}° N, {location.coordinates.longitude.toFixed(4)}° E</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Pin Verified
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Street / Area Address:
              </label>
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                onBlur={handleManualSave}
                placeholder="e.g. Sector 48 Market, Sohna Road"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Prominent Landmark:
              </label>
              <input
                type="text"
                value={manualLandmark}
                onChange={(e) => setManualLandmark(e.target.value)}
                onBlur={handleManualSave}
                placeholder="e.g. Near University Main Gate"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Location Toggle Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleSimulateLocation}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Use Simulated Auto-Pin</span>
          </button>

          <button
            type="button"
            onClick={() => setIsManual(!isManual)}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{isManual ? 'Done Editing' : 'Edit Manually'}</span>
          </button>
        </div>
      </div>

      {/* Optional Additional Information */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <label className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-purple-400" />
          <span>Anything else responders should know? (Optional)</span>
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Example: person is trapped in car, bleeding from arm, family member is nearby..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[90px]"
        />
      </div>
    </div>
  );
}
