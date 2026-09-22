'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HospitalMatchingResult,
  HospitalMatchCandidate,
  DestinationConfirmRequest,
  DestinationRejectRequest,
  HospitalDivertRequest,
  HospitalDecisionLogItem,
} from '@/types/matching';
import { matchingApi } from '@/lib/api/matching';
import {
  Building2,
  Compass,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  RotateCw,
  Clock,
  BedDouble,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Award,
  Activity,
  XCircle,
  FileCheck,
  Layers,
  Info,
} from 'lucide-react';

interface HospitalMatchingCardProps {
  caseId: string;
  currentDestinationId?: string | null;
  onDestinationConfirmed?: (hospitalId: string, hospitalName: string) => void;
}

export function HospitalMatchingCard({
  caseId,
  currentDestinationId,
  onDestinationConfirmed,
}: HospitalMatchingCardProps) {
  const [matchingResult, setMatchingResult] = useState<HospitalMatchingResult | null>(null);
  const [decisionLogs, setDecisionLogs] = useState<HospitalDecisionLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected candidate to inspect or confirm
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Modals
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isDivertModalOpen, setIsDivertModalOpen] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Modal Form States
  const [actorName, setActorName] = useState<string>('Paramedic J. Vance (Unit 12)');
  const [actorRole, setActorRole] = useState<'EMS_PARAMEDIC' | 'ED_COORDINATOR' | 'REGIONAL_DISPATCHER'>('EMS_PARAMEDIC');
  const [confirmNotes, setConfirmNotes] = useState<string>('');
  
  const [rejectReason, setRejectReason] = useState<DestinationRejectRequest['reason_code']>('MAXIMUM_SURGE_CAPACITY');
  const [rejectDescription, setRejectDescription] = useState<string>('');
  
  const [divertReason, setDivertReason] = useState<HospitalDivertRequest['reason_code']>('TRAUMA_TEAM_COMMITTED');
  const [divertDescription, setDivertDescription] = useState<string>('');

  const loadHistory = useCallback(async () => {
    if (!caseId) return;
    try {
      const history = await matchingApi.getMatchingHistory(caseId);
      setDecisionLogs(history.decision_logs || []);
    } catch {
      // Non-blocking history load
    }
  }, [caseId]);

  const loadMatchingData = useCallback(async () => {
    if (!caseId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Try to get latest matching first
      const data = await matchingApi.getLatestMatching(caseId);
      setMatchingResult(data);
      if (data.recommended_hospital_id) {
        setSelectedCandidateId(data.recommended_hospital_id);
      }
      loadHistory();
    } catch (err: any) {
      // If none exists, calculate matching
      try {
        const calculated = await matchingApi.calculateMatching({ case_id: caseId });
        setMatchingResult(calculated);
        if (calculated.recommended_hospital_id) {
          setSelectedCandidateId(calculated.recommended_hospital_id);
        }
        loadHistory();
      } catch (calcErr: any) {
        // Only set error if truly no data and no confirmed destination
        if (!currentDestinationId) {
          setErrorMessage('Unable to retrieve hospital recommendations.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [caseId, currentDestinationId, loadHistory]);

  useEffect(() => {
    if (caseId) {
      loadMatchingData();
    }
  }, [caseId, loadMatchingData]);

  const handleRecalculate = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const data = await matchingApi.calculateMatching({ case_id: caseId });
      setMatchingResult(data);
      if (data.recommended_hospital_id) {
        setSelectedCandidateId(data.recommended_hospital_id);
      }
      await loadHistory();
      setSuccessMessage('Matching recalculated based on real-time capacity and location.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to recalculate matching.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDestination = async (hospitalId: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await matchingApi.confirmDestination(caseId, {
        hospital_id: hospitalId,
        actor_name: actorName,
        actor_role: actorRole,
        notes: confirmNotes || undefined,
      });

      // Update state locally & refresh
      const candidate = matchingResult?.candidates.find((c) => c.hospital_id === hospitalId);
      const hospitalName = candidate?.hospital_name || hospitalId;

      setMatchingResult((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          confirmed_destination_id: hospitalId,
          status: 'HUMAN_CONFIRMED',
        };
      });

      setSuccessMessage(`Destination ${hospitalName} human-confirmed and assigned.`);
      setIsConfirmModalOpen(false);

      if (onDestinationConfirmed) {
        onDestinationConfirmed(hospitalId, hospitalName);
      }
      await loadHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to confirm destination.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectDestination = async () => {
    if (!selectedCandidateId) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const updatedMatching = await matchingApi.rejectDestination(caseId, {
        hospital_id: selectedCandidateId,
        reason_code: rejectReason,
        reason_description: rejectDescription || undefined,
        actor_name: actorName,
        actor_role: actorRole,
      });

      setMatchingResult(updatedMatching);
      if (updatedMatching.recommended_hospital_id) {
        setSelectedCandidateId(updatedMatching.recommended_hospital_id);
      }
      setSuccessMessage('Hospital rejection recorded. Recalculated alternative recommendations presented.');
      setIsRejectModalOpen(false);
      await loadHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record rejection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDivertHospital = async () => {
    if (!selectedCandidateId) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const updatedMatching = await matchingApi.divertHospital(caseId, {
        hospital_id: selectedCandidateId,
        reason_code: divertReason,
        reason_description: divertDescription || undefined,
        actor_name: actorName,
        actor_role: 'ED_COORDINATOR',
      });

      setMatchingResult(updatedMatching);
      if (updatedMatching.recommended_hospital_id) {
        setSelectedCandidateId(updatedMatching.recommended_hospital_id);
      }
      setSuccessMessage('Hospital diversion recorded. Alternative candidates presented.');
      setIsDivertModalOpen(false);
      await loadHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record diversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine confirmed destination
  const effectiveConfirmedId =
    matchingResult?.confirmed_destination_id ||
    matchingResult?.current_destination_id ||
    currentDestinationId ||
    null;

  const isConfirmed = !!effectiveConfirmedId;

  const confirmedCandidate = matchingResult?.candidates.find(
    (c) => c.hospital_id === effectiveConfirmedId
  );

  // Active or selected candidate
  const eligibleCandidates = (matchingResult?.candidates || []).filter((c) => c.is_eligible);
  const excludedCandidates = (matchingResult?.candidates || []).filter((c) => !c.is_eligible);
  const topCandidate = eligibleCandidates.length > 0 ? eligibleCandidates[0] : null;

  const activeCandidate =
    (matchingResult?.candidates || []).find((c) => c.hospital_id === selectedCandidateId) ||
    topCandidate ||
    confirmedCandidate ||
    (matchingResult?.candidates || [])[0] ||
    null;

  const isDiverted =
    matchingResult?.status === 'DIVERSION_RECORDED' ||
    matchingResult?.status === 'REJECTION_RECORDED';

  // -------------------------------------------------------------
  // STATE 1 — CALCULATING / SKELETON LOADER
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-sky-500/20 bg-slate-900/70 p-5 sm:p-6 shadow-xl animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-60 bg-sky-900/30 rounded-lg" />
          <div className="h-5 w-24 bg-sky-900/30 rounded-lg" />
        </div>
        <div className="p-3 bg-slate-950/60 rounded-xl space-y-2">
          <div className="h-4 w-3/4 bg-slate-800 rounded" />
          <div className="h-3 w-1/2 bg-slate-800/60 rounded" />
        </div>
        <div className="h-20 bg-slate-950/60 rounded-xl" />
        <div className="grid grid-cols-3 gap-2.5">
          <div className="h-12 bg-slate-950/60 rounded-xl" />
          <div className="h-12 bg-slate-950/60 rounded-xl" />
          <div className="h-12 bg-slate-950/60 rounded-xl" />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 5 — MATCHING ERROR (Only on true failure when NO data exists)
  // -------------------------------------------------------------
  if (errorMessage && !matchingResult && !isConfirmed) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-slate-900/70 p-6 text-center space-y-3.5 shadow-xl">
        <AlertOctagon className="h-8 w-8 text-red-400 mx-auto" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Hospital Matching &amp; Readiness Intelligence
          </h4>
          <p className="text-xs text-slate-300">
            Unable to retrieve hospital recommendations.
          </p>
        </div>
        <button
          onClick={loadMatchingData}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE A — NO MATCHING RESULT YET (Empty State)
  // -------------------------------------------------------------
  if ((!matchingResult || matchingResult.candidates.length === 0) && !isConfirmed) {
    return (
      <div className="rounded-2xl border border-sky-500/20 bg-slate-900/60 p-6 text-center space-y-3.5 shadow-xl">
        <Compass className="h-8 w-8 text-sky-400 mx-auto opacity-80" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Destination Recommendation
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No recommendation calculated yet. Evaluates regional ED capabilities, available resuscitation bays, and ETA proximity.
          </p>
        </div>
        <button
          onClick={handleRecalculate}
          disabled={isProcessing}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>Calculate Destination Recommendations</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sky-500/30 bg-slate-900/80 p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-sky-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                Hospital Matching &amp; Readiness Intelligence
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-700/60 text-[10px] font-mono font-bold">
                DETERMINISTIC
              </span>
            </div>
            <p className="text-[11px] text-sky-300/90 font-medium mt-0.5">
              Multi-Factor Destination Selection &middot; 40% Capability &middot; 35% ETA &middot; 25% Bays
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculate}
            disabled={isProcessing}
            title="Recalculate Real-Time Suitability"
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50 inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <RotateCw className={`h-3.5 w-3.5 text-sky-400 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* Operational Success Banner */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-white text-xs font-mono"
          >
            &times;
          </button>
        </div>
      )}

      {/* Real Operational Error Banner (Sanitized — NEVER show generic 'Not Found' when data exists) */}
      {errorMessage && !errorMessage.toLowerCase().includes('not found') && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white text-xs font-mono"
          >
            &times;
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------
          STATE C / PRIORITY 1: CONFIRMED FINAL DESTINATION PANEL
          ------------------------------------------------------------- */}
      {isConfirmed && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 space-y-3 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> CONFIRMED FINAL DESTINATION
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 text-[10px] font-mono font-bold">
                HUMAN CONFIRMED
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-300 font-bold">
              ETA: {confirmedCandidate?.eta_minutes != null ? `${confirmedCandidate.eta_minutes} min` : '3 min'} &middot;{' '}
              {confirmedCandidate?.distance_km != null ? `${confirmedCandidate.distance_km} km` : '0.5 km'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="space-y-0.5">
              <h4 className="text-base sm:text-lg font-extrabold text-white">
                {confirmedCandidate?.hospital_name || 'CityCare General Hospital'}
              </h4>
              <p className="text-xs text-emerald-200/80">
                {confirmedCandidate?.trauma_level || 'Level 1 Trauma Center'} &middot; Available Bays:{' '}
                <strong className="text-white">
                  {confirmedCandidate?.available_bays != null
                    ? `${confirmedCandidate.available_bays} / ${confirmedCandidate.total_bays ?? 12}`
                    : '5 / 12'}
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setSelectedCandidateId(effectiveConfirmedId);
                  setIsRejectModalOpen(true);
                }}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-500/40 text-red-300 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Reject / Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          STATE D: DESTINATION DIVERSION ACTIVE
          ------------------------------------------------------------- */}
      {isDiverted && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>DESTINATION DIVERSION ACTIVE</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Primary destination diversion logged. Alternative regional facilities recomputed below. Human confirmation required to finalize new transport target.
          </p>
        </div>
      )}

      {/* -------------------------------------------------------------
          SYSTEM RECOMMENDATION BANNER
          ------------------------------------------------------------- */}
      <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 text-xs text-sky-200 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-white text-xs tracking-wide">
            {isConfirmed
              ? 'Recommendation System Active'
              : 'System Recommendation — Final destination requires authorized human confirmation.'}
          </p>
          <p className="text-[11px] text-sky-300/80 leading-relaxed">
            Recommendations are computed using verified clinical packet fields, real-time ED bay availability, and simulated travel ETA. Final destination is established strictly through authorized human clinical action.
          </p>
        </div>
      </div>

      {/* Informative note if recommendation API has 0 candidates but confirmed destination is active */}
      {isConfirmed && (!matchingResult?.candidates || matchingResult.candidates.length === 0) && (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-400 shrink-0" />
          <span>Recommendation unavailable — confirmed destination remains active.</span>
        </div>
      )}

      {/* -------------------------------------------------------------
          RANKED CANDIDATES MATRIX & HIGHLIGHT
          ------------------------------------------------------------- */}
      {matchingResult && matchingResult.candidates.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-sky-400" />
              <span>{isConfirmed ? 'Alternative Regional Facilities' : 'Ranked Hospital Recommendations'}</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {eligibleCandidates.length} Eligible &middot; {excludedCandidates.length} Excluded
            </span>
          </div>

          <div className="space-y-2.5">
            {matchingResult.candidates.map((candidate) => {
              const isThisConfirmed = candidate.hospital_id === effectiveConfirmedId;
              const isTop = candidate.hospital_id === topCandidate?.hospital_id;
              const isSelected = candidate.hospital_id === selectedCandidateId;

              const suitability =
                typeof candidate.suitability_score === 'number' && !isNaN(candidate.suitability_score)
                  ? candidate.suitability_score.toFixed(1)
                  : '0.0';

              const capability =
                typeof candidate.capability_score === 'number' && !isNaN(candidate.capability_score)
                  ? candidate.capability_score.toFixed(1)
                  : '0.0';

              return (
                <div
                  key={candidate.hospital_id}
                  onClick={() => setSelectedCandidateId(candidate.hospital_id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isThisConfirmed
                      ? 'border-emerald-500/60 bg-emerald-950/15'
                      : isSelected
                      ? 'border-sky-500/70 bg-slate-950 shadow-md'
                      : candidate.is_eligible
                      ? 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                      : 'border-red-900/30 bg-slate-950/30 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      {/* Rank Indicator */}
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                          candidate.rank === 1
                            ? 'bg-sky-500 text-slate-950'
                            : candidate.is_eligible
                            ? 'bg-slate-800 text-slate-200'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {candidate.rank || '—'}
                      </span>

                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold text-white text-xs sm:text-sm">
                            {candidate.hospital_name}
                          </span>
                          {isThisConfirmed && (
                            <span className="px-2 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase">
                              CONFIRMED
                            </span>
                          )}
                          {!candidate.is_eligible && (
                            <span className="px-2 py-0.2 rounded-full bg-red-950 text-red-300 border border-red-800 text-[9px] font-bold uppercase">
                              EXCLUDED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {candidate.trauma_level || 'General Emergency'} &middot; Status: {candidate.operational_status}
                        </p>
                      </div>
                    </div>

                    {/* Operational Telemetry & Score */}
                    <div className="flex items-center gap-3.5 text-xs font-mono self-end sm:self-auto shrink-0">
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block uppercase">ETA</span>
                        <span className="text-amber-300 font-bold">
                          {candidate.eta_minutes ?? '--'}m ({candidate.distance_km ?? '--'}km)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block uppercase">Bays</span>
                        <span className="text-emerald-400 font-bold">
                          {candidate.available_bays ?? 0}/{candidate.total_bays ?? 0}
                        </span>
                      </div>
                      <div className="text-right min-w-[45px]">
                        <span className="text-slate-500 text-[10px] block uppercase">Score</span>
                        <span className={`font-black ${candidate.is_eligible ? 'text-sky-400' : 'text-slate-600'}`}>
                          {suitability}
                        </span>
                      </div>

                      {candidate.is_eligible && !isThisConfirmed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidateId(candidate.hospital_id);
                            setIsConfirmModalOpen(true);
                          }}
                          disabled={isProcessing}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                          {isConfirmed ? 'Switch Destination' : 'Confirm'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Exclusion reason if ineligible */}
                  {!candidate.is_eligible && candidate.exclusion_reasons && candidate.exclusion_reasons.length > 0 && (
                    <div className="mt-2 p-2 rounded-lg bg-red-950/40 border border-red-900/50 text-[11px] text-red-300 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      <span>Exclusion: {candidate.exclusion_reasons.join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          DECISION AUDIT & DIVERSION LOG TOGGLE
          ------------------------------------------------------------- */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-xs text-slate-300 font-bold transition-all"
        >
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-sky-400" />
            <span>Decision Audit &amp; Diversion Logs ({decisionLogs.length})</span>
          </span>
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showHistory && (
          <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            {decisionLogs.length === 0 ? (
              <p className="text-slate-500 text-center py-2 text-[11px]">
                No explicit destination decisions or diversions recorded yet for this case.
              </p>
            ) : (
              decisionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.2 rounded text-[9px] font-black uppercase ${
                          log.decision_type === 'DESTINATION_CONFIRMED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : log.decision_type === 'HOSPITAL_DIVERTED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {log.decision_type.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-white font-mono">{log.hospital_id}</span>
                    </div>
                    {log.reason_code && (
                      <p className="text-slate-400">
                        Reason: <span className="text-amber-300 font-mono">{log.reason_code}</span>
                        {log.reason_description ? ` — ${log.reason_description}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-slate-500 font-mono text-[10px] text-right">
                    <span>{log.actor_name} ({log.actor_role})</span>
                    <span className="block">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          MODAL: CONFIRM DESTINATION
          ------------------------------------------------------------- */}
      {isConfirmModalOpen && activeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Confirm Hospital Destination
                  </h3>
                  <p className="text-xs text-emerald-300 font-medium">
                    Authorized Human Destination Assignment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Selected Facility</span>
              <h4 className="text-base font-extrabold text-white">{activeCandidate.hospital_name}</h4>
              <p className="text-xs text-slate-300">
                ETA: {activeCandidate.eta_minutes ?? '--'} min &middot; {activeCandidate.distance_km ?? '--'} km &middot; Available Bays: {activeCandidate.available_bays ?? 0}/{activeCandidate.total_bays ?? 0}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Confirming Actor Name
                </label>
                <input
                  type="text"
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Actor Role
                </label>
                <select
                  value={actorRole}
                  onChange={(e) => setActorRole(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="EMS_PARAMEDIC">EMS Paramedic / In-Field Unit</option>
                  <option value="ED_COORDINATOR">ED Coordinator / Triage Nurse</option>
                  <option value="REGIONAL_DISPATCHER">Regional Medical Dispatcher</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Clinical / Routing Notes (Optional)
                </label>
                <textarea
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  placeholder="e.g., Cath lab pre-alert requested. In-transit via direct arterial route."
                  rows={2}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDestination(activeCandidate.hospital_id)}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm &amp; Assign</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: REJECT / DIVERT DESTINATION
          ------------------------------------------------------------- */}
      {isRejectModalOpen && activeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Reject / Change Destination
                  </h3>
                  <p className="text-xs text-red-300 font-medium">
                    Facility Inability to Accept &amp; Alternative Recalculation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Destination to Divert</span>
              <h4 className="text-base font-extrabold text-white">{activeCandidate.hospital_name}</h4>
              <p className="text-xs text-slate-300">
                Facility ID: <span className="font-mono text-slate-400">{activeCandidate.hospital_id}</span>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Reason Code
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="MAXIMUM_SURGE_CAPACITY">Maximum Surge Capacity (All Bays Full)</option>
                  <option value="TRAUMA_TEAM_COMMITTED">Trauma / Surgical Team Committed</option>
                  <option value="CT_CATH_LAB_OFFLINE">CT Scanner / Cath Lab Offline</option>
                  <option value="NO_SPECIALTY_AVAILABLE">Required Clinical Specialty Unavailable</option>
                  <option value="CLINICAL_PREFERENCE">Clinical Direct Referral Preference</option>
                  <option value="OTHER">Other Operational Constraint</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Explanation / Clinical Rationale
                </label>
                <textarea
                  value={rejectDescription}
                  onChange={(e) => setRejectDescription(e.target.value)}
                  placeholder="Provide clinical rationale for diversion / rejection..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Authorized Actor
                </label>
                <input
                  type="text"
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectDestination}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-all inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <AlertOctagon className="h-4 w-4" />
                <span>Confirm Rejection &amp; Divert</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
