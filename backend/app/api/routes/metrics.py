"""
CardioVision AI - Evaluation Metrics Endpoint
"""

from fastapi import APIRouter, HTTPException
from backend.app.ml.model_loader import registry

router = APIRouter(tags=["Metrics & Evaluation"])

@router.get("/metrics")
def get_metrics():
    """
    Returns actual saved evaluation metrics, confusion matrices, 
    calibration stats, and dataset cohort splits for all 4 targets.
    """
    if not registry.is_loaded:
        raise HTTPException(
            status_code=503, 
            detail=registry.load_error or "Model metrics are not available. Please train models first."
        )
    metrics = registry.get_metrics()
    meta = registry.get_metadata()
    return {
        "metadata": meta,
        "metrics": metrics
    }
