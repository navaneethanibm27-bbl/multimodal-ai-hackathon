import React from 'react';
import { VesselRiskEstimate } from '../../types';
import { Activity } from 'lucide-react';

interface LumenCrossSectionProps {
  artery: 'LAD' | 'LCX' | 'RCA';
  risk?: VesselRiskEstimate;
}

export const LumenCrossSection: React.FC<LumenCrossSectionProps> = ({ artery, risk }) => {
  const percentage = risk?.percentage ?? 40;
  // Estimated visual luminal narrowing bounded between 15% and 85%
  const stenosisNarrowingPct = Math.min(85, Math.max(15, percentage));
  const residualLumenPct = Math.round((100 - stenosisNarrowingPct) * 10) / 10;

  // Path coordinates for plaque crescent encroaching from left
  const plaqueOffset = 25 - (stenosisNarrowingPct * 0.45);

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between font-bold text-slate-800">
        <span className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>{artery} Cross-Sectional Lumen Model</span>
        </span>
        <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
          Estimated Residual Area: ~{residualLumenPct}%
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        {/* SVG Lumen Diagram */}
        <div className="relative w-36 h-36 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
            {/* Outer Adventitial / Media Wall */}
            <circle cx="50" cy="50" r="48" fill="#fecdd3" stroke="#f43f5e" strokeWidth="2.5" />
            
            {/* Endothelial Ring */}
            <circle cx="50" cy="50" r="42" fill="#fff1f2" stroke="#fda4af" strokeWidth="1.5" />

            {/* Blood Pool (Patent Lumen) */}
            <circle cx="50" cy="50" r="38" fill="#991b1b" />

            {/* Encroaching Atheromatous Plaque Crescent */}
            <path
              d={`M 50 12 A 38 38 0 0 1 50 88 A ${38 - plaqueOffset} 38 0 0 0 50 12 Z`}
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1.5"
              className="transition-all duration-700"
            />

            {/* Plaque Lipid Core Center */}
            <circle cx="34" cy="50" r={Math.max(6, stenosisNarrowingPct * 0.16)} fill="#f59e0b" opacity="0.8" />

            {/* Center Blood Flow Dot */}
            <circle cx="62" cy="50" r={Math.max(4, residualLumenPct * 0.14)} fill="#dc2626" />
          </svg>
        </div>

        {/* Anatomical Key & Metrics */}
        <div className="space-y-2 text-[11px] text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-800 shrink-0" />
            <span>Patent Lumen Area (Active Flow)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600 shrink-0" />
            <span>Atheroma Plaque Encroachment</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-200 border border-rose-400 shrink-0" />
            <span>Arterial Tunica Media Wall</span>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 italic">
            Illustrates hemodynamic flow restriction corresponding to {percentage}% estimated stenosis band.
          </div>
        </div>
      </div>
    </div>
  );
};
