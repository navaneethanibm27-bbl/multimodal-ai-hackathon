"""
CardioVision AI - Data Validation Endpoint
"""

from typing import Dict, Any
from fastapi import APIRouter
from backend.app.services.data_validation import validate_patient_data
from backend.app.schemas.patient import ValidationResponse

router = APIRouter(tags=["Validation"])

@router.post("/validate", response_model=ValidationResponse)
def validate_input(payload: Dict[str, Any]):
    """
    Validates clinical inputs before prediction.
    Checks completeness, units, ranges, categorical options, and imputation needs.
    """
    return validate_patient_data(payload)
