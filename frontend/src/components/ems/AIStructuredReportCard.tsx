'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AIStructuredEmergencyInfo } from '@/types/ai';
import { aiApi } from '@/lib/api/ai';
import { 
  Sparkles, 
  BrainCircuit, 
  AlertTriangle, 
  HelpCircle, 
  RotateCw, 
  ShieldAlert, 
  Tag, 
  FileText,
  Clock,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface AIStructuredReportCardProps {
  caseId: string;
  initialReport?: AIStructuredEmergencyInfo | null;
}

export function AIStructuredReportCard({
  caseId,
  initialReport,
}: AIStructuredReportCardProps) {
  const [report, setReport] = useState<AIStructuredEmergencyInfo | null>(initialReport || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Authoritative GET request on mount / caseId change — NEVER auto-generates on load
  const fetchReport = useCallback(async () => {
    if (!caseId) return;
    setIsLoading(true);
    setErrorState(null);
    try {
      const data = await aiApi.getLatestReport(caseId);
      setReport(data);
    } catch (err: any) {
      // 404 or missing report is a normal empty state, NOT a system failure
      if (err?.status === 404 || err?.message?.toLowerCase()?.includes('not found')) {
        setReport(null);
        setErrorState(null);
      } else {
        setErrorState('Unable to load AI structured report.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    if (!initialReport && caseId) {
      fetchReport();
    } else if (initialReport) {
      setReport(initialReport);
    }
  }, [caseId, initialReport, fetchReport]);

  // Explicit user-triggered POST generation
  const handleGenerate = async (isRerun: boolean = false) => {
    setIsGenerating(true);
    setErrorState(null);
    try {
      const res = await aiApi.structureCase(caseId, { force_reprocess: isRerun });
      if (res.ai_structured_info) {
        setReport(res.ai_structured_info);
      } else {
        // Refresh via GET
        const fresh = await aiApi.getLatestReport(caseId);
        setReport(fresh);
      }
    } catch (err: any) {
      setErrorState('AI structuring unavailable. Failed to generate structuring.');
    } finally {
      setIsGenerating(false);
    }
  };

  // State: Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-purple-200 bg-white p-5 sm:p-6 shadow-xs animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-56 bg-purple-100 rounded-lg" />
          <div className="h-5 w-24 bg-purple-100 rounded-lg" />
        </div>
        <div className="h-14 bg-slate-100 rounded-xl" />
        <div className="h-20 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  // State: Error
  if (errorState && !report) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-5 text-center space-y-3 shadow-xs">
        <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            AI Structuring Layer
          </h4>
          <p className="text-xs text-slate-600">{errorState}</p>
        </div>
        <button
          onClick={() => fetchReport()}
          disabled={isLoading || isGenerating}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // State: Empty State (No report generated yet)
  if (!report) {
    return (
      <div className="rounded-2xl border border-purple-200 bg-purple-50/30 p-6 text-center space-y-3.5 shadow-xs">
        <BrainCircuit className="h-8 w-8 text-purple-600 mx-auto" />
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              AI Structuring Layer
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
              NOT GENERATED
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            No AI structured representation has been generated for this case yet. Click below to initiate assistive information extraction.
          </p>
        </div>
        <button
          onClick={() => handleGenerate(false)}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <RotateCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating AI Structuring...' : 'Generate AI Structuring'}</span>
        </button>
      </div>
    );
  }

  // State: Existing AI Report Available
  const confidencePercent = Math.round((report.confidence_score ?? 0.85) * 100);

  return (
    <div className="rounded-2xl border border-purple-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs relative overflow-hidden">
      {/* 1. Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                AI-Structured Emergency Representation
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-mono font-bold">
                AI_STRUCTURED
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium">
                Existing report available
              </span>
            </div>
            <p className="text-[11px] text-purple-800 font-medium mt-0.5">
              Information Structuring &amp; Summarization &middot; {report.model_name || 'lifesync-nlp-local-v1'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Fidelity Chip */}
          <div className="px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-right shadow-xs">
            <div className="text-[9px] text-purple-700 uppercase font-mono tracking-wider font-semibold">Fidelity</div>
            <div className="text-xs font-bold text-purple-900 font-mono">{confidencePercent}%</div>
          </div>

          {/* Explicit Re-run button */}
          <button
            onClick={() => handleGenerate(true)}
            disabled={isGenerating}
            title="Re-run information structuring with AI model"
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all disabled:opacity-50 inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-xs"
          >
            <RotateCw className={`h-3.5 w-3.5 text-purple-700 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Re-running...' : 'Re-run Structuring'}</span>
          </button>
        </div>
      </div>

      {/* 2. Clinical Safety Boundary Callout */}
      <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-xs text-slate-700 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-purple-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-purple-900 uppercase tracking-wider text-[10px] block">
            Clinical Safety Boundary
          </span>
          <p className="text-slate-600 text-xs leading-relaxed">
            AI-assisted summary of bystander observations. <strong className="text-slate-900">Not a clinical diagnosis, triage determinant, or treatment order.</strong>
          </p>
        </div>
      </div>

      {/* 3. Synthesized Objective Summary */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-purple-700" /> Synthesized Objective Summary
          </span>
          {report.incident_category && (
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-mono font-bold">
              {report.incident_category}
            </span>
          )}
        </div>
        <p className="text-slate-900 text-xs font-normal leading-relaxed">
          {report.incident_summary || 'No objective summary extracted.'}
        </p>
      </div>

      {/* 4. Observations Tiles Grid */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Observations
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Responsiveness</span>
            <p className="font-bold text-slate-900 text-xs">{report.consciousness || 'Unknown / Not Observed'}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Breathing State</span>
            <p className="font-bold text-slate-900 text-xs">{report.breathing || 'Unknown / Not Observed'}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">People Count</span>
            <p className="font-bold text-slate-900 text-xs">
              {report.people_count ?? 1} Individual{(report.people_count ?? 1) > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Extracted Observational Keywords */}
      {report.extracted_keywords && report.extracted_keywords.length > 0 && (
        <div className="space-y-1.5">
          <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-purple-700" /> Extracted Observational Keywords
          </span>
          <div className="flex flex-wrap gap-1.5">
            {report.extracted_keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-purple-50 text-purple-800 border border-purple-200"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 6. Pending Verification Parameters (EMS Action Required) */}
      {report.missing_information && report.missing_information.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5 text-xs">
          <span className="font-bold text-amber-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-amber-600" /> Pending Verification &middot; EMS Action Required
          </span>
          <ul className="space-y-1 pl-4 list-disc text-amber-900 text-xs">
            {report.missing_information.map((item, idx) => (
              <li key={idx} className="leading-snug">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Ambiguity & Uncertainty Flags (if present) */}
      {report.uncertainty_flags && report.uncertainty_flags.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1 text-xs">
          <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-amber-600" /> Ambiguity &amp; Uncertainty Flags
          </span>
          <ul className="space-y-0.5 pl-4 list-disc text-amber-900 text-xs">
            {report.uncertainty_flags.map((flag, idx) => (
              <li key={idx} className="leading-snug">{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 7. Model Metadata Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
        <span>Engine: {report.model_name || 'lifesync-nlp-local-v1'}</span>
        <span>Prompt: {report.prompt_version || 'v1.2'} &middot; Status: {(report.status || 'COMPLETED').toUpperCase()}</span>
      </div>
    </div>
  );
}
