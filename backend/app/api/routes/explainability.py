"""
CardioVision AI - Explainability (XAI) Endpoint
"""

from fastapi import APIRouter, HTTPException
from backend.app.schemas.prediction import ExplainRequest, ExplainResponse
from backend.app.services.explainability_service import explain_prediction

router = APIRouter(tags=["Explainability"])

@router.post("/explain", response_model=ExplainResponse)
def get_explanation(request: ExplainRequest):
    """
    Computes patient-level SHAP feature attributions for the requested target
    (CAD, LAD, LCX, or RCA) using the trained Random Forest TreeExplainer.
    """
    try:
        return explain_prediction(request)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation calculation failed: {str(e)}")
