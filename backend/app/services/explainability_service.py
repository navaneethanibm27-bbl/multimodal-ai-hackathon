"""
CardioVision AI - Explainable AI (XAI) Service with SHAP
Differentiator D:
- True SHAP TreeExplainer attributions
- Patient-level feature attribution
- Directional impact (Increases vs Decreases Estimated Risk)
- Ranked top influential features
- Explicit association vs causation clinical disclaimer
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd
import shap

from backend.app.ml.schema import (
    TARGET_COLUMNS, 
    NUMERICAL_FEATURES, 
    CATEGORICAL_FEATURES
)
from backend.app.ml.model_loader import registry
from backend.app.services.data_validation import validate_patient_data
from backend.app.schemas.prediction import (
    ExplainRequest, 
    ExplainResponse, 
    FeatureAttribution
)

CLINICAL_FEATURE_NOTES = {
    "Age": "Advanced age is physiologically associated with progressive arterial stiffening and plaque accumulation.",
    "Typical_Chest_Pain": "Substernal chest discomfort precipitated by exertion is a classic clinical indicator of myocardial ischemia.",
    "DM": "Chronic hyperglycemia accelerates endothelial dysfunction, arterial inflammation, and plaque vulnerability.",
    "HTN": "Elevated systolic pressure causes repetitive shear stress and microvascular damage across coronary vessels.",
    "Current_Smoker": "Tobacco consumption promotes vasoconstriction, platelet activation, and lipid peroxidation.",
    "EF_TTE": "Decreased left ventricular ejection fraction often reflects chronic or acute ischemic myocardial impairment.",
    "St_Depression": "ST-segment depression on resting ECG strongly associates with subendocardial ischemia.",
    "St_Elevation": "ST-segment elevation signifies severe transmural myocardial injury or acute arterial occlusion.",
    "Region_RWMA": "Regional wall motion abnormality directly pinpoints ventricular segments with impaired perfusion.",
    "LDL": "Circulating low-density lipoproteins penetrate arterial intima, driving atheroma formation.",
    "HDL": "High-density lipoproteins facilitate reverse cholesterol transport, conferring an atheroprotective effect.",
    "TG": "Elevated triglycerides are linked with atherogenic remnant lipoproteins and metabolic syndrome.",
    "FBS": "Elevated fasting blood glucose correlates with insulin resistance and coronary microvascular compromise.",
    "BP": "High systolic pressure increases cardiac workload and coronary shear strain.",
    "PR": "Elevated resting pulse rate increases myocardial oxygen demand and shortens coronary perfusion time.",
    "Q_Wave": "Pathological Q-waves indicate past transmural myocardial infarction and non-viable scar tissue.",
    "Tinversion": "T-wave inversion represents altered repolarization commonly accompanying myocardial ischemia."
}

def clean_feature_name(raw_name: str) -> str:
    """Cleans OneHot / Scaler prefixes like 'num__Age' or 'cat__Sex_Male'."""
    clean = raw_name.replace("num__", "").replace("cat__", "")
    return clean

def explain_prediction(request: ExplainRequest) -> ExplainResponse:
    target = request.target.upper()
    if target not in TARGET_COLUMNS:
        raise ValueError(f"Invalid target '{request.target}'. Supported: {TARGET_COLUMNS}")
        
    validation = validate_patient_data(request.features)
    if not validation.is_ready_for_prediction:
        raise ValueError("Cannot compute explanation: patient data failed quality validation.")
        
    rf_pipeline = registry.get_rf_model(target)
    if rf_pipeline is None:
        raise RuntimeError(f"Trained Random Forest artifact for target {target} not available.")
        
    preprocessor = rf_pipeline.named_steps["preprocessor"]
    classifier = rf_pipeline.named_steps["classifier"]
    
    input_df = pd.DataFrame([validation.normalized_data])
    X_trans = preprocessor.transform(input_df)
    feature_names = [clean_feature_name(n) for n in preprocessor.get_feature_names_out()]
    
    # Run SHAP TreeExplainer
    explainer = shap.TreeExplainer(classifier)
    shap_values = explainer.shap_values(X_trans)
    
    # SHAP returns [array(N, F), array(N, F)] for binary class in some versions, or (N, F, 2), or (N, F)
    if isinstance(shap_values, list) and len(shap_values) == 2:
        val_for_class1 = shap_values[1][0]
        base_val = float(explainer.expected_value[1]) if isinstance(explainer.expected_value, (list, np.ndarray)) else float(explainer.expected_value)
    elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
        val_for_class1 = shap_values[0, :, 1]
        base_val = float(explainer.expected_value[1])
    else:
        val_for_class1 = shap_values[0] if isinstance(shap_values, np.ndarray) else shap_values
        base_val = float(explainer.expected_value) if not isinstance(explainer.expected_value, (list, np.ndarray)) else float(explainer.expected_value[0])
        
    patient_prob = float(classifier.predict_proba(X_trans)[0, 1])
    
    # Aggregate and group attributions back to primary features
    attributions: List[FeatureAttribution] = []
    
    for i, f_name in enumerate(feature_names):
        shap_val = float(val_for_class1[i])
        
        # Match back to original patient input
        # Feature name might be "Typical_Chest_Pain_Y" or "Age"
        orig_key = f_name.split("_")[0] if "_" in f_name and f_name.split("_")[0] in validation.normalized_data else f_name
        for cand in validation.normalized_data.keys():
            if f_name.startswith(cand):
                orig_key = cand
                break
                
        patient_val = validation.normalized_data.get(orig_key, "N/A")
        unit = NUMERICAL_FEATURES.get(orig_key, {}).get("unit", "")
        display = NUMERICAL_FEATURES.get(orig_key, {}).get("label") or CATEGORICAL_FEATURES.get(orig_key, {}).get("label") or f_name
        
        note = CLINICAL_FEATURE_NOTES.get(
            orig_key, 
            f"Statistically contributes to {target} decision logic based on observed cohort patterns."
        )
        
        attributions.append(FeatureAttribution(
            feature=f_name,
            display_name=display,
            patient_value=patient_val,
            unit=unit,
            attribution=round(shap_val, 4),
            abs_attribution=round(abs(shap_val), 4),
            direction="Increases Risk" if shap_val > 0 else "Decreases Risk",
            clinical_note=note
        ))
        
    # Sort by absolute impact and take top N
    attributions.sort(key=lambda x: x.abs_attribution, reverse=True)
    top_n = attributions[:request.top_n]
    
    return ExplainResponse(
        target=target,
        base_value=round(base_val, 4),
        patient_predicted_probability=round(patient_prob, 4),
        top_features=top_n
    )
