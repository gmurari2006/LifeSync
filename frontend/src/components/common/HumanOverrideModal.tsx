'use client';

import React, { useState } from 'react';
import {
  OverrideParameter,
  OverrideActorRole,
  REASON_CODES_BY_PARAMETER,
} from '@/types/override';
import { submitHumanOverride } from '@/lib/api/overrides';

interface HumanOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  currentPriority?: string;
  currentDestinationId?: string;
  currentAmbulanceClass?: string;
  defaultParameter?: OverrideParameter;
  onOverrideSuccess?: () => void;
  userRole?: OverrideActorRole;
  userName?: string;
  userId?: string;
  hospitals?: Array<{ id: string; name: string }>;
}

export const HumanOverrideModal: React.FC<HumanOverrideModalProps> = ({
  isOpen,
  onClose,
  caseId,
  currentPriority = 'HIGH',
  currentDestinationId = '',
  currentAmbulanceClass = 'ALS',
  defaultParameter = 'OPERATIONAL_PRIORITY',
  onOverrideSuccess,
  userRole = 'EMS_PARAMEDIC',
  userName = 'Paramedic Lead Alpha',
  userId = 'EMS-ALPHA-01',
  hospitals = [],
}) => {
  const [parameter, setParameter] = useState<OverrideParameter>(defaultParameter);
  const [newValue, setNewValue] = useState<string>('');
  const [reasonCode, setReasonCode] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const reasonOptions = REASON_CODES_BY_PARAMETER[parameter] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newValue.trim()) {
      setError('Please specify the new override value.');
      return;
    }
    if (!reasonCode) {
      setError('Please select a standardized reason code.');
      return;
    }
    if (!justification.trim() || justification.trim().length < 5) {
      setError('Please provide a meaningful justification (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await submitHumanOverride(
        caseId,
        {
          parameter_overridden: parameter,
          new_value: newValue.trim(),
          reason_code: reasonCode,
          free_text_justification: justification.trim(),
        },
        {
          actorRole: userRole,
          actorId: userId,
          actorName: userName,
        }
      );

      if (onOverrideSuccess) {
        onOverrideSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit human override.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Human Operational Override
              </h3>
              <p className="text-xs text-amber-300/80">
                Case {caseId} • Role Authorized: {userRole} ({userName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-start gap-2">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Audit Notice */}
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-300 flex items-start gap-2">
            <span className="text-amber-400 font-bold">PROVENANCE & AUDIT:</span>
            <span>
              All field overrides are logged to an immutable timeline with server-verified credentials. System recommendations will be updated immediately.
            </span>
          </div>

          {/* Parameter Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Parameter to Override
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setParameter('OPERATIONAL_PRIORITY');
                  setNewValue('');
                  setReasonCode('');
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                  parameter === 'OPERATIONAL_PRIORITY'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Priority / Acuity
              </button>
              <button
                type="button"
                onClick={() => {
                  setParameter('DESTINATION_HOSPITAL');
                  setNewValue('');
                  setReasonCode('');
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                  parameter === 'DESTINATION_HOSPITAL'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Destination Hospital
              </button>
              <button
                type="button"
                onClick={() => {
                  setParameter('AMBULANCE_CLASS');
                  setNewValue('');
                  setReasonCode('');
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                  parameter === 'AMBULANCE_CLASS'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Ambulance Class
              </button>
            </div>
          </div>

          {/* New Value Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              New Override Value
            </label>
            {parameter === 'OPERATIONAL_PRIORITY' && (
              <div className="grid grid-cols-4 gap-2">
                {['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setNewValue(lvl)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      newValue === lvl
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}

            {parameter === 'DESTINATION_HOSPITAL' && (
              <div>
                {hospitals.length > 0 ? (
                  <select
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select Target Destination Facility...</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter Hospital ID or Name (e.g. HOSP-CITYCARE-01)"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>
            )}

            {parameter === 'AMBULANCE_CLASS' && (
              <div className="grid grid-cols-3 gap-2">
                {['ALS', 'BLS', 'CRITICAL_CARE'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setNewValue(cls)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      newValue === cls
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reason Code Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Standardized Reason Code <span className="text-rose-400">*</span>
            </label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Select Reason Code...</option>
              {reasonOptions.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label} ({opt.code})
                </option>
              ))}
            </select>
          </div>

          {/* Free Text Clinical Justification */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Clinical & Operational Justification <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Detail the clinical assessment findings, resource constraints, or emergency operational rationale requiring this override..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Recording Override...</span>
                </>
              ) : (
                <span>Confirm & Record Override</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
