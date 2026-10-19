export interface DataQualityWarning {
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  entered_value: any;
  suggested_action: string;
}

export interface ValidationResponse {
  is_ready_for_prediction: boolean;
  quality_score: number;
  quality_grade: string;
  missing_critical_fields: string[];
  missing_imputable_fields: string[];
  implausible_fields: string[];
  out_of_distribution_fields: string[];
  warnings: DataQualityWarning[];
  imputation_notices: string[];
  disclaimer: string;
  normalized_data?: Record<string, any>;
}

export interface VesselRiskEstimate {
  target: string;
  vessel_name: string;
  estimated_probability: number;
  percentage: number;
  risk_level: string;
  uncertainty_level: string;
  confidence_interval_95: [number, number];
  prediction_variance: number;
  calibration_status: string;
  uncertainty_reasons: string[];
}

export interface PredictionResponse {
  prediction_id: string;
  timestamp: string;
  model_version: string;
  dataset_source: string;
  is_synthetic_model: boolean;
  cad: VesselRiskEstimate;
  lad: VesselRiskEstimate;
  lcx: VesselRiskEstimate;
  rca: VesselRiskEstimate;
  data_quality_score: number;
  data_quality_grade: string;
  quality_warnings: DataQualityWarning[];
  imputation_applied: boolean;
  imputed_fields: string[];
  disclaimer: string;
}

export interface FeatureAttribution {
  feature: string;
  display_name: string;
  patient_value: any;
  unit: string;
  attribution: number;
  abs_attribution: number;
  direction: 'Increases Risk' | 'Decreases Risk';
  clinical_note: string;
}

export interface ExplainResponse {
  target: string;
  base_value: number;
  patient_predicted_probability: number;
  top_features: FeatureAttribution[];
  causation_disclaimer: string;
}

export interface ModelMetricsData {
  target: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number | null;
  brier_score: number;
  confusion_matrix: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
    matrix: number[][];
  };
  sample_counts: {
    train_samples: number;
    test_samples: number;
    total_samples: number;
    positive_class_count: number;
    negative_class_count: number;
    prevalence: number;
  };
  calibration_curve: Array<{ bin: number; predicted: number; observed: number }>;
  evaluation_strategy: string;
}

export interface SystemHealth {
  status: string;
  service: string;
  version: string;
  models_loaded: boolean;
  load_error: string | null;
  dataset_source: string;
  is_synthetic_model: boolean;
  supported_targets: string[];
}

export interface HistoryRecord {
  id: string;
  created_at: string;
  model_version: string;
  cad_probability: number;
  lad_probability: number;
  lcx_probability: number;
  rca_probability: number;
  data_quality_score: number;
  data_quality_grade: string;
  imputation_applied: boolean;
}

export interface VesselDelta {
  target: string;
  vessel_name: string;
  baseline_pct: number;
  simulated_pct: number;
  absolute_delta_pct: number;
  relative_reduction_pct: number;
  direction: 'Risk Reduced' | 'Risk Increased' | 'Unchanged';
}

export interface SimulationResponse {
  cad: VesselDelta;
  lad: VesselDelta;
  lcx: VesselDelta;
  rca: VesselDelta;
  modified_factors: Array<{ field: string; original: any; simulated: any }>;
  clinical_guidance: string[];
  disclaimer: string;
}

