'use client';

import React, { useState, useEffect } from 'react';
import { AIStructuredEmergencyInfo } from '@/types/ai';
import { aiApi } from '@/lib/api/ai';
import { 
  Sparkles, 
  BrainCircuit, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  RotateCw, 
  ShieldAlert, 
  Tag, 
  FileText, 
  Layers
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
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialReport && caseId) {
      fetchReport();
    }
  }, [caseId, initialReport]);

  const fetchReport = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await aiApi.getLatestReport(caseId);
      setReport(data);
    } catch (err: any) {
      // If 404, trigger initial structuring
      try {
        const generated = await aiApi.structureCase(caseId);
        if (generated.ai_structured_info) {
          setReport(generated.ai_structured_info);
        }
      } catch (innerErr: any) {
        setErrorMessage('AI structuring not yet generated for this case.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReprocess = async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const res = await aiApi.structureCase(caseId, { force_reprocess: true });
      if (res.ai_structured_info) {
        setReport(res.ai_structured_info);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reprocess AI structuring.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-purple-500/30 bg-slate-900/70 p-6 shadow-lg animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-purple-900/40 rounded-lg" />
          <div className="h-5 w-24 bg-purple-900/40 rounded-lg" />
        </div>
        <div className="h-16 bg-slate-950/60 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 bg-slate-950/60 rounded-xl" />
          <div className="h-12 bg-slate-950/60 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-3xl border border-purple-500/20 bg-slate-900/50 p-5 text-center space-y-3 shadow-lg">
        <BrainCircuit className="h-8 w-8 text-purple-400 mx-auto opacity-60" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Structuring Layer</h4>
          <p className="text-xs text-slate-400">{errorMessage || 'AI structuring report not yet loaded.'}</p>
        </div>
        <button
          onClick={fetchReport}
          disabled={isLoading}
          className="px-4 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-bold border border-purple-700/50 transition-all inline-flex items-center gap-1.5"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Generate AI Structuring</span>
        </button>
      </div>
    );
  }

  const confidencePercent = Math.round(report.confidence_score * 100);

  return (
    <div className="rounded-3xl border border-purple-500/30 bg-slate-900/80 p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                AI-Structured Emergency Representation
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/60 text-[10px] font-mono font-bold">
                {report.source}
              </span>
            </div>
            <p className="text-[11px] text-purple-300 font-medium">
              Information Structuring & Summarization &middot; {report.model_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-purple-500/30 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Fidelity</div>
            <div className="text-xs font-black text-purple-300 font-mono">{confidencePercent}%</div>
          </div>
          <button
            onClick={handleReprocess}
            disabled={isRefreshing}
            title="Re-extract with AI model"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Safety Notice Callout */}
      <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>Clinical Safety Boundary:</strong> AI-assisted summary of bystander observations. <span className="text-purple-300 font-medium">Not a clinical diagnosis, triage determinant, or treatment order.</span>
        </span>
      </div>

      {/* Main Structured Summary */}
      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-purple-400" /> Synthesized Objective Summary
          </span>
          <span className="text-[10px] text-purple-400 font-mono font-semibold">
            {report.incident_category}
          </span>
        </div>
        <p className="text-white text-xs font-medium leading-relaxed">
          {report.incident_summary}
        </p>
      </div>

      {/* Key Normalized Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-0.5">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Responsiveness</span>
          <p className="font-bold text-white text-xs">{report.consciousness}</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-0.5">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Breathing State</span>
          <p className="font-bold text-white text-xs">{report.breathing}</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-0.5">
          <span className="text-slate-400 text-[10px] uppercase font-bold">People Count</span>
          <p className="font-bold text-white text-xs">{report.people_count} Individual{report.people_count > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Extracted Observational Keywords */}
      {report.extracted_keywords && report.extracted_keywords.length > 0 && (
        <div className="space-y-1.5">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-indigo-400" /> Extracted Observational Keywords
          </span>
          <div className="flex flex-wrap gap-1.5">
            {report.extracted_keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium bg-indigo-950/50 text-indigo-300 border border-indigo-800/50"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Uncertainty Flags */}
      {report.uncertainty_flags && report.uncertainty_flags.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-1.5 text-xs">
          <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Ambiguity & Uncertainty Flags
          </span>
          <ul className="space-y-1 pl-4 list-disc text-amber-200/90 text-xs">
            {report.uncertainty_flags.map((flag, idx) => (
              <li key={idx} className="leading-snug">{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Information Items */}
      {report.missing_information && report.missing_information.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-sky-400" /> Pending Verification Parameters (EMS Action Required)
          </span>
          <ul className="space-y-1 pl-4 list-disc text-slate-300 text-xs">
            {report.missing_information.map((item, idx) => (
              <li key={idx} className="leading-snug">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Model Metadata Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
        <span>Engine: {report.model_name} (v{report.model_version})</span>
        <span>Prompt: {report.prompt_version} &middot; Status: {report.status}</span>
      </div>
    </div>
  );
}
