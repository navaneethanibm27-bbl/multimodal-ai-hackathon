import React from 'react';
import { VesselRiskEstimate } from '../../types';
import { AlertCircle, ChevronRight, Activity } from 'lucide-react';
import { LumenCrossSection } from './LumenCrossSection';

interface ArteryDetailsPanelProps {
  selectedArtery: 'LAD' | 'LCX' | 'RCA';
  riskData?: VesselRiskEstimate;
  onViewExplanation?: (target: string) => void;
}

const ARTERY_DESCRIPTIONS = {
  LAD: {
    fullName: 'Left Anterior Descending Artery (LAD)',
    anatomy: 'Courses through the anterior interventricular groove. Perfusion territory encompasses the anterior 2/3 of the interventricular septum, anterior LV myocardium, and cardiac apex.',
    clinicalSignificance: 'Stenosis of the LAD compromises large volumes of contractile left ventricular tissue and carries the highest hemodynamic burden among single-vessel occlusions.'
  },
  LCX: {
    fullName: 'Left Circumflex Artery (LCX)',
    anatomy: 'Branches from the left main coronary artery and wraps along the left atrioventricular groove towards the posterolateral ventricular wall.',
    clinicalSignificance: 'Supplies the lateral and posterior aspects of the left ventricle and, in left-dominant circulations, the posterior descending artery (PDA).'
  },
  RCA: {
    fullName: 'Right Coronary Artery (RCA)',
    anatomy: 'Originates from the right aortic sinus, coursing down the right coronary sulcus to supply the right ventricle, inferior left ventricular wall, and cardiac conduction nodes.',
    clinicalSignificance: 'Ischemia along the RCA frequently associates with inferior myocardial infarction and sinus/atrioventricular nodal conduction abnormalities.'
  }
};

export const ArteryDetailsPanel: React.FC<ArteryDetailsPanelProps> = ({
  selectedArtery,
  riskData,
  onViewExplanation
}) => {
  const info = ARTERY_DESCRIPTIONS[selectedArtery];

  const getRiskColorClasses = (pct?: number) => {
    if (pct === undefined) return { badge: 'bg-slate-100 text-slate-700', text: 'text-slate-900', bar: 'bg-teal-500' };
    if (pct >= 65) return { badge: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-600', bar: 'bg-rose-500' };
    if (pct >= 35) return { badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500' };
    return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-600', bar: 'bg-emerald-500' };
  };

  const colors = getRiskColorClasses(riskData?.percentage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-md uppercase tracking-wider border border-teal-200">
                {selectedArtery} Territory
              </span>
              <span className="text-xs text-slate-500 font-medium">Anatomical Target</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{info.fullName}</h3>
          </div>

          {riskData && (
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                <span className={colors.text}>{riskData.percentage}%</span>
              </div>
              <div className="text-[11px] font-medium text-slate-500">Estimated Stenosis Probability</div>
            </div>
          )}
        </div>

        {/* Probability Progress Bar */}
        {riskData && (
          <div className="mt-4">
            <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
              <span>Model Risk Classification:</span>
              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${colors.badge}`}>
                {riskData.risk_level}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${colors.bar}`}
                style={{ width: `${Math.min(100, riskData.percentage)}%` }}
              />
            </div>
          </div>
        )}

        {/* Ensemble Uncertainty Breakdown */}
        {riskData && (
          <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Ensemble Uncertainty Profile</span>
              </span>
              <span className="text-slate-600 text-[11px] font-normal">
                95% CI: [{Math.round(riskData.confidence_interval_95[0] * 100)}% - {Math.round(riskData.confidence_interval_95[1] * 100)}%]
              </span>
            </div>
            <div className="text-slate-600 text-[11px] leading-relaxed">
              <strong>Stability:</strong> {riskData.uncertainty_level} (Tree Variance: {riskData.prediction_variance}).
            </div>
            {riskData.uncertainty_reasons.length > 0 && (
              <ul className="mt-1.5 list-disc list-inside text-[11px] text-slate-500 space-y-0.5">
                {riskData.uncertainty_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Lumen Cross-Section Visualization */}
        <div className="mt-5">
          <LumenCrossSection artery={selectedArtery} risk={riskData} />
        </div>

        {/* Anatomical & Clinical Details */}
        <div className="mt-5 space-y-3 text-xs">
          <div>
            <h4 className="font-semibold text-slate-800">Myocardial Perfusion Anatomy</h4>
            <p className="text-slate-600 mt-0.5 leading-relaxed">{info.anatomy}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Clinical Significance</h4>
            <p className="text-slate-600 mt-0.5 leading-relaxed">{info.clinicalSignificance}</p>
          </div>
        </div>

        {/* Medical Geometry Disclaimer */}
        <div className="mt-5 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Visualization Notice:</strong> The highlighted artery displays model-estimated risk probabilities across its anatomical territory. It does not illustrate a measured physical blockage lesion or patient-specific angiographic geometry.
          </span>
        </div>
      </div>

      {/* Action Footer */}
      {onViewExplanation && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => onViewExplanation(selectedArtery)}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-xs flex items-center justify-center space-x-2 transition-colors shadow-xs"
          >
            <span>View {selectedArtery} SHAP Feature Attributions</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
