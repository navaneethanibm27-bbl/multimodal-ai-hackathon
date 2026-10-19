"""
CardioVision AI - Prediction History Endpoints
"""

import json
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.database.models import PredictionRecord
from backend.app.core.config import settings

router = APIRouter(tags=["History"])

@router.get("/history")
def list_history(limit: int = 50, db: Session = Depends(get_db)):
    """Returns anonymous saved analysis records."""
    if not settings.ENABLE_HISTORY_PERSISTENCE:
        return {"enabled": False, "records": []}
        
    records = db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc()).limit(limit).all()
    results = []
    for r in records:
        results.append({
            "id": r.id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "model_version": r.model_version,
            "cad_probability": round(r.cad_probability * 100.0, 1),
            "lad_probability": round(r.lad_probability * 100.0, 1),
            "lcx_probability": round(r.lcx_probability * 100.0, 1),
            "rca_probability": round(r.rca_probability * 100.0, 1),
            "data_quality_score": r.data_quality_score,
            "data_quality_grade": r.data_quality_grade,
            "imputation_applied": r.imputation_applied
        })
    return {"enabled": True, "records": results}

@router.delete("/history/{record_id}")
def delete_history_record(record_id: str, db: Session = Depends(get_db)):
    """Safely deletes a saved prediction record."""
    record = db.query(PredictionRecord).filter(PredictionRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Record {record_id} not found.")
    db.delete(record)
    db.commit()
    return {"status": "success", "deleted_id": record_id}
