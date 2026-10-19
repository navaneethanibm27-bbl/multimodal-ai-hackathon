"""
CardioVision AI - Prediction Endpoint
"""

import json
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.schemas.prediction import PredictionRequest, PredictionResponse
from backend.app.services.prediction_service import predict_cardiovascular_risk
from backend.app.database.connection import get_db
from backend.app.database.models import PredictionRecord

router = APIRouter(tags=["Predictions"])

@router.post("/predict", response_model=PredictionResponse)
def run_prediction(request: PredictionRequest, db: Session = Depends(get_db)):
    """
    Computes calibrated risk probabilities and ensemble uncertainty bounds
    for Overall CAD, LAD, LCX, and RCA coronary stenosis.
    """
    try:
        response = predict_cardiovascular_risk(request)
        
        # Optional persistence if enabled and requested
        if settings.ENABLE_HISTORY_PERSISTENCE and request.save_to_history:
            try:
                record = PredictionRecord(
                    id=response.prediction_id,
                    model_version=response.model_version,
                    cad_probability=response.cad.estimated_probability,
                    lad_probability=response.lad.estimated_probability,
                    lcx_probability=response.lcx.estimated_probability,
                    rca_probability=response.rca.estimated_probability,
                    cad_uncertainty=response.cad.uncertainty_level,
                    lad_uncertainty=response.lad.uncertainty_level,
                    lcx_uncertainty=response.lcx.uncertainty_level,
                    rca_uncertainty=response.rca.uncertainty_level,
                    data_quality_score=response.data_quality_score,
                    data_quality_grade=response.data_quality_grade,
                    imputation_applied=response.imputation_applied,
                    features_json=json.dumps(request.features),
                    warnings_json=json.dumps([w.dict() for w in response.quality_warnings])
                )
                db.add(record)
                db.commit()
            except Exception as e:
                # Do not fail prediction if optional persistence encounters an issue
                db.rollback()
                print(f"Warning: History persistence failed: {e}")
                
        return response
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal prediction error: {str(e)}")
