import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  AlertCircle,
  Loader2,
  Database
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { ModelMetricsData } from '../types';
import { api } from '../services/api';

export const ModelPerformanceDashboard: React.FC = () => {
  const [metricsData, setMetricsData] = useState<Record<string, ModelMetricsData> | null>(null);
  const [_metadata, setMetadata] = useState<any>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('CAD');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const targets = ['CAD', 'LAD', 'LCX', 'RCA'];

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getMetrics();
        setMetricsData(res.metrics);
        setMetadata(res.metadata);
      } catch (err: any) {
        setError(err.message || 'Failed to load model evaluation metrics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const currentMetrics = metricsData ? metricsData[selectedTarget] : null;

  // Calculate derived confusion matrix rates
  const cm = currentMetrics?.confusion_matrix;
  const tn = cm?.true_negatives || 0;
  const fp = cm?.false_positives || 0;
  const fn = cm?.false_negatives || 0;
  const tp = cm?.true_positives || 0;
  const total = tn + fp + fn + tp;
  const sensitivity = tp + fn > 0 ? ((tp / (tp + fn)) * 100).toFixed(1) : 'N/A';
  const specificity = tn + fp > 0 ? ((tn / (tn + fp)) * 100).toFixed(1) : 'N/A';
  const ppv = tp + fp > 0 ? ((tp / (tp + fp)) * 100).toFixed(1) : 'N/A';
  const npv = tn + fn > 0 ? ((tn / (tn + fn)) * 100).toFixed(1) : 'N/A';

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto">
      {/* Header & Target Selector */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Empirical Validation & Model Benchmark</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Model Evaluation & Calibration Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Live evaluation metrics computed strictly on held-out test splits. All numbers reflect actual model pipeline artifacts.
          </p>
        </div>

        {/* Target Selector */}
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

      {isLoading && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-800">Loading Evaluation Benchmarks...</div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200 text-xs text-rose-900 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Evaluation Data Error</div>
            <div className="mt-1">{error}</div>
          </div>
        </div>
      )}

      {!isLoading && !error && currentMetrics && (
        <div className="space-y-6">
          {/* Key Metric Scorecards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">Test Accuracy</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {(currentMetrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Overall concordance</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">Precision (PPV)</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {(currentMetrics.precision * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Positive predictive rate</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">Recall (Sensitivity)</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {(currentMetrics.recall * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">True positive capture</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">F1-Score</div>
              <div className="text-2xl font-black text-teal-700 mt-1">
                {(currentMetrics.f1_score * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Harmonic balance</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">ROC-AUC</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {currentMetrics.roc_auc !== null ? currentMetrics.roc_auc.toFixed(3) : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Discrimination index</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">Brier Score</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {currentMetrics.brier_score.toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Calibration loss (0=ideal)</div>
            </div>
          </div>

          {/* Confusion Matrix and Calibration Curve Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Confusion Matrix (6 cols) */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    Confusion Matrix: {selectedTarget}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Test Cohort: N = {total}
                  </span>
                </div>

                {/* 2x2 Visual Table */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  {/* True Negatives */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      True Negatives (TN)
                    </div>
                    <div className="text-3xl font-black text-emerald-900">{tn}</div>
                    <div className="text-[11px] text-emerald-700">Correctly classified Normal</div>
                  </div>

                  {/* False Positives */}
                  <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1">
                    <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                      False Positives (FP)
                    </div>
                    <div className="text-3xl font-black text-rose-900">{fp}</div>
                    <div className="text-[11px] text-rose-700">Type I error (False alarm)</div>
                  </div>

                  {/* False Negatives */}
                  <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1">
                    <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                      False Negatives (FN)
                    </div>
                    <div className="text-3xl font-black text-rose-900">{fn}</div>
                    <div className="text-[11px] text-rose-700">Type II error (Missed disease)</div>
                  </div>

                  {/* True Positives */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      True Positives (TP)
                    </div>
                    <div className="text-3xl font-black text-emerald-900">{tp}</div>
                    <div className="text-[11px] text-emerald-700">Correctly identified Stenosis</div>
                  </div>
                </div>
              </div>

              {/* Diagnostic Sensitivity / Specificity Grid */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Sensitivity</div>
                  <div className="font-extrabold text-slate-800 mt-0.5">{sensitivity}%</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Specificity</div>
                  <div className="font-extrabold text-slate-800 mt-0.5">{specificity}%</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">PPV</div>
                  <div className="font-extrabold text-slate-800 mt-0.5">{ppv}%</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">NPV</div>
                  <div className="font-extrabold text-slate-800 mt-0.5">{npv}%</div>
                </div>
              </div>
            </div>

            {/* Calibration Reliability Plot (6 cols) */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    Calibration Curve (Reliability Diagram)
                  </h3>
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Brier: {currentMetrics.brier_score.toFixed(3)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Compares model-predicted probability with empirical fraction of positive outcomes.
                  Closeness to the diagonal line indicates reliable, calibrated probabilities.
                </p>

                <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={currentMetrics.calibration_curve}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="predicted"
                        domain={[0, 1]}
                        type="number"
                        tick={{ fontSize: 11 }}
                        label={{ value: 'Mean Predicted Probability', position: 'insideBottom', offset: -5, fontSize: 10 }}
                      />
                      <YAxis
                        domain={[0, 1]}
                        type="number"
                        tick={{ fontSize: 11 }}
                        label={{ value: 'Fraction of Positives', angle: -90, position: 'insideLeft', fontSize: 10 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-md text-xs space-y-1">
                                <div>Predicted: <strong>{(d.predicted * 100).toFixed(1)}%</strong></div>
                                <div>Observed: <strong>{(d.observed * 100).toFixed(1)}%</strong></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="observed"
                        stroke="#0d9488"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#0d9488' }}
                        name="Model Calibration"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Method: 5-Fold Stratified Platt Scaling (Sigmoid)</span>
                <span className="font-semibold text-slate-700">Evaluated on Held-Out Test Set</span>
              </div>
            </div>
          </div>

          {/* Cohort Provenance & Evaluation Methodology */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Database className="w-4 h-4 text-teal-600" />
              <span>Dataset Split & Pipeline Methodology</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1 border border-slate-100">
                <div className="font-bold text-slate-800">Partition Protocol</div>
                <div className="text-slate-600">{currentMetrics.evaluation_strategy}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Train: {currentMetrics.sample_counts.train_samples} | Test: {currentMetrics.sample_counts.test_samples} patients
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1 border border-slate-100">
                <div className="font-bold text-slate-800">Class Prevalence</div>
                <div className="text-slate-600">
                  Positive: {currentMetrics.sample_counts.positive_class_count} ({((currentMetrics.sample_counts.prevalence) * 100).toFixed(1)}%) |
                  Negative: {currentMetrics.sample_counts.negative_class_count}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Balanced class-weighting applied during estimator fitting.</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1 border border-slate-100">
                <div className="font-bold text-slate-800">Leakage Safeguards</div>
                <div className="text-slate-600">
                  LAD, LCX, RCA, Cath strictly excluded from feature matrix. SimpleImputer and StandardScaler fit only on X_train.
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Zero cross-partition leakage.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
