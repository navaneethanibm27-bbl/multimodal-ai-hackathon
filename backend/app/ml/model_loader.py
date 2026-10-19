"""
CardioVision AI - Safe Model Loader & Runtime Cache
Loads trained Joblib artifacts, metadata, and evaluation metrics.
Handles missing or corrupt artifacts safely with descriptive errors.
"""

import os
import json
import joblib
from typing import Dict, Any, Optional
from backend.app.core.config import settings
from backend.app.ml.schema import TARGET_COLUMNS

class ModelRegistry:
    _instance: Optional["ModelRegistry"] = None
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.rf_models: Dict[str, Any] = {}
        self.metadata: Optional[Dict[str, Any]] = None
        self.metrics: Optional[Dict[str, Any]] = None
        self.is_loaded: bool = False
        self.load_error: Optional[str] = None
        self.load_artifacts()

    @classmethod
    def get_instance(cls) -> "ModelRegistry":
        if cls._instance is None:
            cls._instance = ModelRegistry()
        return cls._instance

    def load_artifacts(self, force_reload: bool = False) -> bool:
        if self.is_loaded and not force_reload:
            return True
            
        artifacts_dir = settings.ARTIFACTS_DIR
        meta_path = os.path.join(artifacts_dir, "metadata.json")
        metrics_path = os.path.join(artifacts_dir, "metrics.json")
        
        if not os.path.exists(meta_path):
            self.is_loaded = False
            self.load_error = f"Model artifacts metadata not found at {meta_path}. Please run train.py first."
            return False
            
        try:
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)
                
            if os.path.exists(metrics_path):
                with open(metrics_path, "r") as f:
                    self.metrics = json.load(f)
                    
            for target in TARGET_COLUMNS:
                model_file = os.path.join(artifacts_dir, f"{target.lower()}_model.joblib")
                rf_file = os.path.join(artifacts_dir, f"{target.lower()}_rf.joblib")
                
                if not os.path.exists(model_file):
                    self.is_loaded = False
                    self.load_error = f"Model artifact '{model_file}' for target {target} not found."
                    return False
                    
                self.models[target] = joblib.load(model_file)
                if os.path.exists(rf_file):
                    self.rf_models[target] = joblib.load(rf_file)
                    
            self.is_loaded = True
            self.load_error = None
            return True
        except Exception as e:
            self.is_loaded = False
            self.load_error = f"Failed to load model artifacts: {str(e)}"
            return False

    def get_model(self, target: str):
        if not self.is_loaded:
            raise RuntimeError(self.load_error or "Models not loaded")
        if target not in self.models:
            raise KeyError(f"Target '{target}' not supported. Supported targets: {TARGET_COLUMNS}")
        return self.models[target]

    def get_rf_model(self, target: str):
        if not self.is_loaded:
            raise RuntimeError(self.load_error or "Models not loaded")
        return self.rf_models.get(target, None)

    def get_metadata(self) -> Optional[Dict[str, Any]]:
        return self.metadata

    def get_metrics(self) -> Optional[Dict[str, Any]]:
        return self.metrics

registry = ModelRegistry.get_instance()
