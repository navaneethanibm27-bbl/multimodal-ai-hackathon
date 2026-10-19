"""
CardioVision AI - Prediction and Explainability Schemas
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.patient import PatientInputSchema, DataQualityWarning

class PredictionRequest(BaseModel):
    features: Dict[str, Any]
    enable_uncertainty_quantification: bool = True
    save_to_history: bool = False

class VesselRiskEstimate(BaseModel):
    target: str
    vessel_name: str
    estimated_probability: float
    percentage: float
    risk_level: str  # "Low (<25%)", "Intermediate (25-50%)", "Elevated (50-75%)", "High (>=75%)"
    # Differentiator B: Uncertainty-Aware
    uncertainty_level: str  # "Stable", "Moderate Variability", "High Uncertainty"
    confidence_interval_95: List[float]  # [lower, upper] based on bootstrap / tree ensemble variability
    prediction_variance: float
    calibration_status: str  # "Calibrated via 5-Fold Platt Scaling"
    uncertainty_reasons: List[str]

class PredictionResponse(BaseModel):
    prediction_id: str
    timestamp: str
    model_version: str
    dataset_source: str
    is_synthetic_model: bool
    
    # 4 Required targets
    cad: VesselRiskEstimate
    lad: VesselRiskEstimate
    lcx: VesselRiskEstimate
    rca: VesselRiskEstimate
    
    # Differentiator A & B
    data_quality_score: float
    data_quality_grade: str
    quality_warnings: List[DataQualityWarning]
    imputation_applied: bool
    imputed_fields: List[str]
    
    # Medical Safety Disclaimer
    disclaimer: str = (
        "This application is an experimental research and educational tool. "
        "Its outputs are model-estimated probabilities and must not be used as a diagnosis "
        "or to make treatment decisions. It is not a substitute for evaluation by a qualified "
        "healthcare professional or appropriate diagnostic imaging."
    )

class ExplainRequest(BaseModel):
    features: Dict[str, Any]
    target: str = Field("CAD", description="One of 'CAD', 'LAD', 'LCX', 'RCA'")
    top_n: int = Field(10, description="Number of top influential features to return")

class FeatureAttribution(BaseModel):
    feature: str
    display_name: str
    patient_value: Any
    unit: str
    attribution: float  # SHAP value
    abs_attribution: float
    direction: str      # "Increases Risk" or "Decreases Risk"
    clinical_note: str

class ExplainResponse(BaseModel):
    target: str
    base_value: float
    patient_predicted_probability: float
    top_features: List[FeatureAttribution]
    causation_disclaimer: str = (
        "Feature attribution reflects statistical associations captured by the model, "
        "NOT direct medical causation. An attributed factor should not be interpreted "
        "as the singular physiological cause of stenosis or CAD."
    )

class VesselDelta(BaseModel):
    target: str
    vessel_name: str
    baseline_pct: float
    simulated_pct: float
    absolute_delta_pct: float  # e.g. -12.5%
    relative_reduction_pct: float  # e.g. -20.8%
    direction: str  # "Risk Reduced" | "Risk Increased" | "Unchanged"

class SimulationRequest(BaseModel):
    baseline_features: Dict[str, Any]
    intervention_features: Dict[str, Any]

class SimulationResponse(BaseModel):
    cad: VesselDelta
    lad: VesselDelta
    lcx: VesselDelta
    rca: VesselDelta
    modified_factors: List[Dict[str, Any]]
    clinical_guidance: List[str]
    disclaimer: str = (
        "Simulated risk reductions represent model sensitivity estimates based on observed "
        "cohort data and do NOT guarantee individual therapeutic response."
    )
