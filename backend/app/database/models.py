"""
CardioVision AI - Prediction History Database Models
Privacy-preserving: stores zero identifiable patient names, IDs, or contact information.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, Boolean, Integer
from backend.app.database.connection import Base

class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(String(36), primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    model_version = Column(String(32), default="1.0.0")
    
    # 4 Prediction targets (probabilities 0.0 - 1.0)
    cad_probability = Column(Float, nullable=False)
    lad_probability = Column(Float, nullable=False)
    lcx_probability = Column(Float, nullable=False)
    rca_probability = Column(Float, nullable=False)
    
    # Uncertainty metadata
    cad_uncertainty = Column(String(64), nullable=True)
    lad_uncertainty = Column(String(64), nullable=True)
    lcx_uncertainty = Column(String(64), nullable=True)
    rca_uncertainty = Column(String(64), nullable=True)
    
    # Data quality summary
    data_quality_score = Column(Float, nullable=False)
    data_quality_grade = Column(String(64), nullable=False)
    imputation_applied = Column(Boolean, default=False)
    
    # Serialized JSON features and warnings for rehydration
    features_json = Column(Text, nullable=True)
    warnings_json = Column(Text, nullable=True)
