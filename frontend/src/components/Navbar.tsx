import React from 'react';
import { HeartPulse, AlertCircle, RefreshCw } from 'lucide-react';
import { SystemHealth } from '../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  health: SystemHealth | null;
  onRefreshHealth: () => void;
  hasActivePrediction: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  health,
  onRefreshHealth,
  hasActivePrediction
}) => {
  const navItems = [
    { id: 'landing', label: 'Overview' },
    { id: 'data-entry', label: 'Patient Input & Quality' },
    { id: 'results', label: 'Risk Dashboard', badge: hasActivePrediction ? 'Active' : undefined },
    { id: 'simulator', label: 'What-If Simulator' },
    { id: '3d-heart', label: '3D Heart' },
    { id: 'explainability', label: 'SHAP Explainability' },
    { id: 'metrics', label: 'Model Performance' },
    { id: 'history', label: 'Reports & History' },
  ];

  const isOnline = health?.status === 'online';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-3 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition-colors">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">CardioVision</span>
                <span className="text-teal-600 font-extrabold text-lg">AI</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-1 tracking-wide uppercase">
                Coronary Risk & 3D Anatomy
              </p>
            </div>
          </button>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-slate-100 text-teal-800 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Badge */}
          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>API Online (v{health?.version || '1.0'})</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>API Offline</span>
                  <button onClick={onRefreshHealth} title="Retry Connection" className="ml-1 hover:text-rose-900">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>

            {/* Quick Mobile Menu toggle or action */}
            <button
              onClick={() => onNavigate('data-entry')}
              className="lg:hidden px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold"
            >
              Analyze
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation row */}
        <div className="lg:hidden flex overflow-x-auto py-2 border-t border-slate-100 space-x-1 no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${
                currentPage === item.id
                  ? 'bg-teal-50 text-teal-800 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
