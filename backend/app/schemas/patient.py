"""
CardioVision AI - Patient Input and Data Quality Schemas
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class PatientInputSchema(BaseModel):
    # Demographics
    Age: Optional[float] = Field(None, description="Age in years")
    Sex: Optional[str] = Field(None, description="'Male' or 'Female'")
    Weight: Optional[float] = Field(None, description="Weight in kg")
    Length: Optional[float] = Field(None, description="Height / Length in cm")
    BMI: Optional[float] = Field(None, description="Body Mass Index kg/m²")
    
    # Risk factors & History
    DM: Optional[str] = Field(None, description="Diabetes Mellitus ('Y' or 'N')")
    HTN: Optional[str] = Field(None, description="Hypertension ('Y' or 'N')")
    Current_Smoker: Optional[str] = Field(None, description="Current Smoker ('Y' or 'N')")
    Ex_Smoker: Optional[str] = Field(None, description="Ex-Smoker ('Y' or 'N')")
    FH: Optional[str] = Field(None, description="Family History of CAD ('Y' or 'N')")
    Obesity: Optional[str] = Field(None, description="Obesity ('Y' or 'N')")
    CRF: Optional[str] = Field(None, description="Chronic Renal Failure ('Y' or 'N')")
    CVA: Optional[str] = Field(None, description="Cerebrovascular Accident ('Y' or 'N')")
    Airway_disease: Optional[str] = Field(None, description="Airway Disease ('Y' or 'N')")
    Thyroid_Disease: Optional[str] = Field(None, description="Thyroid Disease ('Y' or 'N')")
    CHF: Optional[str] = Field(None, description="Congestive Heart Failure ('Y' or 'N')")
    DLP: Optional[str] = Field(None, description="Dyslipidemia ('Y' or 'N')")
    
    # Vital signs & Physical examination
    BP: Optional[float] = Field(None, description="Systolic Blood Pressure in mmHg")
    PR: Optional[float] = Field(None, description="Pulse Rate in bpm")
    Edema: Optional[str] = Field(None, description="Peripheral Edema ('Y' or 'N')")
    Weak_Peripheral_Pulse: Optional[str] = Field(None, description="Weak Peripheral Pulse ('Y' or 'N')")
    Lung_Rales: Optional[str] = Field(None, description="Lung Rales ('Y' or 'N')")
    Systolic_Murmur: Optional[str] = Field(None, description="Systolic Murmur ('Y' or 'N')")
    Diastolic_Murmur: Optional[str] = Field(None, description="Diastolic Murmur ('Y' or 'N')")
    
    # Chest pain symptoms
    Typical_Chest_Pain: Optional[str] = Field(None, description="Typical Chest Pain ('Y' or 'N')")
    Atypical_Chest_Pain: Optional[str] = Field(None, description="Atypical Chest Pain ('Y' or 'N')")
    Nonanginal_Chest_Pain: Optional[str] = Field(None, description="Nonanginal Chest Pain ('Y' or 'N')")
    Exertional_CP: Optional[str] = Field(None, description="Exertional Chest Pain ('Y' or 'N')")
    LowTH_Angina: Optional[str] = Field(None, description="Low Threshold Angina ('Y' or 'N')")
    
    # ECG findings
    Q_Wave: Optional[str] = Field(None, description="ECG Q Wave ('0' or '1')")
    St_Elevation: Optional[str] = Field(None, description="ECG ST Elevation ('0' or '1')")
    St_Depression: Optional[str] = Field(None, description="ECG ST Depression ('0' or '1')")
    Tinversion: Optional[str] = Field(None, description="ECG T-Wave Inversion ('0' or '1')")
    LVH: Optional[str] = Field(None, description="Left Ventricular Hypertrophy ('Y' or 'N')")
    Poor_R_Progression: Optional[str] = Field(None, description="Poor R Wave Progression ('Y' or 'N')")
    
    # Laboratory tests
    FBS: Optional[float] = Field(None, description="Fasting Blood Sugar mg/dL")
    CR: Optional[float] = Field(None, description="Creatinine mg/dL")
    TG: Optional[float] = Field(None, description="Triglycerides mg/dL")
    LDL: Optional[float] = Field(None, description="LDL Cholesterol mg/dL")
    HDL: Optional[float] = Field(None, description="HDL Cholesterol mg/dL")
    BUN: Optional[float] = Field(None, description="Blood Urea Nitrogen mg/dL")
    ESR: Optional[float] = Field(None, description="Erythrocyte Sed. Rate mm/h")
    HB: Optional[float] = Field(None, description="Hemoglobin g/dL")
    K: Optional[float] = Field(None, description="Potassium mEq/L")
    Na: Optional[float] = Field(None, description="Sodium mEq/L")
    WBC: Optional[float] = Field(None, description="White Blood Cell Count cells/mcL")
    Lymph: Optional[float] = Field(None, description="Lymphocyte Ratio %")
    Neut: Optional[float] = Field(None, description="Neutrophil Ratio %")
    PLT: Optional[float] = Field(None, description="Platelet Count 1000/mcL")
    
    # Echocardiography
    EF_TTE: Optional[float] = Field(None, description="Ejection Fraction %")
    Region_RWMA: Optional[str] = Field(None, description="Regional Wall Motion Abnormality ('0' to '4')")
    VHD: Optional[str] = Field(None, description="Valvular Heart Disease ('N', 'mild', 'Moderate', 'Severe')")

    class Config:
        extra = "allow"

class DataQualityWarning(BaseModel):
    field: str
    severity: str  # "error", "warning", "info"
    message: str
    entered_value: Any
    suggested_action: str

class ValidationResponse(BaseModel):
    is_ready_for_prediction: bool
    quality_score: float  # 0 to 100
    quality_grade: str    # "High Quality", "Acceptable with Warnings", "Degraded Quality"
    missing_critical_fields: List[str]
    missing_imputable_fields: List[str]
    implausible_fields: List[str]
    out_of_distribution_fields: List[str]
    warnings: List[DataQualityWarning]
    imputation_notices: List[str]
    disclaimer: str = (
        "Data quality assessment evaluates numerical plausibility and model distribution match. "
        "It is NOT a medical diagnosis or clinical assessment."
    )
    normalized_data: Optional[Dict[str, Any]] = None
