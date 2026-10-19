"""
CardioVision AI - Model Evaluation & Calibration Analysis Module
Computes robust, leak-free evaluation metrics and probability calibration stats.
"""

from typing import Dict, Any, List
import numpy as np
from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score, 
    roc_auc_score, 
    confusion_matrix, 
    brier_score_loss
)
from sklearn.calibration import calibration_curve

def compute_model_metrics(
    y_true: np.ndarray, 
    y_pred: np.ndarray, 
    y_prob: np.ndarray, 
    target_name: str,
    train_size: int,
    test_size: int,
    split_strategy: str = "Stratified 80/20 Train/Test Split with 5-Fold Stratified Cross-Validation"
) -> Dict[str, Any]:
    """
    Computes rigorous performance and calibration metrics for a binary target.
    Handles single-class test edge cases gracefully.
    """
    pos_count = int(np.sum(y_true == 1))
    neg_count = int(np.sum(y_true == 0))
    
    # Basic classification metrics
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    
    # ROC-AUC (only valid when both classes are present in test set)
    if len(np.unique(y_true)) > 1:
        roc_auc = float(roc_auc_score(y_true, y_prob))
    else:
        roc_auc = None
        
    # Calibration: Brier score (lower is better, 0 is perfect)
    brier = float(brier_score_loss(y_true, y_prob))
    
    # Confusion matrix: [ [TN, FP], [FN, TP] ]
    cm = confusion_matrix(y_true, y_pred)
    tn = int(cm[0, 0]) if cm.shape == (2, 2) else (int(cm[0, 0]) if y_true[0] == 0 else 0)
    fp = int(cm[0, 1]) if cm.shape == (2, 2) else 0
    fn = int(cm[1, 0]) if cm.shape == (2, 2) else 0
    tp = int(cm[1, 1]) if cm.shape == (2, 2) else (int(cm[0, 0]) if y_true[0] == 1 else 0)
    
    # Calibration curve (5 bins for test sample stability)
    try:
        prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=5, strategy="uniform")
        calib_data = [
            {"bin": i + 1, "predicted": round(float(p), 3), "observed": round(float(o), 3)}
            for i, (p, o) in enumerate(zip(prob_pred, prob_true))
        ]
    except Exception:
        calib_data = []

    return {
        "target": target_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
        "brier_score": round(brier, 4),
        "confusion_matrix": {
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
            "matrix": [[tn, fp], [fn, tp]]
        },
        "sample_counts": {
            "train_samples": train_size,
            "test_samples": test_size,
            "total_samples": train_size + test_size,
            "positive_class_count": pos_count,
            "negative_class_count": neg_count,
            "prevalence": round(pos_count / max(test_size, 1), 4)
        },
        "calibration_curve": calib_data,
        "evaluation_strategy": split_strategy
    }
