"""
CardioVision AI - Transparent Prediction Report Endpoint
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from backend.app.schemas.prediction import PredictionResponse
from backend.app.services.report_service import generate_html_report

router = APIRouter(tags=["Reports"])

class ReportRequest(BaseModel):
    prediction: PredictionResponse
    features: Dict[str, Any]

@router.post("/reports", response_class=HTMLResponse)
def create_report(request: ReportRequest):
    """
    Generates a downloadable, self-contained printable HTML medical research report.
    """
    try:
        html_content = generate_html_report(request.prediction, request.features)
        return HTMLResponse(content=html_content, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")
