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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl border border-red-500/40 bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reject / Divert Case</h3>
              <p className="text-xs text-red-300">Mandatory Reason Logging & Secondary Hospital Re-route</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3.5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs text-red-200 space-y-1">
            <p className="font-semibold uppercase tracking-wider">Hospital Rejection Protocol</p>
            <p className="text-red-300/90 leading-relaxed">
              Diverting case <strong className="font-mono text-white">{caseId}</strong> ({incidentType}) will immediately log a decision audit payload and trigger LifeSync to calculate a secondary receiving facility for the responding ambulance.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Select Mandatory Reason Code:
            </label>
            <div className="space-y-2">
              {DIVERT_REASON_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === opt.id
                      ? 'border-red-500 bg-red-950/30 text-white font-medium'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="divertReason"
                    value={opt.id}
                    checked={selectedReason === opt.id}
                    onChange={() => setSelectedReason(opt.id)}
                    className="mt-0.5 accent-red-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Detailed Justification / Clinical Audit Notes:
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. Both resuscitation bays occupied with active trauma resuscitations. CT scanner scheduled for emergency calibration."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[70px]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium">{error}</p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50 transition-all"
            >
              Confirm Case Diversion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
