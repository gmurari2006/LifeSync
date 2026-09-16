'use client';

import React, { useState } from 'react';
import { PriorityBadge } from '@/components/hospital/PriorityBadge';
import { OperationalPriority } from '@/types/hospital';
import { CheckCircle2, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface AcknowledgementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  caseId: string;
  incidentType: string;
  priority: OperationalPriority;
  onDutyUser: string;
}

export function AcknowledgementModal({
  isOpen,
  onClose,
  onConfirm,
  caseId,
  incidentType,
  priority,
  onDutyUser,
}: AcknowledgementModalProps) {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Acknowledge Inbound Case</h3>
              <p className="text-xs text-slate-400">Confirm emergency department pre-arrival preparation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Case Info Preview Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-400">{caseId}</span>
            <PriorityBadge priority={priority} size="sm" />
          </div>
          <p className="text-sm font-semibold text-slate-200">{incidentType}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Acknowledging Coordinator: <strong className="text-slate-200">{onDutyUser}</strong></span>
          </div>
        </div>

        {/* Confirmation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Operational Readiness Notes (Optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Resuscitation Bay 1 prepared. Cath lab team notified and on standby."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
            />
          </div>

          <div className="rounded-lg bg-blue-950/30 border border-blue-900/40 p-3 text-[11px] text-blue-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Acknowledging alerts the EMS unit that the hospital is actively staging bays and awaiting inbound stretcher handover.
            </span>
          </div>

          {/* Action Buttons */}
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition-all"
            >
              Confirm Acknowledgement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
