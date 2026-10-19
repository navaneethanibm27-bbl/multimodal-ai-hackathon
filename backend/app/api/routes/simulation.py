"""
CardioVision AI - Counterfactual "What-If" Intervention Simulator Endpoint
Evaluates hypothetical risk reductions resulting from preventative clinical interventions.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
import pandas as pd

from backend.app.schemas.prediction import (
    SimulationRequest,
    SimulationResponse,
    VesselDelta
)
from backend.app.ml.schema import TARGET_COLUMNS
from backend.app.ml.model_loader import registry
from backend.app.services.data_validation import validate_patient_data

router = APIRouter(tags=["Counterfactual Simulator"])

VESSEL_NAMES = {
    "CAD": "Overall Coronary Artery Disease (CAD)",
    "LAD": "Left Anterior Descending (LAD)",
    "LCX": "Left Circumflex (LCX)",
    "RCA": "Right Coronary Artery (RCA)"
}

def generate_clinical_guidance(modified: List[Dict[str, Any]]) -> List[str]:
    guidance = []
    for mod in modified:
        field = mod["field"]
        orig = mod["original"]
        new = mod["simulated"]
        
        if field == "BP" and float(orig) > float(new):
            delta = float(orig) - float(new)
            guidance.append(
                f"Systolic blood pressure reduction of {delta:.0f} mmHg decreases coronary mechanical shear strain, slowing endothelial micro-tear formation and intimal fibroatheroma progression."
            )
        elif field == "Current_Smoker" and str(orig).upper() == "Y" and str(new).upper() == "N":
            guidance.append(
                "Tobacco cessation immediately halts carbon monoxide-induced arterial hypoxia, reduces circulating thromboxane A2, and restores nitric oxide-mediated coronary vasodilation."
            )
        elif field == "LDL" and float(orig) > float(new):
            delta = float(orig) - float(new)
            guidance.append(
                f"Lowering LDL cholesterol by {delta:.0f} mg/dL (statin or PCSK9-i pathway) depletes the necrotic lipid core, thickening the fibrous plaque cap and significantly lowering rupture risk."
            )
        elif field == "FBS" and float(orig) > float(new):
            guidance.append(
                "Optimizing fasting blood glucose reduces circulating advanced glycation end-products (AGEs), attenuating accelerated microvascular sclerosis."
            )
        elif field == "BMI" and float(orig) > float(new):
            guidance.append(
                "Adiposity reduction decreases circulating inflammatory cytokines (IL-6, TNF-alpha) and improves systemic vascular compliance."
            )
            
    if not guidance:
        guidance.append("No significant modifiable biomarker changes detected in simulation scenario.")
    return guidance

@router.post("/simulate", response_model=SimulationResponse)
def simulate_counterfactual_risk(request: SimulationRequest):
    if not registry.is_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")

    # Validate baseline & intervention
    val_base = validate_patient_data(request.baseline_features)
    val_sim = validate_patient_data(request.intervention_features)

    if not val_base.is_ready_for_prediction or not val_sim.is_ready_for_prediction:
        raise HTTPException(status_code=422, detail="One or both simulation profiles failed quality validation.")

    df_base = pd.DataFrame([val_base.normalized_data])
    df_sim = pd.DataFrame([val_sim.normalized_data])

    deltas: Dict[str, VesselDelta] = {}

    for target in TARGET_COLUMNS:
        model = registry.get_model(target)
        p_base = float(model.predict_proba(df_base)[0, 1])
        p_sim = float(model.predict_proba(df_sim)[0, 1])

        pct_base = round(p_base * 100.0, 1)
        pct_sim = round(p_sim * 100.0, 1)
        abs_delta = round(pct_sim - pct_base, 1)

        rel_red = round(((pct_sim - pct_base) / max(pct_base, 0.1)) * 100.0, 1)

        if abs_delta < -0.5:
            direction = "Risk Reduced"
        elif abs_delta > 0.5:
            direction = "Risk Increased"
        else:
            direction = "Unchanged"

        deltas[target.lower()] = VesselDelta(
            target=target,
            vessel_name=VESSEL_NAMES[target],
            baseline_pct=pct_base,
            simulated_pct=pct_sim,
            absolute_delta_pct=abs_delta,
            relative_reduction_pct=rel_red,
            direction=direction
        )

    # Detect modified factors
    modified_factors = []
    for k, v_orig in request.baseline_features.items():
        v_new = request.intervention_features.get(k)
        if v_new is not None and str(v_orig) != str(v_new):
            modified_factors.append({
                "field": k,
                "original": v_orig,
                "simulated": v_new
            })

    guidance = generate_clinical_guidance(modified_factors)

    return SimulationResponse(
        cad=deltas["cad"],
        lad=deltas["lad"],
        lcx=deltas["lcx"],
        rca=deltas["rca"],
        modified_factors=modified_factors,
        clinical_guidance=guidance
    )
