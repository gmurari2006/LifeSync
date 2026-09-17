'use client';

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (caseId) {
      loadMatchingData();
    }
  }, [caseId]);

  const loadMatchingData = async () => {
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
        setErrorMessage('Unable to calculate hospital matching recommendations.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const history = await matchingApi.getMatchingHistory(caseId);
      setDecisionLogs(history.decision_logs || []);
    } catch (err) {
      // Non-blocking
    }
  };

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

      const candidate = matchingResult?.candidates.find((c) => c.hospital_id === hospitalId);
      setSuccessMessage(`Destination confirmed: ${candidate?.hospital_name || hospitalId}`);
      setIsConfirmModalOpen(false);

      if (onDestinationConfirmed && candidate) {
        onDestinationConfirmed(candidate.hospital_id, candidate.hospital_name);
      }

      await loadMatchingData();
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
      setSuccessMessage('Hospital rejection logged. Alternative candidates calculated.');
      setIsRejectModalOpen(false);
      await loadHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to log rejection.');
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
        actor_role: actorRole as any,
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

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-sky-500/30 bg-slate-900/70 p-6 shadow-xl animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-52 bg-sky-900/40 rounded-lg" />
          <div className="h-5 w-24 bg-sky-900/40 rounded-lg" />
        </div>
        <div className="h-20 bg-slate-950/60 rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-slate-950/60 rounded-xl" />
          <div className="h-16 bg-slate-950/60 rounded-xl" />
          <div className="h-16 bg-slate-950/60 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!matchingResult || matchingResult.candidates.length === 0) {
    return (
      <div className="rounded-3xl border border-sky-500/20 bg-slate-900/50 p-6 text-center space-y-3 shadow-lg">
        <Compass className="h-8 w-8 text-sky-400 mx-auto opacity-70 animate-spin" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Hospital Matching & Readiness Intelligence
          </h4>
          <p className="text-xs text-slate-400">
            {errorMessage || 'Evaluating nearby hospital capabilities, emergency bay capacity, and ETA proximity.'}
          </p>
        </div>
        <button
          onClick={handleRecalculate}
          disabled={isProcessing}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all inline-flex items-center gap-2"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>Calculate Destination Recommendations</span>
        </button>
      </div>
    );
  }

  const eligibleCandidates = matchingResult.candidates.filter((c) => c.is_eligible);
  const excludedCandidates = matchingResult.candidates.filter((c) => !c.is_eligible);

  // Top recommended candidate
  const topCandidate = eligibleCandidates.length > 0 ? eligibleCandidates[0] : null;

  // Selected candidate object
  const activeCandidate =
    matchingResult.candidates.find((c) => c.hospital_id === selectedCandidateId) ||
    topCandidate ||
    matchingResult.candidates[0];

  const isConfirmed = !!matchingResult.confirmed_destination_id;
  const confirmedHospital = matchingResult.candidates.find(
    (c) => c.hospital_id === matchingResult.confirmed_destination_id
  );

  return (
    <div className="rounded-3xl border border-sky-500/30 bg-slate-900/80 p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-sky-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-wider uppercase">
                Hospital Matching & Readiness Intelligence
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-700/60 text-[10px] font-mono font-bold">
                DETERMINISTIC
              </span>
            </div>
            <p className="text-[11px] text-sky-300 font-medium">
              Multi-Factor Destination Selection &middot; Capacity, Capability & Proximity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculate}
            disabled={isProcessing}
            title="Recalculate Real-Time Suitability"
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin text-sky-400' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* Mandatory Recommendation Safety Banner */}
      <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/40 text-xs text-sky-200 flex items-start gap-3 shadow-inner">
        <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-extrabold text-white text-xs tracking-wide">
            {matchingResult.recommendation_label}
          </p>
          <p className="text-[11px] text-sky-300/90 leading-relaxed">
            Recommendations are computed using verified structured case fields, real-time hospital bay capacity, and simulated travel ETA. Destination is finalized only upon explicit authorized action.
          </p>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white text-xs font-mono">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white text-xs font-mono">
            &times;
          </button>
        </div>
      )}

      {/* Confirmed Destination Banner (if confirmed) */}
      {isConfirmed && confirmedHospital && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Confirmed Final Destination
            </span>
            <span className="text-[11px] font-mono text-emerald-300 font-semibold">
              ETA: {confirmedHospital.eta_minutes} min &middot; {confirmedHospital.distance_km} km
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-extrabold text-white">{confirmedHospital.hospital_name}</h4>
              <p className="text-xs text-emerald-300/80">
                {confirmedHospital.trauma_level || 'General Hospital'} &middot; Available Bays: {confirmedHospital.available_bays}/{confirmedHospital.total_bays}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCandidateId(confirmedHospital.hospital_id);
                setIsRejectModalOpen(true);
              }}
              className="px-3 py-1 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-300 text-xs font-bold transition-all"
            >
              Reject / Change
            </button>
          </div>
        </div>
      )}

      {/* Top Recommendation Highlight Hero */}
      {topCandidate && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            selectedCandidateId === topCandidate.hospital_id
              ? 'border-sky-400 bg-slate-950/90 shadow-lg ring-1 ring-sky-500/30'
              : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-black flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-sky-400" /> Rank #1 Recommendation
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] font-bold">
                  {topCandidate.trauma_level || 'General Emergency'}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white">
                {topCandidate.hospital_name}
              </h4>
            </div>

            {/* Suitability Score Metric */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Suitability Score</span>
              <div className="text-xl font-black text-sky-400 font-mono">
                {topCandidate.suitability_score != null
                  ? topCandidate.suitability_score.toFixed(1)
                  : '0.0'} <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </div>
            </div>
          </div>

          {/* Metric Sub-scores (PRD 40/35/25 Formula Breakdown) */}
          <div className="grid grid-cols-3 gap-2.5 py-3 border-b border-slate-800/80 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Capability Match (40%)</span>
              <div className="font-mono font-black text-white text-xs sm:text-sm">
                {topCandidate.capability_score != null
                  ? topCandidate.capability_score.toFixed(1)
                  : '0.0'} / 100
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-400" /> ETA Proximity (35%)
              </span>
              <div className="font-mono font-black text-amber-300 text-xs sm:text-sm">
                {topCandidate.eta_minutes} min ({topCandidate.distance_km} km)
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <BedDouble className="h-3 w-3 text-emerald-400" /> Bay Capacity (25%)
              </span>
              <div className="font-mono font-black text-emerald-300 text-xs sm:text-sm">
                {topCandidate.available_bays} / {topCandidate.total_bays} Available
              </div>
            </div>
          </div>

          {/* Capabilities Badges */}
          <div className="pt-2.5 space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Verified Staged Capabilities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {topCandidate.capabilities.map((cap, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-700/80 text-[11px] font-medium"
                >
                  {cap.name}
                </span>
              ))}
            </div>
          </div>

          {/* Standardized Explanation */}
          <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs text-slate-300 space-y-1">
            <span className="text-[10px] text-sky-400 uppercase font-mono font-bold flex items-center gap-1">
              <Info className="h-3 w-3" /> System Explanation
            </span>
            <p className="leading-relaxed font-mono text-[11px] text-slate-200">
              {topCandidate.explanation}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedCandidateId(topCandidate.hospital_id);
                  setIsConfirmModalOpen(true);
                }}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-950/40 transition-all inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm Destination</span>
              </button>
              <button
                onClick={() => {
                  setSelectedCandidateId(topCandidate.hospital_id);
                  setIsRejectModalOpen(true);
                }}
                disabled={isProcessing}
                className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-bold transition-all inline-flex items-center gap-1.5"
              >
                <XCircle className="h-4 w-4 text-red-400" />
                <span>Reject</span>
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedCandidateId(topCandidate.hospital_id);
                setIsDivertModalOpen(true);
              }}
              disabled={isProcessing}
              className="px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Record Diversion</span>
            </button>
          </div>
        </div>
      )}

      {/* Candidate Comparison Matrix */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-sky-400" /> Candidate Comparison Matrix ({matchingResult.candidates.length} Evaluated)
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {eligibleCandidates.length} Eligible &middot; {excludedCandidates.length} Excluded
          </span>
        </div>

        <div className="space-y-2">
          {matchingResult.candidates.map((candidate, idx) => {
            const isTop = candidate.hospital_id === topCandidate?.hospital_id;
            const isConfirmedThis = candidate.hospital_id === matchingResult.confirmed_destination_id;
            const isSelected = candidate.hospital_id === selectedCandidateId;

            return (
              <div
                key={candidate.hospital_id}
                onClick={() => setSelectedCandidateId(candidate.hospital_id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isConfirmedThis
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : isSelected
                    ? 'border-sky-500/80 bg-slate-950 shadow-md'
                    : candidate.is_eligible
                    ? 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    : 'border-red-900/40 bg-slate-950/30 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Rank Badge */}
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black font-mono shrink-0 ${
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
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-xs sm:text-sm">
                          {candidate.hospital_name}
                        </span>
                        {isConfirmedThis && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase">
                            CONFIRMED
                          </span>
                        )}
                        {!candidate.is_eligible && (
                          <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[9px] font-bold uppercase">
                            EXCLUDED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {candidate.trauma_level || 'General Hospital'} &middot; Status: {candidate.operational_status}
                      </p>
                    </div>
                  </div>

                  {/* Operational Telemetry & Score */}
                  <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-auto font-mono">
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block uppercase">ETA</span>
                      <span className="text-amber-300 font-bold">{candidate.eta_minutes}m ({candidate.distance_km}km)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block uppercase">Bays</span>
                      <span className="text-emerald-400 font-bold">{candidate.available_bays}/{candidate.total_bays}</span>
                    </div>
                    <div className="text-right min-w-[50px]">
                      <span className="text-slate-500 text-[10px] block uppercase">Score</span>
                      <span className={`font-black ${candidate.is_eligible ? 'text-sky-400' : 'text-slate-600'}`}>
                        {candidate.is_eligible && candidate.suitability_score != null
                          ? candidate.suitability_score.toFixed(1)
                          : '0.0'}
                      </span>
                    </div>

                    {candidate.is_eligible && !isConfirmedThis && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidateId(candidate.hospital_id);
                          setIsConfirmModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-[11px] font-bold transition-all"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>

                {/* Exclusions Reason Banner if Ineligible */}
                {!candidate.is_eligible && candidate.exclusion_reasons.length > 0 && (
                  <div className="mt-2 p-2 rounded-xl bg-red-950/40 border border-red-900/50 text-[11px] text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    <span>Exclusion Reason: {candidate.exclusion_reasons.join(', ')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Audit & Diversion History Toggle */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-xs text-slate-300 font-bold transition-all"
        >
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-sky-400" />
            <span>Decision Audit & Diversion Logs ({decisionLogs.length})</span>
          </span>
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showHistory && (
          <div className="mt-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            {decisionLogs.length === 0 ? (
              <p className="text-slate-500 text-center py-2 text-[11px]">
                No explicit destination decisions or diversions recorded yet for this case.
              </p>
            ) : (
              decisionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
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

      {/* Confirmation Modal */}
      {isConfirmModalOpen && activeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
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

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Selected Facility</span>
              <h4 className="text-base font-extrabold text-white">{activeCandidate.hospital_name}</h4>
              <p className="text-xs text-slate-300">
                ETA: {activeCandidate.eta_minutes} min &middot; {activeCandidate.distance_km} km &middot; Available Bays: {activeCandidate.available_bays}/{activeCandidate.total_bays}
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
                  placeholder="e.g., Cath lab pre-alert requested. In-transit via Hwy 101."
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
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950/50 transition-all inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm & Assign</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && activeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-red-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Reject Hospital Destination
                  </h3>
                  <p className="text-xs text-red-300 font-medium">
                    Facility Inability to Accept & Alternative Recalculation
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

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Facility to Reject</span>
              <h4 className="text-base font-extrabold text-white">{activeCandidate.hospital_name}</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Structured Rejection Reason Code
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="MAXIMUM_SURGE_CAPACITY">Maximum ED Surge Capacity / Zero Bays</option>
                  <option value="NO_SPECIALTY_AVAILABLE">Required Clinical Specialty Offline</option>
                  <option value="CT_CATH_LAB_OFFLINE">CT Scanner / Cath Lab Offline</option>
                  <option value="TRAUMA_TEAM_COMMITTED">Trauma / Surgical Team Committed</option>
                  <option value="CLINICAL_PREFERENCE">Field Clinical Discretion</option>
                  <option value="OTHER">Other Operational Constraint</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Reason Details (Optional)
                </label>
                <textarea
                  value={rejectDescription}
                  onChange={(e) => setRejectDescription(e.target.value)}
                  placeholder="e.g., Trauma bay 1 occupied with mass casualty triage."
                  rows={2}
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
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-950/50 transition-all inline-flex items-center gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                <span>Record Rejection & Find Alternatives</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Divert Modal */}
      {isDivertModalOpen && activeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Request Hospital Diversion
                  </h3>
                  <p className="text-xs text-amber-300 font-medium">
                    ED Diversion Status Request & Route Alternative
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDivertModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Hospital Under Diversion</span>
              <h4 className="text-base font-extrabold text-white">{activeCandidate.hospital_name}</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Diversion Reason Code
                </label>
                <select
                  value={divertReason}
                  onChange={(e) => setDivertReason(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="TRAUMA_TEAM_COMMITTED">Trauma / Surgical Team Committed</option>
                  <option value="ED_GRIDLOCK">ED Physical Gridlock / No Resuscitation Bays</option>
                  <option value="CT_CATH_LAB_OFFLINE">Diagnostic Equipment Offline</option>
                  <option value="MAXIMUM_SURGE_CAPACITY">Disaster / Red Surge Protocol</option>
                  <option value="OTHER">Other Operational Diversion</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Operational Notes (Optional)
                </label>
                <textarea
                  value={divertDescription}
                  onChange={(e) => setDivertDescription(e.target.value)}
                  placeholder="e.g., Code Red gridlock in trauma resus."
                  rows={2}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsDivertModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDivertHospital}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg shadow-amber-950/50 transition-all inline-flex items-center gap-1.5"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Declare Diversion & Re-Route</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
