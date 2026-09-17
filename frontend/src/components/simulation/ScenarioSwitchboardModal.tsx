'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Truck,
  Building2,
  Baby,
  Brain,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react';
import { scenariosApi, ScenarioMetadata, ScenarioResetResult } from '@/lib/api/scenarios';

interface ScenarioSwitchboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioLoaded?: (caseId: string) => void;
}

export const ScenarioSwitchboardModal: React.FC<ScenarioSwitchboardModalProps> = ({
  isOpen,
  onClose,
  onScenarioLoaded,
}) => {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ScenarioMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingScenarioId, setLoadingScenarioId] = useState<string | null>(null);
  const [activeLoadedCaseId, setActiveLoadedCaseId] = useState<string | null>(null);
  const [resetting, setResetting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchScenarios();
    }
  }, [isOpen]);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const data = await scenariosApi.listScenarios();
      setScenarios(data);
    } catch (err: any) {
      setStatusMessage({ text: `Failed to load scenario metadata: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadScenario = async (scenarioId: string) => {
    try {
      setLoadingScenarioId(scenarioId);
      setStatusMessage({ text: `Initializing ${scenarioId} in isolated state...`, type: 'info' });
      const loadedCase: any = await scenariosApi.loadScenario(scenarioId);
      const caseIdentifier = loadedCase.id || loadedCase.case_id || scenarioId;
      const targetHospital = loadedCase.destinationHospitalId || loadedCase.destination_hospital_id || 'Hospital';
      setActiveLoadedCaseId(caseIdentifier);
      setStatusMessage({
        text: `Scenario ${scenarioId} successfully loaded! Pre-arrival alert active for ${targetHospital}.`,
        type: 'success',
      });
      if (onScenarioLoaded) {
        onScenarioLoaded(caseIdentifier);
      }
    } catch (err: any) {
      setStatusMessage({ text: `Failed to load scenario: ${err.message}`, type: 'error' });
    } finally {
      setLoadingScenarioId(null);
    }
  };

  const handleResetScenarios = async () => {
    if (!confirm('Reset all synthetic scenario data? This will clear ONLY LS-SCENARIO-* records and preserve baseline data.')) {
      return;
    }
    try {
      setResetting(true);
      const res: ScenarioResetResult = await scenariosApi.resetScenarios();
      setActiveLoadedCaseId(null);
      setStatusMessage({
        text: `Reset Complete: ${res.details.cases} scenario cases purged. Baseline data preserved.`,
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({ text: `Reset failed: ${err.message}`, type: 'error' });
    } finally {
      setResetting(false);
    }
  };

  if (!isOpen) return null;

  const getDomainIcon = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'cardiology':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'trauma surgery':
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      case 'neurology':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'pediatrics':
        return <Baby className="w-5 h-5 text-cyan-500" />;
      default:
        return <Activity className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                LifeSync Scenario Switchboard
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  5 PRD Canonical Scenarios
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                1-Click demonstration runner with isolated state management (LS-SCENARIO-*)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetScenarios}
              disabled={resetting}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
              title="Reset ONLY LS-SCENARIO-* records"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset Scenarios'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-red-950/60 border-red-800/60 text-red-300'
                : 'bg-blue-950/60 border-blue-800/60 text-blue-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <Activity className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            {activeLoadedCaseId && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    onClose();
                    router.push(`/hospital/cases/${activeLoadedCaseId}`);
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition flex items-center space-x-1"
                >
                  <span>Open in Hospital Portal</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 space-x-3">
              <Activity className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Loading canonical PRD scenarios...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((scenario) => {
                const isLoaded = activeLoadedCaseId === scenario.id;
                const isLoadingThis = loadingScenarioId === scenario.id;

                return (
                  <div
                    key={scenario.id}
                    className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                      isLoaded
                        ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                        : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/70'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-700/80">
                            {getDomainIcon(scenario.clinical_domain)}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Scenario #{scenario.scenario_number} • {scenario.clinical_domain}
                            </span>
                            <h3 className="text-sm font-bold text-white leading-tight">
                              {scenario.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {scenario.red_rule_id && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60">
                              {scenario.red_rule_id}
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                            {scenario.acuity_priority}
                          </span>
                        </div>
                      </div>

                      {/* Patient Description */}
                      <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                        {scenario.patient_description}
                      </p>

                      {/* Routing Details Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-400">
                        <div className="flex items-center space-x-1.5 bg-slate-900/40 px-2 py-1.5 rounded border border-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">{scenario.target_hospital_name}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-slate-900/40 px-2 py-1.5 rounded border border-slate-800">
                          <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{scenario.assigned_unit_id} ({scenario.assigned_unit_type.split(' ')[0]})</span>
                        </div>
                      </div>

                      {/* Talking Points */}
                      <div className="mt-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Demo Highlights:
                        </span>
                        <ul className="mt-1 space-y-1">
                          {scenario.demo_talking_points.slice(0, 3).map((tp, idx) => (
                            <li key={idx} className="text-[11px] text-slate-400 flex items-start space-x-1.5">
                              <span className="text-indigo-400 font-bold shrink-0">•</span>
                              <span className="line-clamp-1">{tp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {isLoaded ? (
                          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Active in State</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            ID: {scenario.id}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLoadScenario(scenario.id)}
                          disabled={isLoadingThis}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            isLoaded
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          } disabled:opacity-50`}
                        >
                          {isLoadingThis ? (
                            <>
                              <Activity className="w-3.5 h-3.5 animate-spin" />
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{isLoaded ? 'Reload Case' : 'Load Scenario'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>REST/DB Authoritative</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>WebSockets Delivery-Only</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Human Override Ready</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
