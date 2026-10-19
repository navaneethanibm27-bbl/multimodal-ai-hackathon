"""
CardioVision AI - Clinical Feature & Target Schema
Based on the Z-Alizadeh Sani Cardiovascular Disease Dataset standard schema.
"""

from typing import Dict, List, Any

# Target columns in the dataset
TARGET_CAD = "CAD"
TARGET_LAD = "LAD"
TARGET_LCX = "LCX"
TARGET_RCA = "RCA"

TARGET_COLUMNS = [TARGET_CAD, TARGET_LAD, TARGET_LCX, TARGET_RCA]

# Columns to strictly exclude from model inputs to prevent data leakage
LEAKAGE_COLUMNS = [
    "Cath", "Cath_Result", "CAD", "Cad", "LAD", "LCX", "RCA", 
    "Stenosis", "Target", "Outcome", "Patient_ID", "ID"
]

# Continuous numerical features with their plausible physiological range and units
NUMERICAL_FEATURES: Dict[str, Dict[str, Any]] = {
    "Age": {"type": "int", "unit": "years", "min": 18, "max": 105, "default": 55, "label": "Age"},
    "Weight": {"type": "float", "unit": "kg", "min": 35.0, "max": 200.0, "default": 72.0, "label": "Weight"},
    "Length": {"type": "float", "unit": "cm", "min": 120.0, "max": 220.0, "default": 168.0, "label": "Height / Length"},
    "BMI": {"type": "float", "unit": "kg/m²", "min": 12.0, "max": 60.0, "default": 25.5, "label": "Body Mass Index"},
    "BP": {"type": "int", "unit": "mmHg", "min": 70, "max": 250, "default": 130, "label": "Systolic Blood Pressure"},
    "PR": {"type": "int", "unit": "bpm", "min": 40, "max": 180, "default": 75, "label": "Pulse Rate"},
    "FBS": {"type": "float", "unit": "mg/dL", "min": 40.0, "max": 500.0, "default": 105.0, "label": "Fasting Blood Sugar"},
    "CR": {"type": "float", "unit": "mg/dL", "min": 0.2, "max": 12.0, "default": 1.0, "label": "Creatinine"},
    "TG": {"type": "float", "unit": "mg/dL", "min": 20.0, "max": 1200.0, "default": 150.0, "label": "Triglycerides"},
    "LDL": {"type": "float", "unit": "mg/dL", "min": 10.0, "max": 400.0, "default": 110.0, "label": "LDL Cholesterol"},
    "HDL": {"type": "float", "unit": "mg/dL", "min": 10.0, "max": 150.0, "default": 45.0, "label": "HDL Cholesterol"},
    "BUN": {"type": "float", "unit": "mg/dL", "min": 3.0, "max": 120.0, "default": 18.0, "label": "Blood Urea Nitrogen"},
    "ESR": {"type": "float", "unit": "mm/h", "min": 1.0, "max": 150.0, "default": 15.0, "label": "Erythrocyte Sed. Rate"},
    "HB": {"type": "float", "unit": "g/dL", "min": 5.0, "max": 22.0, "default": 13.8, "label": "Hemoglobin"},
    "K": {"type": "float", "unit": "mEq/L", "min": 2.0, "max": 8.0, "default": 4.2, "label": "Potassium"},
    "Na": {"type": "float", "unit": "mEq/L", "min": 110.0, "max": 170.0, "default": 140.0, "label": "Sodium"},
    "WBC": {"type": "float", "unit": "cells/mcL", "min": 1500.0, "max": 35000.0, "default": 7200.0, "label": "White Blood Cell Count"},
    "Lymph": {"type": "float", "unit": "%", "min": 2.0, "max": 80.0, "default": 32.0, "label": "Lymphocyte Ratio"},
    "Neut": {"type": "float", "unit": "%", "min": 15.0, "max": 95.0, "default": 62.0, "label": "Neutrophil Ratio"},
    "PLT": {"type": "float", "unit": "1000/mcL", "min": 20.0, "max": 1000.0, "default": 240.0, "label": "Platelet Count"},
    "EF_TTE": {"type": "float", "unit": "%", "min": 10.0, "max": 85.0, "default": 50.0, "label": "Ejection Fraction (EF-TTE)"},
}

# Categorical features and their documented accepted categories
CATEGORICAL_FEATURES: Dict[str, Dict[str, Any]] = {
    "Sex": {"allowed": ["Male", "Female", "Fmale"], "default": "Male", "label": "Biological Sex"},
    "DM": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Diabetes Mellitus"},
    "HTN": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Hypertension"},
    "Current_Smoker": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Current Smoker"},
    "Ex_Smoker": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Ex-Smoker"},
    "FH": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Family History of CAD"},
    "Obesity": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Obesity"},
    "CRF": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Chronic Renal Failure"},
    "CVA": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Cerebrovascular Accident"},
    "Airway_disease": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Airway Disease"},
    "Thyroid_Disease": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Thyroid Disease"},
    "CHF": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Congestive Heart Failure"},
    "DLP": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Dyslipidemia"},
    "Edema": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Peripheral Edema"},
    "Weak_Peripheral_Pulse": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Weak Peripheral Pulse"},
    "Lung_Rales": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Lung Rales"},
    "Systolic_Murmur": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Systolic Murmur"},
    "Diastolic_Murmur": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Diastolic Murmur"},
    "Typical_Chest_Pain": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Typical Chest Pain"},
    "Atypical_Chest_Pain": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Atypical Chest Pain"},
    "Nonanginal_Chest_Pain": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Nonanginal Pain"},
    "Exertional_CP": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Exertional CP"},
    "LowTH_Angina": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Low Threshold Angina"},
    "Q_Wave": {"allowed": ["0", "1", "Y", "N"], "default": "0", "label": "ECG Q-Wave"},
    "St_Elevation": {"allowed": ["0", "1", "Y", "N"], "default": "0", "label": "ECG ST Elevation"},
    "St_Depression": {"allowed": ["0", "1", "Y", "N"], "default": "0", "label": "ECG ST Depression"},
    "Tinversion": {"allowed": ["0", "1", "Y", "N"], "default": "0", "label": "ECG T-Wave Inversion"},
    "LVH": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Left Ventricular Hypertrophy"},
    "Poor_R_Progression": {"allowed": ["Y", "N", "1", "0"], "default": "N", "label": "Poor R Wave Progression"},
    "Region_RWMA": {"allowed": ["0", "1", "2", "3", "4"], "default": "0", "label": "Regional Wall Motion Abnormality"},
    "VHD": {"allowed": ["N", "mild", "Moderate", "Severe"], "default": "N", "label": "Valvular Heart Disease"},
}

ALL_FEATURE_NAMES = list(NUMERICAL_FEATURES.keys()) + list(CATEGORICAL_FEATURES.keys())
