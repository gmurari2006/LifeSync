'use client';

import React, { useState } from 'react';
import { updateHospitalSettings } from '@/lib/api/hospitals';

interface HospitalSettingsCardProps {
  hospitalId: string;
  initialOperationalStatus?: string;
  initialDiversionActive?: boolean;
  initialSurgeLevel?: string;
  onSettingsUpdated?: () => void;
}

export const HospitalSettingsCard: React.FC<HospitalSettingsCardProps> = ({
  hospitalId,
  initialOperationalStatus = 'Normal',
  initialDiversionActive = false,
  initialSurgeLevel = 'Normal',
  onSettingsUpdated,
}) => {
  const [operationalStatus, setOperationalStatus] = useState<string>(initialOperationalStatus);
  const [diversionActive, setDiversionActive] = useState<boolean>(initialDiversionActive);
  const [surgeLevel, setSurgeLevel] = useState<string>(initialSurgeLevel);
  const [diversionReason, setDiversionReason] = useState<string>('MAXIMUM_SURGE_CAPACITY');
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateHospitalSettings(hospitalId, {
        operational_status: operationalStatus,
        diversion_active: diversionActive,
        active_surge_level: surgeLevel,
        diversion_reason: diversionActive ? diversionReason : undefined,
      });
      setMessage({ text: 'Hospital operational configuration updated successfully.', isError: false });
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
    } catch (err: any) {
      setMessage({ text: err?.message || 'Failed to update settings.', isError: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Facility Capacity & Diversion Settings</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure live operational thresholds, ED divert status, and regional surge levels for {hospitalId}.
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            diversionActive
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {diversionActive ? 'DIVERT ACTIVE' : 'RECEIVING PATIENTS'}
        </span>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-sm border flex items-center gap-2 ${
            message.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{message.isError ? '⚠️' : '✓'}</span>
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Operational Status */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Operational Status
          </label>
          <select
            value={operationalStatus}
            onChange={(e) => setOperationalStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="Normal">Normal Operations</option>
            <option value="Degraded">Degraded Service</option>
            <option value="Critical">Critical Strain</option>
            <option value="Offline">Offline / Closed</option>
          </select>
        </div>

        {/* Surge Level */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Active Surge Level
          </label>
          <select
            value={surgeLevel}
            onChange={(e) => setSurgeLevel(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="Normal">Normal (Code Green)</option>
            <option value="Low">Low Surge (Code Yellow)</option>
            <option value="Moderate">Moderate Surge (Code Orange)</option>
            <option value="High">High Surge (Code Red)</option>
            <option value="Critical">Critical Surge (Disaster Protocol)</option>
          </select>
        </div>

        {/* Diversion Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Emergency Diversion
          </label>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              type="button"
              onClick={() => setDiversionActive(!diversionActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                diversionActive ? 'bg-rose-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                  diversionActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-xs font-bold text-slate-700">
              {diversionActive ? 'Diversion Requested' : 'Accepting Inbound'}
            </span>
          </div>
        </div>
      </div>

      {diversionActive && (
        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-rose-900">
            Mandatory Diversion Reason Code
          </label>
          <select
            value={diversionReason}
            onChange={(e) => setDiversionReason(e.target.value)}
            className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
          >
            <option value="MAXIMUM_SURGE_CAPACITY">MAXIMUM_SURGE_CAPACITY — Full Bed Occupancy</option>
            <option value="CT_CATH_LAB_OFFLINE">CT_CATH_LAB_OFFLINE — Emergency Equipment Failure</option>
            <option value="TRAUMA_TEAM_COMMITTED">TRAUMA_TEAM_COMMITTED — Resuscitation Team Engaged</option>
            <option value="NO_SPECIALTY_AVAILABLE">NO_SPECIALTY_AVAILABLE — Specialty Unavailable</option>
            <option value="OTHER">OTHER — Operational Emergency</option>
          </select>
          <p className="text-xs text-rose-800">
            Note: System hospital matching will deprioritize or divert cases from this facility while diversion is active.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? 'Saving Configuration...' : 'Apply Operational Settings'}
        </button>
      </div>
    </div>
  );
};
