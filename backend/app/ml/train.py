"""
CardioVision AI - Model Training & Artifact Generation Pipeline
Trains leak-free, uncertainty-aware, probability-calibrated models for:
1. Overall Coronary Artery Disease (CAD)
2. Left Anterior Descending Artery (LAD) Stenosis
3. Left Circumflex Artery (LCX) Stenosis
4. Right Coronary Artery (RCA) Stenosis
"""

import os
import json
import joblib
from datetime import datetime, timezone
import numpy as np
import pandas as pd
from typing import Dict, Any

from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline

from backend.app.core.config import settings
from backend.app.ml.schema import (
    TARGET_CAD, 
    TARGET_LAD, 
    TARGET_LCX, 
    TARGET_RCA, 
    TARGET_COLUMNS
)
from backend.app.ml.synthetic_data import get_or_create_dataset
from backend.app.ml.preprocessing import (
    extract_features_and_target, 
    build_preprocessor
)
from backend.app.ml.evaluate import compute_model_metrics

def train_target_model(
    df: pd.DataFrame, 
    target_name: str, 
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Trains a calibrated classification pipeline for a single target,
    preventing any data leakage and computing test metrics on a held-out set.
    """
    # 1. Extract feature matrix and target series
    X, y, num_cols, cat_cols = extract_features_and_target(df, target_name)
    
    # 2. Stratified Train-Test Split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=random_state, stratify=y
    )
    
    # 3. Build preprocessing pipeline
    preprocessor = build_preprocessor(num_cols, cat_cols)
    
    # 4. Base Estimator: Random Forest with class weighting for clinical imbalance
    base_rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        min_samples_split=4,
        class_weight="balanced",
        random_state=random_state
    )
    
    # 5. Probability Calibration using 5-Fold Stratified Cross-Validation (Platt Sigmoid Scaling)
    calibrated_clf = CalibratedClassifierCV(
        estimator=base_rf,
        method="sigmoid",
        cv=5
    )
    
    full_pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", calibrated_clf)
    ])
    
    # 6. Fit only on training data
    full_pipeline.fit(X_train, y_train)
    
    # 7. Evaluate on held-out test data
    y_pred = full_pipeline.predict(X_test)
    y_prob = full_pipeline.predict_proba(X_test)[:, 1]
    
    metrics = compute_model_metrics(
        y_true=y_test,
        y_pred=y_pred,
        y_prob=y_prob,
        target_name=target_name,
        train_size=len(X_train),
        test_size=len(X_test)
    )
    
    # Also train a pure Random Forest for SHAP TreeExplainer compatibility
    rf_pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", base_rf)
    ])
    rf_pipeline.fit(X_train, y_train)
    
    return {
        "pipeline": full_pipeline,
        "rf_pipeline": rf_pipeline,
        "metrics": metrics,
        "num_cols": num_cols,
        "cat_cols": cat_cols,
        "feature_names": num_cols + cat_cols,
        "training_samples": len(X_train),
        "test_samples": len(X_test)
    }

def run_training_pipeline() -> Dict[str, Any]:
    """
    Executes full training for all 4 targets, saves Joblib artifacts and metadata.
    """
    os.makedirs(settings.ARTIFACTS_DIR, exist_ok=True)
    df, is_synthetic = get_or_create_dataset(settings.DATASET_PATH)
    
    results = {}
    all_metrics = {}
    
    print(f"=== CardioVision AI Training Pipeline ===")
    print(f"Dataset path: {settings.DATASET_PATH}")
    print(f"Total records: {len(df)} | Synthetic test mode: {is_synthetic}")
    
    for target in TARGET_COLUMNS:
        print(f"\nTraining model for target: {target}...")
        res = train_target_model(df, target)
        
        # Save pipeline artifacts
        model_filename = f"{target.lower()}_model.joblib"
        rf_filename = f"{target.lower()}_rf.joblib"
        
        joblib.dump(res["pipeline"], os.path.join(settings.ARTIFACTS_DIR, model_filename))
        joblib.dump(res["rf_pipeline"], os.path.join(settings.ARTIFACTS_DIR, rf_filename))
        
        all_metrics[target] = res["metrics"]
        results[target] = {
            "model_file": model_filename,
            "rf_file": rf_filename,
            "accuracy": res["metrics"]["accuracy"],
            "f1_score": res["metrics"]["f1_score"],
            "roc_auc": res["metrics"]["roc_auc"],
            "brier_score": res["metrics"]["brier_score"],
        }
        print(f"  -> Accuracy: {res['metrics']['accuracy']:.3f} | F1: {res['metrics']['f1_score']:.3f} | Brier: {res['metrics']['brier_score']:.3f}")

    # Build comprehensive metadata file
    now_iso = datetime.now(timezone.utc).isoformat()
    metadata = {
        "project": "CardioVision AI",
        "version": settings.VERSION,
        "trained_at": now_iso,
        "dataset_source": "Z-Alizadeh Sani Cardiovascular Dataset (Software Testing Synthetic Instance)" if is_synthetic else "Z-Alizadeh Sani Clinical Dataset",
        "is_synthetic_dataset": is_synthetic,
        "total_patients": len(df),
        "targets": TARGET_COLUMNS,
        "model_architecture": "Calibrated Random Forest (5-Fold Platt Scaling, 100 Trees, Balanced Class Weighting)",
        "features": {
            "numerical": list(res["num_cols"]),
            "categorical": list(res["cat_cols"]),
            "total_count": len(res["feature_names"])
        },
        "target_summaries": results
    }
    
    with open(os.path.join(settings.ARTIFACTS_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    with open(os.path.join(settings.ARTIFACTS_DIR, "metrics.json"), "w") as f:
        json.dump(all_metrics, f, indent=2)
        
    print(f"\nAll 4 target models successfully saved to {settings.ARTIFACTS_DIR}")
    return metadata

if __name__ == "__main__":
    run_training_pipeline()
