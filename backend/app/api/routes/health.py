"""
CardioVision AI - Health & System Status Endpoints
"""

from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.ml.model_loader import registry
from backend.app.ml.schema import (
    NUMERICAL_FEATURES, 
    CATEGORICAL_FEATURES, 
    TARGET_COLUMNS
)

router = APIRouter(tags=["System & Health"])

@router.get("/health")
def health_check():
    """Returns runtime health, model artifact loading status, and version."""
    meta = registry.get_metadata() or {}
    return {
        "status": "online" if registry.is_loaded else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "models_loaded": registry.is_loaded,
        "load_error": registry.load_error,
        "dataset_source": meta.get("dataset_source", "Unknown"),
        "is_synthetic_model": meta.get("is_synthetic_dataset", False),
        "supported_targets": TARGET_COLUMNS
    }

@router.get("/model-info")
def model_info():
    """Returns feature schemas, units, physiological ranges, and demo patient fixtures."""
    meta = registry.get_metadata() or {}
    
    # Pre-defined demonstration fixtures clearly labeled for software testing only
    demo_patients = {
        "acute_anterior_cad": {
            "label": "Case 1: Acute Anterior Ischemia Profile (Elevated LAD Risk)",
            "description": "64yo male with exertional typical chest pain, ST-elevation & depression, smoking, and reduced ejection fraction.",
            "data": {
                "Age": 64, "Sex": "Male", "Weight": 86, "Length": 172, "BMI": 29.07,
                "DM": "Y", "HTN": "Y", "Current_Smoker": "Y", "Ex_Smoker": "N", "FH": "Y", "Obesity": "Y",
                "CRF": "N", "CVA": "N", "Airway_disease": "N", "Thyroid_Disease": "N", "CHF": "N", "DLP": "Y",
                "BP": 155, "PR": 84, "Edema": "N", "Weak_Peripheral_Pulse": "N", "Lung_Rales": "N",
                "Systolic_Murmur": "N", "Diastolic_Murmur": "N",
                "Typical_Chest_Pain": "Y", "Atypical_Chest_Pain": "N", "Nonanginal_Chest_Pain": "N",
                "Exertional_CP": "Y", "LowTH_Angina": "Y",
                "Q_Wave": "1", "St_Elevation": "1", "St_Depression": "1", "Tinversion": "1", "LVH": "Y", "Poor_R_Progression": "N",
                "FBS": 168.0, "CR": 1.25, "TG": 240.0, "LDL": 165.0, "HDL": 34.0, "BUN": 24.0, "ESR": 28.0,
                "HB": 14.5, "K": 4.3, "Na": 139.0, "WBC": 8800.0, "Lymph": 24.0, "Neut": 72.0, "PLT": 260.0,
                "EF_TTE": 38.0, "Region_RWMA": "1", "VHD": "mild"
            }
        },
        "silent_diabetic_cad": {
            "label": "Case 2: Silent Diabetic Microvascular CAD (Diffuse Multi-Vessel)",
            "description": "59yo female with longstanding type-2 diabetes, dyslipidemia, high fasting glucose, and atypical angina.",
            "data": {
                "Age": 59, "Sex": "Female", "Weight": 79, "Length": 161, "BMI": 30.48,
                "DM": "Y", "HTN": "Y", "Current_Smoker": "N", "Ex_Smoker": "N", "FH": "Y", "Obesity": "Y",
                "CRF": "N", "CVA": "N", "Airway_disease": "N", "Thyroid_Disease": "N", "CHF": "N", "DLP": "Y",
                "BP": 148, "PR": 80, "Edema": "Y", "Weak_Peripheral_Pulse": "N", "Lung_Rales": "N",
                "Systolic_Murmur": "N", "Diastolic_Murmur": "N",
                "Typical_Chest_Pain": "N", "Atypical_Chest_Pain": "Y", "Nonanginal_Chest_Pain": "N",
                "Exertional_CP": "Y", "LowTH_Angina": "N",
                "Q_Wave": "0", "St_Elevation": "0", "St_Depression": "1", "Tinversion": "1", "LVH": "Y", "Poor_R_Progression": "Y",
                "FBS": 195.0, "CR": 1.35, "TG": 285.0, "LDL": 158.0, "HDL": 36.0, "BUN": 26.0, "ESR": 32.0,
                "HB": 12.8, "K": 4.5, "Na": 138.0, "WBC": 9100.0, "Lymph": 22.0, "Neut": 74.0, "PLT": 275.0,
                "EF_TTE": 45.0, "Region_RWMA": "2", "VHD": "Moderate"
            }
        },
        "young_familial_cad": {
            "label": "Case 3: Young Familial Hypercholesterolemia (Premature Plaque Risk)",
            "description": "39yo male with strong paternal history of early MI, extreme LDL (210 mg/dL), and borderline hypertension.",
            "data": {
                "Age": 39, "Sex": "Male", "Weight": 82, "Length": 178, "BMI": 25.88,
                "DM": "N", "HTN": "Y", "Current_Smoker": "Y", "Ex_Smoker": "N", "FH": "Y", "Obesity": "N",
                "CRF": "N", "CVA": "N", "Airway_disease": "N", "Thyroid_Disease": "N", "CHF": "N", "DLP": "Y",
                "BP": 138, "PR": 72, "Edema": "N", "Weak_Peripheral_Pulse": "N", "Lung_Rales": "N",
                "Systolic_Murmur": "N", "Diastolic_Murmur": "N",
                "Typical_Chest_Pain": "N", "Atypical_Chest_Pain": "Y", "Nonanginal_Chest_Pain": "N",
                "Exertional_CP": "N", "LowTH_Angina": "N",
                "Q_Wave": "0", "St_Elevation": "0", "St_Depression": "0", "Tinversion": "0", "LVH": "N", "Poor_R_Progression": "N",
                "FBS": 96.0, "CR": 0.95, "TG": 220.0, "LDL": 210.0, "HDL": 38.0, "BUN": 15.0, "ESR": 10.0,
                "HB": 15.1, "K": 4.2, "Na": 141.0, "WBC": 7200.0, "Lymph": 31.0, "Neut": 62.0, "PLT": 240.0,
                "EF_TTE": 55.0, "Region_RWMA": "0", "VHD": "N"
            }
        },
        "low_risk_healthy": {
            "label": "Case 4: Healthy Screening Examination (Low Probability)",
            "description": "42yo female with normal blood pressure, lipid panel, normal ECG, and absence of symptoms.",
            "data": {
                "Age": 42, "Sex": "Female", "Weight": 62, "Length": 166, "BMI": 22.5,
                "DM": "N", "HTN": "N", "Current_Smoker": "N", "Ex_Smoker": "N", "FH": "N", "Obesity": "N",
                "CRF": "N", "CVA": "N", "Airway_disease": "N", "Thyroid_Disease": "N", "CHF": "N", "DLP": "N",
                "BP": 118, "PR": 68, "Edema": "N", "Weak_Peripheral_Pulse": "N", "Lung_Rales": "N",
                "Systolic_Murmur": "N", "Diastolic_Murmur": "N",
                "Typical_Chest_Pain": "N", "Atypical_Chest_Pain": "N", "Nonanginal_Chest_Pain": "N",
                "Exertional_CP": "N", "LowTH_Angina": "N",
                "Q_Wave": "0", "St_Elevation": "0", "St_Depression": "0", "Tinversion": "0", "LVH": "N", "Poor_R_Progression": "N",
                "FBS": 88.0, "CR": 0.85, "TG": 105.0, "LDL": 92.0, "HDL": 58.0, "BUN": 14.0, "ESR": 8.0,
                "HB": 13.2, "K": 4.1, "Na": 141.0, "WBC": 6100.0, "Lymph": 34.0, "Neut": 58.0, "PLT": 225.0,
                "EF_TTE": 60.0, "Region_RWMA": "0", "VHD": "N"
            }
        }
    }
    
    return {
        "metadata": meta,
        "numerical_features": NUMERICAL_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "supported_targets": TARGET_COLUMNS,
        "demo_fixtures": demo_patients
    }
