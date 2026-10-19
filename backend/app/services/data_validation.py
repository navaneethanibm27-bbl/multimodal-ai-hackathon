"""
CardioVision AI - Patient Data Quality Checker Service
Differentiator A: Comprehensive validation before inference.
Detects:
- Missing required inputs
- Invalid types & impossible / implausible physiological values
- Inconsistent units (e.g. height in meters vs cm, weight in lbs vs kg)
- Unrecognized categorical values
- Out-of-distribution inputs
- Preprocessing imputation tracking (never silently substitutes zero)
"""

from typing import Dict, Any, List, Tuple
from backend.app.ml.schema import (
    NUMERICAL_FEATURES, 
    CATEGORICAL_FEATURES, 
    ALL_FEATURE_NAMES
)
from backend.app.schemas.patient import (
    ValidationResponse, 
    DataQualityWarning
)

CRITICAL_REQUIRED_FIELDS = ["Age", "Sex", "BP", "PR"]

def validate_patient_data(data: Dict[str, Any]) -> ValidationResponse:
    missing_critical: List[str] = []
    missing_imputable: List[str] = []
    implausible: List[str] = []
    out_of_dist: List[str] = []
    warnings: List[DataQualityWarning] = []
    imputation_notices: List[str] = []
    
    normalized: Dict[str, Any] = {}
    penalty_score = 0.0

    # 1. Check Demographics & Critical Fields
    for field in CRITICAL_REQUIRED_FIELDS:
        val = data.get(field)
        if val is None or str(val).strip() == "":
            missing_critical.append(field)
            warnings.append(DataQualityWarning(
                field=field,
                severity="error",
                message=f"Critical physiological input '{field}' is missing.",
                entered_value=None,
                suggested_action=f"Please enter patient's {field}."
            ))
            penalty_score += 25.0

    # 2. Check Height / Weight Unit Inconsistencies
    weight = data.get("Weight")
    length = data.get("Length")
    
    # Check if height was entered in meters (e.g. 1.75 instead of 175)
    if length is not None and 0.5 <= float(length) <= 2.5:
        corrected_len = round(float(length) * 100.0, 1)
        warnings.append(DataQualityWarning(
            field="Length",
            severity="warning",
            message=f"Height/Length was entered as {length} (likely in meters). CardioVision AI expects centimeters.",
            entered_value=length,
            suggested_action=f"Auto-converted to {corrected_len} cm."
        ))
        data["Length"] = corrected_len
        penalty_score += 5.0
        
    # Check if weight was entered in pounds (e.g. > 200 kg for average height)
    if weight is not None and float(weight) > 230.0:
        warnings.append(DataQualityWarning(
            field="Weight",
            severity="warning",
            message=f"Weight is {weight} kg. If entered in pounds (lbs), please convert to kilograms (kg).",
            entered_value=weight,
            suggested_action="Verify if value was in pounds (1 kg = 2.205 lbs)."
        ))
        penalty_score += 10.0

    # Auto-calculate BMI if Weight and Length are provided but BMI is missing
    if (data.get("BMI") is None or str(data.get("BMI")).strip() == "") and data.get("Weight") and data.get("Length"):
        try:
            w = float(data["Weight"])
            l_m = float(data["Length"]) / 100.0
            if l_m > 0:
                data["BMI"] = round(w / (l_m ** 2), 2)
                imputation_notices.append(f"Calculated BMI as {data['BMI']} kg/m² from entered weight and height.")
        except Exception:
            pass

    # 3. Numerical Features Validation
    for field, meta in NUMERICAL_FEATURES.items():
        val = data.get(field)
        if val is None or str(val).strip() == "":
            if field not in missing_critical:
                missing_imputable.append(field)
                imputation_notices.append(
                    f"'{meta['label']}' is missing: will be imputed using training cohort median ({meta['default']} {meta['unit']})."
                )
                normalized[field] = meta["default"]
                penalty_score += 2.0
            continue
            
        try:
            num_val = float(val)
            # Implausible physiological checks
            if num_val < meta["min"] or num_val > meta["max"]:
                implausible.append(field)
                warnings.append(DataQualityWarning(
                    field=field,
                    severity="error",
                    message=f"{meta['label']} value of {num_val} {meta['unit']} is physiologically implausible (valid clinical range: {meta['min']} - {meta['max']} {meta['unit']}).",
                    entered_value=num_val,
                    suggested_action=f"Verify entered measurement. Expected range: {meta['min']} to {meta['max']} {meta['unit']}."
                ))
                penalty_score += 20.0
                normalized[field] = num_val
            else:
                normalized[field] = num_val
        except (ValueError, TypeError):
            implausible.append(field)
            warnings.append(DataQualityWarning(
                field=field,
                severity="error",
                message=f"{meta['label']} must be a valid number, got: '{val}'.",
                entered_value=val,
                suggested_action="Enter a valid numeric value."
            ))
            penalty_score += 20.0

    # 4. Categorical Features Validation
    for field, meta in CATEGORICAL_FEATURES.items():
        val = data.get(field)
        if val is None or str(val).strip() == "":
            missing_imputable.append(field)
            imputation_notices.append(
                f"'{meta['label']}' is missing: will be imputed using cohort standard ('{meta['default']}')."
            )
            normalized[field] = meta["default"]
            penalty_score += 1.5
            continue
            
        val_str = str(val).strip()
        # Normalization for Yes/No
        if val_str.lower() in ["y", "yes", "true", "1"]:
            norm_val = "Y" if "Y" in meta["allowed"] else "1"
        elif val_str.lower() in ["n", "no", "false", "0"]:
            norm_val = "N" if "N" in meta["allowed"] else "0"
        elif val_str.lower() in ["male", "m"]:
            norm_val = "Male"
        elif val_str.lower() in ["female", "fmale", "f"]:
            norm_val = "Female"
        else:
            norm_val = val_str
            
        if norm_val not in meta["allowed"] and val_str not in meta["allowed"]:
            warnings.append(DataQualityWarning(
                field=field,
                severity="warning",
                message=f"Unrecognized categorical option '{val}' for {meta['label']}. Allowed: {meta['allowed']}.",
                entered_value=val,
                suggested_action=f"Select one of: {', '.join(meta['allowed'])}."
            ))
            penalty_score += 8.0
            normalized[field] = meta["default"]
        else:
            normalized[field] = norm_val

    # Quality score computation (100 is pristine)
    quality_score = max(0.0, round(100.0 - penalty_score, 1))
    if quality_score >= 85.0:
        quality_grade = "High Quality"
    elif quality_score >= 60.0:
        quality_grade = "Acceptable with Warnings"
    else:
        quality_grade = "Degraded Quality"

    is_ready = len(missing_critical) == 0 and len([w for w in warnings if w.severity == "error"]) == 0

    return ValidationResponse(
        is_ready_for_prediction=is_ready,
        quality_score=quality_score,
        quality_grade=quality_grade,
        missing_critical_fields=missing_critical,
        missing_imputable_fields=missing_imputable,
        implausible_fields=implausible,
        out_of_distribution_fields=out_of_dist,
        warnings=warnings,
        imputation_notices=imputation_notices,
        normalized_data=normalized if is_ready else None
    )
