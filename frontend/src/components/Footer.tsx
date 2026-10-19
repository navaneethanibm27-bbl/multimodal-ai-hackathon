import React from 'react';
import { HeartPulse, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 text-base">CardioVision AI</span>
              <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">
                Track A: Hackathon 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              An explainable, uncertainty-aware cardiovascular decision support platform combining calibrated risk estimation and interactive 3D coronary anatomy.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
            <button onClick={() => onNavigate('landing')} className="hover:text-teal-700">Overview</button>
            <button onClick={() => onNavigate('data-entry')} className="hover:text-teal-700">Data Input</button>
            <button onClick={() => onNavigate('3d-heart')} className="hover:text-teal-700">3D Heart</button>
            <button onClick={() => onNavigate('explainability')} className="hover:text-teal-700">SHAP Attributions</button>
            <button onClick={() => onNavigate('metrics')} className="hover:text-teal-700">Evaluation Metrics</button>
            <button onClick={() => onNavigate('history')} className="hover:text-teal-700">History</button>
          </div>
        </div>

        {/* Mandatory Research Notice */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed space-y-1">
          <div className="font-bold text-slate-700 flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Academic & Decision-Support Notice</span>
          </div>
          <p>
            CardioVision AI is built strictly as an educational and scientific decision-support prototype. It has not received regulatory clearance or clinical validation as a standalone diagnostic software. Model predictions are statistical estimates derived from training cohort distributions and must never replace direct clinical evaluation by a certified physician or coronary angiographic imaging.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100 gap-2">
          <div>© 2026 CardioVision AI Research Team • Track A: Cardiovascular Risk Visualization & Prediction</div>
          <div>CPU-Optimized Tabular ML & WebGL Three.js Engine</div>
        </div>
      </div>
    </footer>
  );
};
