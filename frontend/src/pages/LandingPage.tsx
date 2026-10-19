import React from 'react';
import {
  Heart,
  ShieldCheck,
  Activity,
  Layers,
  FileText,
  ArrowRight,
  Database,
  Cpu,
  BarChart3,
  Stethoscope
} from 'lucide-react';

interface LandingPageProps {
  onStartAnalysis: () => void;
  onExplore3D: () => void;
  onViewMetrics: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAnalysis,
  onExplore3D,
  onViewMetrics
}) => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 sm:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Multimodal AI Hackathon 2026 • Track A</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            CardioVision <span className="text-teal-600">AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
            An explainable, uncertainty-aware cardiovascular decision-support system.
            Combines rigorous calibrated machine learning, patient data-quality checks,
            artery-specific stenosis estimation, and interactive 3D coronary anatomy.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={onStartAnalysis}
              className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center space-x-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Start Risk Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExplore3D}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl border border-slate-200 transition-all flex items-center space-x-2"
            >
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Launch 3D Heart</span>
            </button>

            <button
              onClick={onViewMetrics}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-all flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span>Model Evaluation</span>
            </button>
          </div>

          {/* Core Target Pills */}
          <div className="pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-3 text-xs text-slate-500 font-medium">
            <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">Target 1: Overall CAD</span>
            <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">Target 2: LAD Stenosis</span>
            <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">Target 3: LCX Stenosis</span>
            <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">Target 4: RCA Stenosis</span>
          </div>
        </div>
      </section>

      {/* 5 Distinctive Pillars */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Scientifically Responsible AI Architecture
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Traditional cardiovascular calculators provide black-box numerical scores.
            CardioVision AI differentiates itself through five integrated scientific principles:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-teal-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">A. Patient Data Quality Checker</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Validates physiological plausibility, detects impossible vital signs, identifies unit mismatches (e.g. lbs vs kg, m vs cm), and explicitly reports imputed features instead of silently replacing them with zeros.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-teal-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">B. Uncertainty-Aware Prediction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes calibrated probabilities via Platt Scaling and derives empirical 95% confidence intervals from tree-ensemble variance, distinguishing positive probability from model confidence.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-teal-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">C. Artery-Specific 3D Visualization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              An interactive 3D anatomical heart in Three.js allowing doctors and students to rotate, zoom, and select the LAD, LCX, and RCA coronary arteries to inspect risk and perfusion territories.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-teal-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">D. SHAP Explainability (XAI)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes genuine patient-level SHAP attributions from trained models. Shows directional feature impact and clarifies the difference between statistical association and clinical causation.
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-teal-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">E. Transparent Decision Reports</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Produces downloadable, self-contained printable reports compiling patient inputs, data quality audits, artery-specific probabilities, SHAP factors, and mandatory safety disclaimers.
            </p>
          </div>

          {/* Leakage Prevention Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-teal-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Zero Data Leakage Pipeline</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Target columns (CAD, LAD, LCX, RCA) and catheterization outcomes (Cath) are strictly excluded from input features. Preprocessing and calibration are fitted solely on training splits.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="bg-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How CardioVision AI Works</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            End-to-end clinical workflow from raw patient measurements to explainable 3D visual analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Step 1</span>
            <h4 className="font-bold text-slate-900 text-sm">Data Entry & Normalization</h4>
            <p className="text-xs text-slate-600">
              Input demographics, blood pressure, lipid panel, ECG findings, and echocardiography with instant unit validation.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Step 2</span>
            <h4 className="font-bold text-slate-900 text-sm">Quality Pre-Check</h4>
            <p className="text-xs text-slate-600">
              Automated audit verifies data plausibility, generates quality scores, and transparently logs any cohort imputations.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Step 3</span>
            <h4 className="font-bold text-slate-900 text-sm">4-Target Calibrated ML</h4>
            <p className="text-xs text-slate-600">
              Calibrated classifiers estimate the probability of overall CAD, LAD, LCX, and RCA stenosis with ensemble uncertainty bounds.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Step 4</span>
            <h4 className="font-bold text-slate-900 text-sm">3D Anatomy & SHAP XAI</h4>
            <p className="text-xs text-slate-600">
              Explore the 3D heart, highlight specific arteries, inspect SHAP feature attributions, and generate a transparent clinical report.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack Details */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Local-First, Lightweight Architecture</h3>
            <p className="text-xs text-slate-500">
              Designed to run efficiently on any standard laptop without requiring external GPU hardware or slow API dependencies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-800">Frontend Stack</div>
            <div className="text-slate-500 mt-1">React 19, TypeScript, Vite, Tailwind CSS, Recharts</div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-800">3D Graphics</div>
            <div className="text-slate-500 mt-1">Three.js, OrbitControls, Custom Anatomical Meshes</div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-800">Machine Learning</div>
            <div className="text-slate-500 mt-1">scikit-learn, Platt Calibration, SHAP TreeExplainer</div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-800">Backend Engine</div>
            <div className="text-slate-500 mt-1">FastAPI, Python 3.14, Pydantic, SQLite</div>
          </div>
        </div>
      </section>
    </div>
  );
};
