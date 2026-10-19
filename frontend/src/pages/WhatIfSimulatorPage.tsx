import React, { useState, useEffect, useMemo } from 'react';
import {
  Sliders,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  Loader2
} from 'lucide-react';
import { SimulationResponse, VesselDelta } from '../types';
import { api } from '../services/api';

interface WhatIfSimulatorPageProps {
  patientFeatures: Record<string, any> | null;
  onApplyIntervention?: (newFeatures: Record<string, any>) => void;
  onNavigateTo3D?: () => void;
}

export const WhatIfSimulatorPage: React.FC<WhatIfSimulatorPageProps> = ({
  patientFeatures
}) => {
  // If no patient features loaded, use a baseline high-risk profile
  const baseline = useMemo(() => patientFeatures || {
    Age: 64, Sex: 'Male', Weight: 86, Length: 172, BMI: 29.07,
    DM: 'Y', HTN: 'Y', Current_Smoker: 'Y', Ex_Smoker: 'N', FH: 'Y', Obesity: 'Y',
    CRF: 'N', CVA: 'N', Airway_disease: 'N', Thyroid_Disease: 'N', CHF: 'N', DLP: 'Y',
    BP: 155, PR: 84, Edema: 'N', Weak_Peripheral_Pulse: 'N', Lung_Rales: 'N',
    Systolic_Murmur: 'N', Diastolic_Murmur: 'N',
    Typical_Chest_Pain: 'Y', Atypical_Chest_Pain: 'N', Nonanginal_Chest_Pain: 'N',
    Exertional_CP: 'Y', LowTH_Angina: 'Y',
    Q_Wave: '1', St_Elevation: '0', St_Depression: '1', Tinversion: '1', LVH: 'Y', Poor_R_Progression: 'N',
    FBS: 168.0, CR: 1.25, TG: 240.0, LDL: 165.0, HDL: 34.0, BUN: 24.0, ESR: 28.0,
    HB: 14.5, K: 4.3, Na: 139.0, WBC: 8800.0, Lymph: 24.0, Neut: 72.0, PLT: 260.0,
    EF_TTE: 40.0, Region_RWMA: '2', VHD: 'mild'
  }, [patientFeatures]);

  const [simFeatures, setSimFeatures] = useState<Record<string, any>>({ ...baseline });
  const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Update simFeatures if baseline changes
  useEffect(() => {
    setSimFeatures({ ...baseline });
  }, [baseline]);

  // Run simulation whenever simFeatures change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.simulate(baseline, simFeatures);
        setSimulationResult(res);
      } catch (err: any) {
        setError(err.message || 'Simulation execution failed.');
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [simFeatures, baseline]);

  const handleSliderChange = (field: string, val: any) => {
    setSimFeatures((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'Weight' && updated.Length) {
        const w = parseFloat(val);
        const l_m = parseFloat(updated.Length) / 100.0;
        if (w > 0 && l_m > 0) {
          updated.BMI = (w / (l_m * l_m)).toFixed(2);
        }
      }
      return updated;
    });
  };

  const resetToBaseline = () => {
    setSimFeatures({ ...baseline });
  };

  const applyOptimalTarget = () => {
    setSimFeatures((prev) => ({
      ...prev,
      BP: 120,
      Current_Smoker: 'N',
      LDL: 70,
      FBS: 95,
      Weight: Math.round(23.5 * Math.pow(parseFloat(prev.Length || 170) / 100.0, 2)),
      BMI: 23.5
    }));
  };

  const renderDeltaCard = (delta: VesselDelta, isPrimary: boolean = false) => {
    const isReduction = delta.absolute_delta_pct < 0;
    const isSignificant = Math.abs(delta.absolute_delta_pct) >= 1.0;

    return (
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isPrimary
            ? 'bg-slate-900 text-white border-slate-800 shadow-md col-span-1 md:col-span-2 lg:col-span-1'
            : 'bg-white text-slate-900 border-slate-200 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isPrimary ? 'text-teal-400' : 'text-teal-700'}`}>
            {delta.target} Stenosis
          </span>
          {isSignificant && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                isReduction
                  ? isPrimary ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isPrimary ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isReduction ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              <span>{Math.abs(delta.absolute_delta_pct)}% {isReduction ? 'Reduction' : 'Increase'}</span>
            </span>
          )}
        </div>

        <h4 className={`text-base font-extrabold mt-1 truncate ${isPrimary ? 'text-white' : 'text-slate-900'}`}>
          {delta.vessel_name}
        </h4>

        {/* Comparison Numbers */}
        <div className="mt-4 flex items-baseline justify-between pt-3 border-t border-slate-100/20">
          <div>
            <div className={`text-[10px] uppercase font-semibold ${isPrimary ? 'text-slate-400' : 'text-slate-400'}`}>
              Baseline
            </div>
            <div className={`text-xl font-bold line-through ${isPrimary ? 'text-slate-400' : 'text-slate-400'}`}>
              {delta.baseline_pct}%
            </div>
          </div>

          <ArrowRight className={`w-4 h-4 ${isPrimary ? 'text-slate-500' : 'text-slate-300'}`} />

          <div className="text-right">
            <div className={`text-[10px] uppercase font-semibold ${isPrimary ? 'text-teal-400' : 'text-teal-700'}`}>
              Simulated Post-Rx
            </div>
            <div className={`text-2xl font-black ${isReduction ? (isPrimary ? 'text-emerald-400' : 'text-emerald-600') : (isPrimary ? 'text-white' : 'text-slate-900')}`}>
              {delta.simulated_pct}%
            </div>
          </div>
        </div>

        {/* Progress Comparison */}
        <div className="mt-3 w-full bg-slate-200/40 rounded-full h-2 overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 ${isReduction ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${Math.min(100, delta.simulated_pct)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Counterfactual Intervention Modeling</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            "What-If" Preventative Intervention Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Simulate the therapeutic impact of blood pressure control, smoking cessation, statin therapy, and metabolic normalization on coronary artery stenosis risk.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={applyOptimalTarget}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simulate Optimal Goals</span>
          </button>

          <button
            onClick={resetToBaseline}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Simulator Controls & Live Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Modifiable Biomarker Sliders (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Modifiable Clinical Risk Factors</span>
            </h3>
            {isLoading && (
              <span className="text-[11px] text-teal-600 flex items-center space-x-1 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Recalculating...</span>
              </span>
            )}
          </div>

          <div className="space-y-6">
            {/* 1. Systolic Blood Pressure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Systolic Blood Pressure (BP)</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 font-mono">
                  {simFeatures.BP} mmHg
                </span>
              </div>
              <input
                type="range"
                min="90"
                max="200"
                step="1"
                value={simFeatures.BP || 135}
                onChange={(e) => handleSliderChange('BP', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>90 (Optimal)</span>
                <span>Baseline: {baseline.BP} mmHg</span>
                <span>200 (Severe HTN)</span>
              </div>
            </div>

            {/* 2. LDL Cholesterol (Statin Therapy) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>LDL Cholesterol (Statin / PCSK9-i Target)</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 font-mono">
                  {simFeatures.LDL} mg/dL
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="240"
                step="1"
                value={simFeatures.LDL || 120}
                onChange={(e) => handleSliderChange('LDL', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>40 (Intensive Statin)</span>
                <span>Baseline: {baseline.LDL} mg/dL</span>
                <span>240 (Extreme)</span>
              </div>
            </div>

            {/* 3. Tobacco Smoking Cessation */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-900">Current Tobacco Consumption</div>
                <div className="text-[11px] text-slate-500">Immediate endothelial & platelet benefits upon cessation</div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleSliderChange('Current_Smoker', 'N')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    simFeatures.Current_Smoker === 'N'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Non-Smoker (Cessation)
                </button>
                <button
                  type="button"
                  onClick={() => handleSliderChange('Current_Smoker', 'Y')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    simFeatures.Current_Smoker === 'Y'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Active Smoker
                </button>
              </div>
            </div>

            {/* 4. Fasting Blood Sugar (FBS) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Fasting Blood Glucose (FBS)</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 font-mono">
                  {simFeatures.FBS} mg/dL
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="280"
                step="1"
                value={simFeatures.FBS || 110}
                onChange={(e) => handleSliderChange('FBS', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>70 (Normal)</span>
                <span>Baseline: {baseline.FBS} mg/dL</span>
                <span>280 (Poor Control)</span>
              </div>
            </div>

            {/* 5. Weight & BMI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Body Weight (BMI: {simFeatures.BMI} kg/m²)</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 font-mono">
                  {simFeatures.Weight} kg
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="130"
                step="0.5"
                value={simFeatures.Weight || 75}
                onChange={(e) => handleSliderChange('Weight', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>50 kg</span>
                <span>Baseline: {baseline.Weight} kg</span>
                <span>130 kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Simulated Risk Reduction Deltas (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-base font-bold text-slate-900">
              Projected Risk Reductions
            </h3>
            <span className="text-xs text-slate-400 font-medium">Model Sensitivity Delta</span>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900">
              {error}
            </div>
          )}

          {simulationResult && (
            <div className="space-y-4">
              {/* Overall CAD Delta */}
              {renderDeltaCard(simulationResult.cad, true)}

              {/* LAD Delta */}
              {renderDeltaCard(simulationResult.lad)}

              {/* LCX Delta */}
              {renderDeltaCard(simulationResult.lcx)}

              {/* RCA Delta */}
              {renderDeltaCard(simulationResult.rca)}
            </div>
          )}

          {/* Biological Mechanism Guidance Box */}
          {simulationResult && simulationResult.clinical_guidance.length > 0 && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-teal-600" />
                <span>Biological Mechanism & Preventive Guidance:</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px] leading-relaxed">
                {simulationResult.clinical_guidance.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
