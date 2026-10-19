import React from 'react';
import {
  Heart,
  Activity,
  ShieldCheck,
  FileText,
  RotateCcw,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Sliders
} from 'lucide-react';
import { PredictionResponse } from '../types';

interface MainResultsDashboardProps {
  prediction: PredictionResponse;
  onNavigate: (page: string) => void;
  onSelectArtery: (artery: 'LAD' | 'LCX' | 'RCA') => void;
  onOpenReportModal: () => void;
}

export const MainResultsDashboard: React.FC<MainResultsDashboardProps> = ({
  prediction,
  onNavigate,
  onSelectArtery,
  onOpenReportModal
}) => {
  const getRiskColor = (pct: number) => {
    if (pct >= 65) return { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-200', border: 'border-rose-200', bar: 'bg-rose-500' };
    if (pct >= 35) return { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', border: 'border-amber-200', bar: 'bg-amber-500' };
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', border: 'border-emerald-200', bar: 'bg-emerald-500' };
  };

  const cadColor = getRiskColor(prediction.cad.percentage);
  const ladColor = getRiskColor(prediction.lad.percentage);
  const lcxColor = getRiskColor(prediction.lcx.percentage);
  const rcaColor = getRiskColor(prediction.rca.percentage);

  const handleArteryClick = (artery: 'LAD' | 'LCX' | 'RCA') => {
    onSelectArtery(artery);
    onNavigate('3d-heart');
  };

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto">
      {/* Top Banner: Timestamp & Quality Summary */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Analysis Outcome • Ref #{prediction.prediction_id}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Cardiovascular Risk & Stenosis Profile
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{prediction.timestamp}</span>
            </span>
            <span>•</span>
            <span>Model v{prediction.model_version}</span>
            <span>•</span>
            <span className="text-teal-700 font-semibold">{prediction.dataset_source}</span>
          </div>
        </div>

        {/* Quality Audit Badge */}
        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shrink-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <div className="text-slate-500 font-medium">Data Quality Audit</div>
            <div className="font-extrabold text-slate-900 text-sm">
              {prediction.data_quality_score}/100 • {prediction.data_quality_grade}
            </div>
            {prediction.imputation_applied && (
              <div className="text-[10px] text-amber-700 font-medium">
                Cohort imputation active ({prediction.imputed_fields.length} fields)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target 1: Overall CAD Hero Card */}
      <div className={`p-8 rounded-3xl border ${cadColor.border} ${cadColor.bg} shadow-xs relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs">
                Target 1: Primary Diagnosis
              </span>
              <span className="text-xs text-slate-500 font-medium">
                (≥50% Stenosis in ≥1 Major Vessel)
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Overall Coronary Artery Disease (CAD)
            </h3>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Model-calibrated likelihood of hemodynamically significant coronary artery disease.
              Calibration achieved via 5-Fold Stratified Platt Scaling.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs min-w-[220px]">
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
              <span className={cadColor.text}>{prediction.cad.percentage}%</span>
            </div>
            <div className="text-xs font-bold text-slate-700 mt-1">
              {prediction.cad.risk_level}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              95% CI: [{Math.round(prediction.cad.confidence_interval_95[0] * 100)}% - {Math.round(prediction.cad.confidence_interval_95[1] * 100)}%]
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-white/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${cadColor.bar}`}
            style={{ width: `${Math.min(100, prediction.cad.percentage)}%` }}
          />
        </div>

        {/* Uncertainty Summary Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span>
            <strong>Ensemble Stability:</strong> {prediction.cad.uncertainty_level} (Variance: {prediction.cad.prediction_variance})
          </span>
          <button
            onClick={() => {
              onNavigate('explainability');
            }}
            className="text-teal-700 hover:text-teal-900 font-semibold flex items-center space-x-1"
          >
            <span>View Contributing SHAP Features</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target 2, 3, 4: Three Coronary Arteries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Coronary Vessel Stenosis Predictions</h3>
            <p className="text-xs text-slate-500">
              Individual risk estimates for the three main coronary artery branches. Click any card to explore in 3D.
            </p>
          </div>
          <button
            onClick={() => onNavigate('3d-heart')}
            className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl border border-teal-200 transition-colors flex items-center space-x-1.5"
          >
            <Heart className="w-3.5 h-3.5 text-teal-600" />
            <span>Interactive 3D View</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LAD */}
          <div
            onClick={() => handleArteryClick('LAD')}
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-400 shadow-xs cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                  Target 2: LAD
                </span>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-teal-600 transition-colors flex items-center">
                  <span>3D Map</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base">Left Anterior Descending</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Anterior wall & apex perfusion territory. Primary contributor to anterior myocardial infarction.
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    <span className={ladColor.text}>{prediction.lad.percentage}%</span>
                  </span>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                    {prediction.lad.risk_level}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <div>95% CI:</div>
                  <div className="font-medium text-slate-600">
                    [{Math.round(prediction.lad.confidence_interval_95[0] * 100)}% - {Math.round(prediction.lad.confidence_interval_95[1] * 100)}%]
                  </div>
                </div>
              </div>

              <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${ladColor.bar}`}
                  style={{ width: `${Math.min(100, prediction.lad.percentage)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Stability: {prediction.lad.uncertainty_level.split(' ')[0]}</span>
              <span className="text-teal-700 font-semibold group-hover:underline">Inspect LAD →</span>
            </div>
          </div>

          {/* LCX */}
          <div
            onClick={() => handleArteryClick('LCX')}
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-400 shadow-xs cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                  Target 3: LCX
                </span>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-teal-600 transition-colors flex items-center">
                  <span>3D Map</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base">Left Circumflex</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Posterolateral LV myocardium territory. Courses along the left AV groove.
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    <span className={lcxColor.text}>{prediction.lcx.percentage}%</span>
                  </span>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                    {prediction.lcx.risk_level}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <div>95% CI:</div>
                  <div className="font-medium text-slate-600">
                    [{Math.round(prediction.lcx.confidence_interval_95[0] * 100)}% - {Math.round(prediction.lcx.confidence_interval_95[1] * 100)}%]
                  </div>
                </div>
              </div>

              <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${lcxColor.bar}`}
                  style={{ width: `${Math.min(100, prediction.lcx.percentage)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Stability: {prediction.lcx.uncertainty_level.split(' ')[0]}</span>
              <span className="text-teal-700 font-semibold group-hover:underline">Inspect LCX →</span>
            </div>
          </div>

          {/* RCA */}
          <div
            onClick={() => handleArteryClick('RCA')}
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-400 shadow-xs cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                  Target 4: RCA
                </span>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-teal-600 transition-colors flex items-center">
                  <span>3D Map</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base">Right Coronary Artery</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Right ventricle and inferior wall perfusion territory. Critical for nodal pacemaker blood supply.
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    <span className={rcaColor.text}>{prediction.rca.percentage}%</span>
                  </span>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                    {prediction.rca.risk_level}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <div>95% CI:</div>
                  <div className="font-medium text-slate-600">
                    [{Math.round(prediction.rca.confidence_interval_95[0] * 100)}% - {Math.round(prediction.rca.confidence_interval_95[1] * 100)}%]
                  </div>
                </div>
              </div>

              <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${rcaColor.bar}`}
                  style={{ width: `${Math.min(100, prediction.rca.percentage)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Stability: {prediction.rca.uncertainty_level.split(' ')[0]}</span>
              <span className="text-teal-700 font-semibold group-hover:underline">Inspect RCA →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('3d-heart')}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-2"
          >
            <Heart className="w-4 h-4" />
            <span>Interactive 3D Heart</span>
          </button>

          <button
            onClick={() => onNavigate('explainability')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center space-x-2"
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>SHAP Explanations</span>
          </button>

          <button
            onClick={() => onNavigate('simulator')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-2"
          >
            <Sliders className="w-4 h-4" />
            <span>"What-If" Intervention Simulator</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Download Decision Report</span>
          </button>
        </div>

        <button
          onClick={() => onNavigate('data-entry')}
          className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors flex items-center space-x-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New Patient Analysis</span>
        </button>
      </div>

      {/* Regulatory Safety Disclaimer */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 leading-relaxed flex items-start space-x-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Medical Safety Notice:</strong> {prediction.disclaimer}
        </div>
      </div>
    </div>
  );
};
