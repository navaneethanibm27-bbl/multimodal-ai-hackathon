"""
CardioVision AI - Data Preprocessing & Leakage Prevention Pipeline
Builds consistent Scikit-Learn ColumnTransformers and Pipelines.
"""

import pandas as pd
import numpy as np
from typing import List, Tuple, Dict, Any
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from backend.app.ml.schema import (
    NUMERICAL_FEATURES, 
    CATEGORICAL_FEATURES, 
    LEAKAGE_COLUMNS, 
    TARGET_COLUMNS
)

def get_feature_columns(df: pd.DataFrame) -> Tuple[List[str], List[str]]:
    """
    Identifies numeric and categorical feature columns from DataFrame,
    strictly excluding any leakage or target columns.
    """
    existing_cols = set(df.columns)
    
    # Exclude targets, cath outcomes, and known leaking identifiers
    excluded = set(LEAKAGE_COLUMNS + TARGET_COLUMNS)
    
    # Clean matches
    num_cols = [c for c in NUMERICAL_FEATURES.keys() if c in existing_cols and c not in excluded]
    cat_cols = [c for c in CATEGORICAL_FEATURES.keys() if c in existing_cols and c not in excluded]
    
    return num_cols, cat_cols

def build_preprocessor(num_cols: List[str], cat_cols: List[str]) -> ColumnTransformer:
    """
    Creates a scikit-learn ColumnTransformer with median imputation + standard scaling
    for numeric features, and most-frequent imputation + one-hot encoding for categorical features.
    """
    num_pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    
    cat_pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, num_cols),
            ("cat", cat_pipeline, cat_cols)
        ],
        remainder="drop"
    )
    return preprocessor

def normalize_target_series(series: pd.Series) -> np.ndarray:
    """
    Converts diverse text labels ('Cad'/'Normal', 'Stenotic'/'Normal', 1/0)
    to standard binary labels (1 = positive/disease/stenosis, 0 = normal/healthy).
    """
    s_clean = series.astype(str).str.strip().str.lower()
    positive_indicators = {"cad", "stenotic", "1", "yes", "true", "positive", "y"}
    return s_clean.apply(lambda v: 1 if v in positive_indicators else 0).values

def extract_features_and_target(
    df: pd.DataFrame, 
    target_name: str
) -> Tuple[pd.DataFrame, np.ndarray, List[str], List[str]]:
    """
    Extracts strictly leak-free feature matrix X and binary target vector y.
    """
    if target_name not in df.columns:
        raise ValueError(f"Target column '{target_name}' not found in dataset columns: {list(df.columns)}")
    
    num_cols, cat_cols = get_feature_columns(df)
    feature_cols = num_cols + cat_cols
    
    X = df[feature_cols].copy()
    y = normalize_target_series(df[target_name])
    
    return X, y, num_cols, cat_cols
