import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Educational & Research Decision-Support Prototype:</strong> Outputs represent statistical model-estimated probabilities and are not clinically validated diagnostic conclusions or treatment recommendations. Always consult a qualified physician.
          </span>
        </div>
        <span className="hidden md:inline-block text-[11px] font-semibold text-amber-700 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded">
          Not For Clinical Use
        </span>
      </div>
    </div>
  );
};
