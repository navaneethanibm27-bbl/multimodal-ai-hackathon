import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { PatientDataEntry } from './pages/PatientDataEntry';
import { MainResultsDashboard } from './pages/MainResultsDashboard';
import { HeartVisualizationPage } from './pages/HeartVisualizationPage';
import { ExplainabilityDashboard } from './pages/ExplainabilityDashboard';
import { ModelPerformanceDashboard } from './pages/ModelPerformanceDashboard';
import { HistoryDashboard } from './pages/HistoryDashboard';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { ReportModal } from './components/Reports/ReportModal';
import { SystemHealth, PredictionResponse } from './types';
import { api } from './services/api';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [patientFeatures, setPatientFeatures] = useState<Record<string, any> | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [selectedArtery, setSelectedArtery] = useState<'LAD' | 'LCX' | 'RCA'>('LAD');
  const [selectedExplainTarget, setSelectedExplainTarget] = useState<string>('CAD');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const fetchHealth = async () => {
    try {
      const h = await api.getHealth();
      setHealth(h);
      const info = await api.getModelInfo();
      setModelInfo(info);
    } catch (err) {
      console.warn('API health check warning:', err);
      setHealth({
        status: 'offline',
        service: 'CardioVision AI',
        version: '1.0.0',
        models_loaded: false,
        load_error: 'Unable to reach backend API. Ensure Uvicorn server is running.',
        dataset_source: 'Unavailable',
        is_synthetic_model: false,
        supported_targets: ['CAD', 'LAD', 'LCX', 'RCA']
      });
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handlePredictionComplete = (predData: PredictionResponse, features: Record<string, any>) => {
    setPrediction(predData);
    setPatientFeatures(features);
    setCurrentPage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToExplanation = (target: string) => {
    setSelectedExplainTarget(target);
    setCurrentPage('explainability');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Global Safety Banner */}
      <DisclaimerBanner />

      {/* Primary Sticky Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        health={health}
        onRefreshHealth={fetchHealth}
        hasActivePrediction={prediction !== null}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {currentPage === 'landing' && (
          <LandingPage
            onStartAnalysis={() => handleNavigate('data-entry')}
            onExplore3D={() => handleNavigate('3d-heart')}
            onViewMetrics={() => handleNavigate('metrics')}
          />
        )}

        {currentPage === 'data-entry' && (
          <PatientDataEntry
            onPredictionComplete={handlePredictionComplete}
            demoFixtures={modelInfo?.demo_fixtures}
          />
        )}

        {currentPage === 'results' && prediction && (
          <MainResultsDashboard
            prediction={prediction}
            onNavigate={handleNavigate}
            onSelectArtery={(artery) => setSelectedArtery(artery)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {currentPage === 'results' && !prediction && (
          <div className="py-20 text-center space-y-4">
            <h3 className="text-xl font-bold text-slate-800">No Prediction Record Active</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please enter patient clinical measurements or load a demonstration fixture to compute risk probabilities.
            </p>
            <button
              onClick={() => handleNavigate('data-entry')}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Go to Patient Data Entry
            </button>
          </div>
        )}

        {currentPage === 'simulator' && (
          <WhatIfSimulatorPage
            patientFeatures={patientFeatures}
            onNavigateTo3D={() => handleNavigate('3d-heart')}
          />
        )}

        {currentPage === '3d-heart' && (
          <HeartVisualizationPage
            prediction={prediction}
            selectedArtery={selectedArtery}
            onSelectArtery={(artery) => setSelectedArtery(artery)}
            onNavigateToExplanation={handleNavigateToExplanation}
            onBackToDashboard={() => handleNavigate(prediction ? 'results' : 'landing')}
          />
        )}

        {currentPage === 'explainability' && (
          <ExplainabilityDashboard
            patientFeatures={patientFeatures}
            initialTarget={selectedExplainTarget}
          />
        )}

        {currentPage === 'metrics' && (
          <ModelPerformanceDashboard />
        )}

        {currentPage === 'history' && (
          <HistoryDashboard />
        )}
      </main>

      {/* Global Transparent Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        prediction={prediction}
        patientFeatures={patientFeatures}
      />

      {/* Global Clinical Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
