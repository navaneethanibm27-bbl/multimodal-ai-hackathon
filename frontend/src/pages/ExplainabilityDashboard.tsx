import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { ExplainResponse } from '../types';
import { api } from '../services/api';

interface ExplainabilityDashboardProps {
  patientFeatures: Record<string, any> | null;
  initialTarget?: string;
}

export const ExplainabilityDashboard: React.FC<ExplainabilityDashboardProps> = ({
  patientFeatures,
  initialTarget = 'CAD'
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>(initialTarget.toUpperCase());
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const targets = ['CAD', 'LAD', 'LCX', 'RCA'];

  const fetchExplanation = useCallback(async (target: string) => {
    if (!patientFeatures) {
      setError('No active patient record loaded. Please complete data entry first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.explain(patientFeatures, target, 10);
      setExplanation(res);
    } catch (err: any) {
      setError(err.message || `Failed to calculate SHAP attributions for ${target}.`);
    } finally {
      setIsLoading(false);
    }
  }, [patientFeatures]);

  useEffect(() => {
    fetchExplanation(selectedTarget);
  }, [fetchExplanation, selectedTarget]);

  // Chart data formatting
  const chartData = explanation?.top_features.map((f) => ({
    name: f.display_name.length > 22 ? f.display_name.substring(0, 20) + '...' : f.display_name,
    fullName: f.display_name,
    shap: f.attribution,
    absShap: f.abs_attribution,
    direction: f.direction,
    patientVal: `${f.patient_value} ${f.unit}`.trim()
  })) || [];

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto">
      {/* Header & Target Selector */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Explainable AI • SHAP TreeExplainer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Feature Attribution & Decision Logic
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Inspect the exact mathematical contributions of each clinical parameter to the model's calibrated prediction.
          </p>
        </div>

        {/* Target Buttons */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          {targets.map((tgt) => (
            <button
              key={tgt}
              onClick={() => setSelectedTarget(tgt)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTarget === tgt
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tgt === 'CAD' ? 'Overall CAD' : `${tgt} Artery`}
            </button>
          ))}
        </div>
      </div>

      {/* Association vs Causation Notice Banner */}
      <div className="bg-amber-50/80 border border-amber-200/90 p-5 rounded-2xl text-xs text-amber-900 space-y-1.5 shadow-2xs">
        <div className="font-bold flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Scientific Disclaimer: Statistical Association vs. Medical Causation</span>
        </div>
        <p className="leading-relaxed text-amber-800">
          SHAP feature attributions reflect statistical interactions learned by the tree ensemble from the training cohort.
          A positive attribution indicates that the presence of that clinical feature increases the model's estimated risk,
          <strong> but does NOT establish direct physical etiology or singular causation</strong>.
        </p>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-800">Computing SHAP TreeExplainer Attributions...</div>
          <div className="text-xs text-slate-500">Evaluating feature split marginals across decision trees.</div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200 text-xs text-rose-900 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Explanation Unavailable</div>
            <div className="mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Main Attribution Visualizations */}
      {!isLoading && !error && explanation && (
        <div className="space-y-6">
          {/* Top Metric Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Cohort Expected Base Value (E[y])</div>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {(explanation.base_value * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Average population baseline prior</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Patient Calibrated Probability</div>
              <div className="text-2xl font-black text-teal-700 mt-1">
                {(explanation.patient_predicted_probability * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Shifted by patient's feature attributions</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Net Feature Delta</div>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {((explanation.patient_predicted_probability - explanation.base_value) * 100) > 0 ? '+' : ''}
                {((explanation.patient_predicted_probability - explanation.base_value) * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Cumulative displacement from prior</div>
            </div>
          </div>

          {/* Ranked Feature Importance Chart */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ranked SHAP Feature Importance ({selectedTarget})
                </h3>
                <p className="text-xs text-slate-500">
                  Horizontal bar chart displaying the magnitude and directional force of the top clinical features.
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center space-x-4 text-xs font-medium">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500" />
                  <span className="text-slate-600">Increases Risk (+)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-slate-600">Decreases Risk (-)</span>
                </span>
              </div>
            </div>

            {/* Recharts Horizontal Bar Chart */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                >
                  <XAxis type="number" domain={['dataMin - 0.05', 'dataMax + 0.05']} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={95} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1">
                            <div className="font-bold text-slate-900">{d.fullName}</div>
                            <div className="text-slate-600">Patient Value: <strong className="text-slate-800">{d.patientVal}</strong></div>
                            <div className="text-slate-600">SHAP Impact: <strong className={d.shap > 0 ? 'text-rose-600' : 'text-emerald-600'}>{d.shap > 0 ? '+' : ''}{d.shap.toFixed(4)}</strong></div>
                            <div className="text-[10px] text-slate-400">{d.direction}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Bar dataKey="shap" radius={[4, 4, 4, 4]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.shap > 0 ? '#ef4444' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Patient Feature Contribution Table */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Detailed Feature-by-Feature Clinical Analysis
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-3 font-semibold">Clinical Feature</th>
                    <th className="pb-3 font-semibold">Patient Value</th>
                    <th className="pb-3 font-semibold">Attribution Magnitude</th>
                    <th className="pb-3 font-semibold">Direction</th>
                    <th className="pb-3 font-semibold">Clinical Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {explanation.top_features.map((f, i) => {
                    const isPositive = f.attribution > 0;
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-bold text-slate-800">{f.display_name}</td>
                        <td className="py-3 text-slate-700 font-semibold">
                          {f.patient_value} <span className="text-[10px] text-slate-400">{f.unit}</span>
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-900">
                          <span className={isPositive ? 'text-rose-600' : 'text-emerald-600'}>
                            {isPositive ? '+' : ''}{f.attribution.toFixed(4)}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                              isPositive
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isPositive ? (
                              <>
                                <TrendingUp className="w-3 h-3 text-rose-500" />
                                <span>Increases Risk</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-3 h-3 text-emerald-500" />
                                <span>Decreases Risk</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-[11px] max-w-md leading-relaxed">
                          {f.clinical_note}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
