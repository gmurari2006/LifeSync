'use client';

import React, { useState } from 'react';
import { DIVERT_REASON_OPTIONS } from '@/lib/demo/hospital-data';
import { AlertOctagon, X, AlertTriangle } from 'lucide-react';

interface DivertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasonId: string, notes: string) => void;
  caseId: string;
  incidentType: string;
}

export function DivertModal({
  isOpen,
  onClose,
  onConfirm,
  caseId,
  incidentType,
}: DivertModalProps) {
  const [selectedReason, setSelectedReason] = useState(DIVERT_REASON_OPTIONS[0].id);
  const [justification, setJustification] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('Please select a mandatory operational reason for diversion.');
      return;
    }
    if (selectedReason === 'OTHER' && !justification.trim()) {
      setError('A written operational explanation is required when selecting "Other".');
      return;
    }
    onConfirm(selectedReason, justification);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl space-y-5 text-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reject / Divert Case</h3>
              <p className="text-xs text-rose-700 font-medium">Mandatory Reason Logging & Secondary Hospital Re-route</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 space-y-1">
            <p className="font-semibold uppercase tracking-wider text-rose-800">Hospital Rejection Protocol</p>
            <p className="text-rose-800/90 leading-relaxed">
              Diverting case <strong className="font-mono text-slate-900">{caseId}</strong> ({incidentType}) will immediately log a decision audit payload and trigger LifeSync to calculate a secondary receiving facility for the responding ambulance.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Select Mandatory Reason Code:
            </label>
            <div className="space-y-2">
              {DIVERT_REASON_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === opt.id
                      ? 'border-rose-500 bg-rose-50/60 text-slate-900 font-semibold shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="divertReason"
                    value={opt.id}
                    checked={selectedReason === opt.id}
                    onChange={() => setSelectedReason(opt.id)}
                    className="mt-0.5 accent-rose-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 block">
              Detailed Justification / Clinical Audit Notes:
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. Both resuscitation bays occupied with active trauma resuscitations. CT scanner scheduled for emergency calibration."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 min-h-[70px]"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all"
            >
              Confirm Case Diversion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
