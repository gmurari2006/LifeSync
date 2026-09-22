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
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
          <MapPin className="h-6 w-6 text-red-600" />
          <span>Where is the person located?</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Location coordinates direct the responding ambulance and compute nearest capable hospital matching.
        </p>
      </div>

      {/* Simulated Location Box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
            <Navigation className="h-4 w-4 animate-pulse" />
            <span>Simulated GPS Auto-Pin</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
            {location.accuracyText || 'High Accuracy'}
          </span>
        </div>

        {!isManual ? (
          <div className="space-y-2">
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-900 block">
                {location.address}
              </span>
              {location.landmark && (
                <span className="text-xs text-slate-500 block">
                  Landmark: {location.landmark}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSimulateLocation}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Refresh Simulated GPS Pin
              </button>
              <button
                type="button"
                onClick={() => setIsManual(true)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Adjust Address Manually</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address / Cross Street:
              </label>
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="e.g. Sector 48, Golf Course Extension Rd"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Landmark / Floor / Apartment (Optional):
              </label>
              <input
                type="text"
                value={manualLandmark}
                onChange={(e) => setManualLandmark(e.target.value)}
                placeholder="e.g. Near Metro Pillar 142, Gate 2"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleManualSave}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Update Pin
              </button>
              <button
                type="button"
                onClick={() => setIsManual(false)}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Additional Notes Area */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          <span>Additional scene observations (Optional):</span>
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="e.g. Patient is conscious and sitting upright. Bystanders applying direct pressure to left arm."
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
