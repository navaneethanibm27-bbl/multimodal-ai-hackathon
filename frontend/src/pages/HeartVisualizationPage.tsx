import React from 'react';
import { HeartCanvas } from '../components/3DHeart/HeartCanvas';
import { ArteryDetailsPanel } from '../components/3DHeart/ArteryDetailsPanel';
import { PredictionResponse } from '../types';
import { Heart, Info, ArrowLeft } from 'lucide-react';

interface HeartVisualizationPageProps {
  prediction: PredictionResponse | null;
  selectedArtery: 'LAD' | 'LCX' | 'RCA';
  onSelectArtery: (artery: 'LAD' | 'LCX' | 'RCA') => void;
  onNavigateToExplanation: (target: string) => void;
  onBackToDashboard: () => void;
}

export const HeartVisualizationPage: React.FC<HeartVisualizationPageProps> = ({
  prediction,
  selectedArtery,
  onSelectArtery,
  onNavigateToExplanation,
  onBackToDashboard
}) => {
  const getSelectedRisk = () => {
    if (!prediction) return undefined;
    if (selectedArtery === 'LAD') return prediction.lad;
    if (selectedArtery === 'LCX') return prediction.lcx;
    return prediction.rca;
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-600" />
            <span>Interactive 3D Anatomical Decision Support</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Coronary Perfusion & Stenosis Mapping
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rotate (drag), zoom (scroll), and click coronary arteries to cross-examine model probabilities with perfusion anatomy.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas + Details Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Heart Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <HeartCanvas
            ladRisk={prediction?.lad}
            lcxRisk={prediction?.lcx}
            rcaRisk={prediction?.rca}
            selectedArtery={selectedArtery}
            onSelectArtery={onSelectArtery}
          />
        </div>

        {/* Artery Details Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <ArteryDetailsPanel
            selectedArtery={selectedArtery}
            riskData={getSelectedRisk()}
            onViewExplanation={onNavigateToExplanation}
          />
        </div>
      </div>

      {/* Educational Perfusion Reference */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Info className="w-4 h-4 text-teal-600" />
          <span>Coronary Artery Perfusion Mapping Guide</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1.5">
            <div className="font-bold text-rose-900 text-sm">LAD (Left Anterior Descending)</div>
            <p className="text-slate-600 leading-relaxed">
              Supplies ~45-55% of the left ventricular mass. Anteroseptal, anterior LV wall, and apical myocardium. Occlusion causes anterior wall myocardial infarction.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1.5">
            <div className="font-bold text-amber-900 text-sm">LCX (Left Circumflex)</div>
            <p className="text-slate-600 leading-relaxed">
              Supplies ~15-25% of LV mass via obtuse marginal branches. Posterolateral LV wall and lateral papillary muscle. Often electrically silent on standard 12-lead ECG.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
            <div className="font-bold text-emerald-900 text-sm">RCA (Right Coronary Artery)</div>
            <p className="text-slate-600 leading-relaxed">
              Supplies the right ventricle, inferior/diaphragmatic LV wall, SA node (~60%), and AV node (~90%). Occlusion frequently precipitates bradycardia and AV block.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
