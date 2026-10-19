import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  Loader2,
  Stethoscope
} from 'lucide-react';
import { ValidationResponse } from '../types';
import { api } from '../services/api';

interface PatientDataEntryProps {
  onPredictionComplete: (predictionData: any, patientFeatures: any) => void;
  demoFixtures?: Record<string, any>;
}

export const PatientDataEntry: React.FC<PatientDataEntryProps> = ({
  onPredictionComplete,
  demoFixtures
}) => {
  // Initial empty form state
  const initialFormState: Record<string, any> = {
    Age: '',
    Sex: 'Male',
    Weight: '',
    Length: '',
    BMI: '',
    DM: 'N',
    HTN: 'N',
    Current_Smoker: 'N',
    Ex_Smoker: 'N',
    FH: 'N',
    Obesity: 'N',
    CRF: 'N',
    CVA: 'N',
    Airway_disease: 'N',
    Thyroid_Disease: 'N',
    CHF: 'N',
    DLP: 'N',
    BP: '',
    PR: '',
    Edema: 'N',
    Weak_Peripheral_Pulse: 'N',
    Lung_Rales: 'N',
    Systolic_Murmur: 'N',
    Diastolic_Murmur: 'N',
    Typical_Chest_Pain: 'N',
    Atypical_Chest_Pain: 'N',
    Nonanginal_Chest_Pain: 'N',
    Exertional_CP: 'N',
    LowTH_Angina: 'N',
    Q_Wave: '0',
    St_Elevation: '0',
    St_Depression: '0',
    Tinversion: '0',
    LVH: 'N',
    Poor_R_Progression: 'N',
    FBS: '',
    CR: '',
    TG: '',
    LDL: '',
    HDL: '',
    BUN: '',
    ESR: '',
    HB: '',
    K: '',
    Na: '',
    WBC: '',
    Lymph: '',
    Neut: '',
    PLT: '',
    EF_TTE: '',
    Region_RWMA: '0',
    VHD: 'N'
  };

  const [formData, setFormData] = useState<Record<string, any>>(initialFormState);
  const [isValidating, setIsValidating] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate BMI if weight and length exist
      if ((field === 'Weight' || field === 'Length') && updated.Weight && updated.Length) {
        const w = parseFloat(updated.Weight);
        const l_m = parseFloat(updated.Length) / 100.0;
        if (w > 0 && l_m > 0) {
          updated.BMI = (w / (l_m * l_m)).toFixed(2);
        }
      }
      return updated;
    });
    setDemoNotice(null);
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setValidationResult(null);
    setApiError(null);
    setDemoNotice(null);
  };

  const loadDemo = (fixtureKey: string) => {
    if (demoFixtures && demoFixtures[fixtureKey]) {
      setFormData(demoFixtures[fixtureKey].data);
      setValidationResult(null);
      setApiError(null);
      setDemoNotice(`Loaded ${demoFixtures[fixtureKey].label} (FOR SOFTWARE TESTING ONLY)`);
    } else {
      // Fallback pre-programmed fixtures
      if (fixtureKey === 'acute_anterior_cad' || fixtureKey === 'high_risk_cad') {
        setFormData({
          Age: 64, Sex: 'Male', Weight: 86, Length: 172, BMI: 29.07,
          DM: 'Y', HTN: 'Y', Current_Smoker: 'Y', Ex_Smoker: 'N', FH: 'Y', Obesity: 'Y',
          CRF: 'N', CVA: 'N', Airway_disease: 'N', Thyroid_Disease: 'N', CHF: 'N', DLP: 'Y',
          BP: 155, PR: 84, Edema: 'N', Weak_Peripheral_Pulse: 'N', Lung_Rales: 'N',
          Systolic_Murmur: 'N', Diastolic_Murmur: 'N',
          Typical_Chest_Pain: 'Y', Atypical_Chest_Pain: 'N', Nonanginal_Chest_Pain: 'N',
          Exertional_CP: 'Y', LowTH_Angina: 'Y',
          Q_Wave: '1', St_Elevation: '1', St_Depression: '1', Tinversion: '1', LVH: 'Y', Poor_R_Progression: 'N',
          FBS: 168.0, CR: 1.25, TG: 240.0, LDL: 165.0, HDL: 34.0, BUN: 24.0, ESR: 28.0,
          HB: 14.5, K: 4.3, Na: 139.0, WBC: 8800.0, Lymph: 24.0, Neut: 72.0, PLT: 260.0,
          EF_TTE: 38.0, Region_RWMA: '1', VHD: 'mild'
        });
        setDemoNotice('Loaded Case 1: Acute Anterior Ischemia Profile (FOR SOFTWARE TESTING ONLY)');
      } else if (fixtureKey === 'silent_diabetic_cad') {
        setFormData({
          Age: 59, Sex: 'Female', Weight: 79, Length: 161, BMI: 30.48,
          DM: 'Y', HTN: 'Y', Current_Smoker: 'N', Ex_Smoker: 'N', FH: 'Y', Obesity: 'Y',
          CRF: 'N', CVA: 'N', Airway_disease: 'N', Thyroid_Disease: 'N', CHF: 'N', DLP: 'Y',
          BP: 148, PR: 80, Edema: 'Y', Weak_Peripheral_Pulse: 'N', Lung_Rales: 'N',
          Systolic_Murmur: 'N', Diastolic_Murmur: 'N',
          Typical_Chest_Pain: 'N', Atypical_Chest_Pain: 'Y', Nonanginal_Chest_Pain: 'N',
          Exertional_CP: 'Y', LowTH_Angina: 'N',
          Q_Wave: '0', St_Elevation: '0', St_Depression: '1', Tinversion: '1', LVH: 'Y', Poor_R_Progression: 'Y',
          FBS: 195.0, CR: 1.35, TG: 285.0, LDL: 158.0, HDL: 36.0, BUN: 26.0, ESR: 32.0,
          HB: 12.8, K: 4.5, Na: 138.0, WBC: 9100.0, Lymph: 22.0, Neut: 74.0, PLT: 275.0,
          EF_TTE: 45.0, Region_RWMA: '2', VHD: 'Moderate'
        });
        setDemoNotice('Loaded Case 2: Silent Diabetic Microvascular CAD (FOR SOFTWARE TESTING ONLY)');
      } else if (fixtureKey === 'young_familial_cad') {
        setFormData({
          Age: 39, Sex: 'Male', Weight: 82, Length: 178, BMI: 25.88,
          DM: 'N', HTN: 'Y', Current_Smoker: 'Y', Ex_Smoker: 'N', FH: 'Y', Obesity: 'N',
          CRF: 'N', CVA: 'N', Airway_disease: 'N', Thyroid_Disease: 'N', CHF: 'N', DLP: 'Y',
          BP: 138, PR: 72, Edema: 'N', Weak_Peripheral_Pulse: 'N', Lung_Rales: 'N',
          Systolic_Murmur: 'N', Diastolic_Murmur: 'N',
          Typical_Chest_Pain: 'N', Atypical_Chest_Pain: 'Y', Nonanginal_Chest_Pain: 'N',
          Exertional_CP: 'N', LowTH_Angina: 'N',
          Q_Wave: '0', St_Elevation: '0', St_Depression: '0', Tinversion: '0', LVH: 'N', Poor_R_Progression: 'N',
          FBS: 96.0, CR: 0.95, TG: 220.0, LDL: 210.0, HDL: 38.0, BUN: 15.0, ESR: 10.0,
          HB: 15.1, K: 4.2, Na: 141.0, WBC: 7200.0, Lymph: 31.0, Neut: 62.0, PLT: 240.0,
          EF_TTE: 55.0, Region_RWMA: '0', VHD: 'N'
        });
        setDemoNotice('Loaded Case 3: Young Familial Hypercholesterolemia (FOR SOFTWARE TESTING ONLY)');
      } else {
        setFormData({
          Age: 42, Sex: 'Female', Weight: 62, Length: 166, BMI: 22.5,
          DM: 'N', HTN: 'N', Current_Smoker: 'N', Ex_Smoker: 'N', FH: 'N', Obesity: 'N',
          CRF: 'N', CVA: 'N', Airway_disease: 'N', Thyroid_Disease: 'N', CHF: 'N', DLP: 'N',
          BP: 118, PR: 68, Edema: 'N', Weak_Peripheral_Pulse: 'N', Lung_Rales: 'N',
          Systolic_Murmur: 'N', Diastolic_Murmur: 'N',
          Typical_Chest_Pain: 'N', Atypical_Chest_Pain: 'N', Nonanginal_Chest_Pain: 'N',
          Exertional_CP: 'N', LowTH_Angina: 'N',
          Q_Wave: '0', St_Elevation: '0', St_Depression: '0', Tinversion: '0', LVH: 'N', Poor_R_Progression: 'N',
          FBS: 88.0, CR: 0.85, TG: 105.0, LDL: 92.0, HDL: 58.0, BUN: 14.0, ESR: 8.0,
          HB: 13.2, K: 4.1, Na: 141.0, WBC: 6100.0, Lymph: 34.0, Neut: 58.0, PLT: 225.0,
          EF_TTE: 60.0, Region_RWMA: '0', VHD: 'N'
        });
        setDemoNotice('Loaded Case 4: Healthy Screening Case (FOR SOFTWARE TESTING ONLY)');
      }
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setApiError(null);
    try {
      const res = await api.validateData(formData);
      setValidationResult(res);
    } catch (err: any) {
      setApiError(err.message || 'Validation request failed.');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePredict = async () => {
    setIsPredicting(true);
    setApiError(null);
    try {
      const pred = await api.predict(formData, true);
      onPredictionComplete(pred, formData);
    } catch (err: any) {
      setApiError(err.message || 'Analysis prediction failed.');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Header & Demo Loaders */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Clinical Data Ingestion</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Patient Clinical Measurements
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Input verified patient parameters grouped across demographics, vital signs, ECG, laboratory chemistry, and echocardiography.
          </p>
        </div>

        {/* 4 Clinical Archetype Demo Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => loadDemo('acute_anterior_cad')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors flex items-center space-x-1"
            title="Severe LAD stenosis, exertional typical chest pain, anterior wall infarct risk"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Case 1: Anterior Ischemia (LAD)</span>
          </button>
          <button
            onClick={() => loadDemo('silent_diabetic_cad')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-xl border border-amber-200 transition-colors flex items-center space-x-1"
            title="Longstanding diabetes, dyslipidemia, atypical symptoms, diffuse multi-vessel CAD"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Case 2: Diabetic Microvascular</span>
          </button>
          <button
            onClick={() => loadDemo('young_familial_cad')}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200 transition-colors flex items-center space-x-1"
            title="Young age (39), severe hypercholesterolemia (LDL 210), paternal history of early MI"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Case 3: Familial Hyperchol.</span>
          </button>
          <button
            onClick={() => loadDemo('low_risk_healthy')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors flex items-center space-x-1"
            title="Normal blood pressure, lipids, normal ECG, absence of chest pain"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Case 4: Healthy Screening</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Demo Notice Banner */}
      {demoNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-600" />
            <span>{demoNotice}</span>
          </div>
          <span className="text-[10px] bg-amber-200/60 px-2 py-0.5 rounded uppercase font-bold text-amber-800">
            Synthetic Fixture
          </span>
        </div>
      )}

      {/* API Error Notification */}
      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Execution Error:</div>
            <div>{apiError}</div>
          </div>
        </div>
      )}

      {/* Data Quality Live Banner (Differentiator A) */}
      {validationResult && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  validationResult.is_ready_for_prediction
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {validationResult.is_ready_for_prediction ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Data Quality Audit Result
                </div>
                <div className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <span>Score: {validationResult.quality_score} / 100</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      validationResult.quality_score >= 85
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : validationResult.quality_score >= 60
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {validationResult.quality_grade}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 max-w-xs text-left sm:text-right">
              {validationResult.is_ready_for_prediction ? (
                <span className="text-emerald-700 font-semibold flex items-center sm:justify-end space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ready for Calibrated Model Inference</span>
                </span>
              ) : (
                <span className="text-rose-700 font-semibold flex items-center sm:justify-end space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Requires Correction Before Prediction</span>
                </span>
              )}
            </div>
          </div>

          {/* Warnings List */}
          {validationResult.warnings.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800">Quality Flags Detected:</div>
              <div className="space-y-1.5">
                {validationResult.warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
                      w.severity === 'error'
                        ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                        : 'bg-amber-50/80 border-amber-200 text-amber-900'
                    }`}
                  >
                    <AlertCircle
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        w.severity === 'error' ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    />
                    <div>
                      <span className="font-bold">[{w.field}]: </span>
                      <span>{w.message} </span>
                      <span className="text-slate-600 font-medium italic">
                        (Action: {w.suggested_action})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Imputation Notices */}
          {validationResult.imputation_notices.length > 0 && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-700">Imputation & Preprocessing Transparency:</div>
              <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                {validationResult.imputation_notices.map((notice, idx) => (
                  <li key={idx}>{notice}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[11px] text-slate-400 italic">
            {validationResult.disclaimer}
          </div>
        </div>
      )}

      {/* Structured Clinical Form */}
      <div className="space-y-6">
        {/* Section A: Demographics */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Section A: Demographics & Biometrics</h3>
            <p className="text-xs text-slate-500">Core patient demographic and body composition factors.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.Age}
                  onChange={(e) => handleInputChange('Age', e.target.value)}
                  placeholder="e.g. 58"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">years</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Biological Sex <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.Sex}
                onChange={(e) => handleInputChange('Sex', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weight</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.Weight}
                  onChange={(e) => handleInputChange('Weight', e.target.value)}
                  placeholder="e.g. 78"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">kg</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Height / Length</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.Length}
                  onChange={(e) => handleInputChange('Length', e.target.value)}
                  placeholder="e.g. 172"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">BMI (Auto-calculated)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.BMI}
                  onChange={(e) => handleInputChange('BMI', e.target.value)}
                  placeholder="e.g. 26.3"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">kg/m²</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Vital Signs & Medical History */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Section B: Vital Signs & Risk History</h3>
            <p className="text-xs text-slate-500">Hemodynamics, cardiovascular risk factors, and systemic comorbidities.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Systolic BP <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.BP}
                  onChange={(e) => handleInputChange('BP', e.target.value)}
                  placeholder="e.g. 135"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">mmHg</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pulse Rate (PR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.PR}
                  onChange={(e) => handleInputChange('PR', e.target.value)}
                  placeholder="e.g. 75"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">bpm</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Diabetes Mellitus (DM)</label>
              <select
                value={formData.DM}
                onChange={(e) => handleInputChange('DM', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hypertension (HTN)</label>
              <select
                value={formData.HTN}
                onChange={(e) => handleInputChange('HTN', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Smoker</label>
              <select
                value={formData.Current_Smoker}
                onChange={(e) => handleInputChange('Current_Smoker', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ex-Smoker</label>
              <select
                value={formData.Ex_Smoker}
                onChange={(e) => handleInputChange('Ex_Smoker', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Family History of CAD</label>
              <select
                value={formData.FH}
                onChange={(e) => handleInputChange('FH', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dyslipidemia (DLP)</label>
              <select
                value={formData.DLP}
                onChange={(e) => handleInputChange('DLP', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section C: Symptoms & Chest Pain */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Section C: Chest Pain Symptoms</h3>
            <p className="text-xs text-slate-500">Subjective symptoms and anginal presentations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Typical Chest Pain</label>
              <select
                value={formData.Typical_Chest_Pain}
                onChange={(e) => handleInputChange('Typical_Chest_Pain', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Atypical Chest Pain</label>
              <select
                value={formData.Atypical_Chest_Pain}
                onChange={(e) => handleInputChange('Atypical_Chest_Pain', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nonanginal Pain</label>
              <select
                value={formData.Nonanginal_Chest_Pain}
                onChange={(e) => handleInputChange('Nonanginal_Chest_Pain', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exertional CP</label>
              <select
                value={formData.Exertional_CP}
                onChange={(e) => handleInputChange('Exertional_CP', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Low-Threshold Angina</label>
              <select
                value={formData.LowTH_Angina}
                onChange={(e) => handleInputChange('LowTH_Angina', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section D: ECG Findings */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Section D: Electrocardiogram (ECG)</h3>
            <p className="text-xs text-slate-500">Resting 12-lead ECG ischemic indicators and conduction patterns.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ST Elevation</label>
              <select
                value={formData.St_Elevation}
                onChange={(e) => handleInputChange('St_Elevation', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="0">0 (Absent)</option>
                <option value="1">1 (Present)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ST Depression</label>
              <select
                value={formData.St_Depression}
                onChange={(e) => handleInputChange('St_Depression', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="0">0 (Absent)</option>
                <option value="1">1 (Present)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">T-Wave Inversion</label>
              <select
                value={formData.Tinversion}
                onChange={(e) => handleInputChange('Tinversion', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="0">0 (Absent)</option>
                <option value="1">1 (Present)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pathological Q-Wave</label>
              <select
                value={formData.Q_Wave}
                onChange={(e) => handleInputChange('Q_Wave', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="0">0 (Absent)</option>
                <option value="1">1 (Present)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LV Hypertrophy (LVH)</label>
              <select
                value={formData.LVH}
                onChange={(e) => handleInputChange('LVH', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Poor R Progression</label>
              <select
                value={formData.Poor_R_Progression}
                onChange={(e) => handleInputChange('Poor_R_Progression', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section E: Laboratory Measurements */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Section E: Laboratory Chemistry & Lipid Panel</h3>
            <p className="text-xs text-slate-500">Serum biochemistry, renal profile, and inflammatory biomarkers.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fasting Blood Sugar</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.FBS}
                  onChange={(e) => handleInputChange('FBS', e.target.value)}
                  placeholder="e.g. 105"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">mg/dL</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LDL Cholesterol</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.LDL}
                  onChange={(e) => handleInputChange('LDL', e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">mg/dL</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">HDL Cholesterol</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.HDL}
                  onChange={(e) => handleInputChange('HDL', e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">mg/dL</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Triglycerides (TG)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.TG}
                  onChange={(e) => handleInputChange('TG', e.target.value)}
                  placeholder="e.g. 160"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">mg/dL</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Creatinine (CR)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.CR}
                  onChange={(e) => handleInputChange('CR', e.target.value)}
                  placeholder="e.g. 1.0"
                  step="0.1"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">mg/dL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section F: Echocardiography */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Section F: Echocardiography (TTE)</h3>
            <p className="text-xs text-slate-500">Left ventricular systolic function and regional wall motion abnormalities.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ejection Fraction (EF-TTE)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.EF_TTE}
                  onChange={(e) => handleInputChange('EF_TTE', e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Region with RWMA</label>
              <select
                value={formData.Region_RWMA}
                onChange={(e) => handleInputChange('Region_RWMA', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="0">0 (None)</option>
                <option value="1">1 (Anterior Wall)</option>
                <option value="2">2 (Inferior / Posterior)</option>
                <option value="3">3 (Septal / Apical)</option>
                <option value="4">4 (Diffuse / Multi-segment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valvular Heart Disease (VHD)</label>
              <select
                value={formData.VHD}
                onChange={(e) => handleInputChange('VHD', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="N">Normal (None)</option>
                <option value="mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Fields marked with <span className="text-rose-500 font-bold">*</span> are critical required inputs.
          Unfilled laboratory fields will be transparently imputed using cohort medians.
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 transition-all flex items-center justify-center space-x-1.5"
          >
            {isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            )}
            <span>Validate Data</span>
          </button>

          <button
            onClick={handlePredict}
            disabled={isPredicting}
            className="flex-1 sm:flex-none px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center space-x-2"
          >
            {isPredicting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Run Risk Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
