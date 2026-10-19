"""
CardioVision AI - Comprehensive Backend Test Suite
Tests:
1. Health & Model-info endpoints
2. Schema & Preprocessing checks
3. Data Quality validation (missing, implausible, unit errors, imputations)
4. Model prediction & 4-target artery mapping
5. Uncertainty bounds & calibration
6. SHAP Explainability computation
7. Evaluation metrics endpoint
8. Report generation
9. History persistence operations
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ml.schema import (
    NUMERICAL_FEATURES, 
    CATEGORICAL_FEATURES, 
    TARGET_COLUMNS
)

client = TestClient(app)

@pytest.fixture
def valid_patient_payload():
    return {
        "Age": 58,
        "Sex": "Male",
        "Weight": 78,
        "Length": 172,
        "BMI": 26.37,
        "DM": "Y",
        "HTN": "Y",
        "Current_Smoker": "Y",
        "Ex_Smoker": "N",
        "FH": "Y",
        "Obesity": "N",
        "CRF": "N",
        "CVA": "N",
        "Airway_disease": "N",
        "Thyroid_Disease": "N",
        "CHF": "N",
        "DLP": "Y",
        "BP": 140,
        "PR": 76,
        "Edema": "N",
        "Weak_Peripheral_Pulse": "N",
        "Lung_Rales": "N",
        "Systolic_Murmur": "N",
        "Diastolic_Murmur": "N",
        "Typical_Chest_Pain": "Y",
        "Atypical_Chest_Pain": "N",
        "Nonanginal_Chest_Pain": "N",
        "Exertional_CP": "Y",
        "LowTH_Angina": "N",
        "Q_Wave": "0",
        "St_Elevation": "0",
        "St_Depression": "1",
        "Tinversion": "1",
        "LVH": "N",
        "Poor_R_Progression": "N",
        "FBS": 125.0,
        "CR": 1.1,
        "TG": 185.0,
        "LDL": 135.0,
        "HDL": 42.0,
        "BUN": 19.0,
        "ESR": 18.0,
        "HB": 14.2,
        "K": 4.2,
        "Na": 140.0,
        "WBC": 7500.0,
        "Lymph": 30.0,
        "Neut": 64.0,
        "PLT": 240.0,
        "EF_TTE": 48.0,
        "Region_RWMA": "1",
        "VHD": "N"
    }

def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["service"] == "CardioVision AI"
    assert data["status"] in ["online", "degraded"]
    assert "supported_targets" in data
    assert len(data["supported_targets"]) == 4

def test_model_info_endpoint():
    resp = client.get("/api/model-info")
    assert resp.status_code == 200
    data = resp.json()
    assert "numerical_features" in data
    assert "categorical_features" in data
    assert "demo_fixtures" in data
    assert "acute_anterior_cad" in data["demo_fixtures"]
    assert "low_risk_healthy" in data["demo_fixtures"]

def test_validation_valid_input(valid_patient_payload):
    resp = client.post("/api/validate", json=valid_patient_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_ready_for_prediction"] is True
    assert data["quality_score"] > 80.0
    assert len(data["missing_critical_fields"]) == 0

def test_validation_missing_critical():
    payload = {"Weight": 70}  # Missing Age, Sex, BP, PR
    resp = client.post("/api/validate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_ready_for_prediction"] is False
    assert "Age" in data["missing_critical_fields"]
    assert "BP" in data["missing_critical_fields"]

def test_validation_implausible_values(valid_patient_payload):
    bad_payload = dict(valid_patient_payload)
    bad_payload["BP"] = 450  # Physiologically impossible systolic BP
    bad_payload["EF_TTE"] = 120  # Impossible Ejection Fraction
    resp = client.post("/api/validate", json=bad_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_ready_for_prediction"] is False
    assert "BP" in data["implausible_fields"]
    assert "EF_TTE" in data["implausible_fields"]

def test_validation_unit_correction(valid_patient_payload):
    payload = dict(valid_patient_payload)
    payload["Length"] = 1.74  # Entered in meters instead of cm
    resp = client.post("/api/validate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    # Should flag warning and auto-convert to 174.0 cm
    assert any("meters" in w["message"].lower() for w in data["warnings"])

def test_prediction_endpoint(valid_patient_payload):
    req = {
        "features": valid_patient_payload,
        "enable_uncertainty_quantification": True,
        "save_to_history": True
    }
    resp = client.post("/api/predict", json=req)
    assert resp.status_code == 200
    data = resp.json()
    
    # Verify all 4 required targets are present
    assert "cad" in data
    assert "lad" in data
    assert "lcx" in data
    assert "rca" in data
    
    # Verify probability ranges
    for target in ["cad", "lad", "lcx", "rca"]:
        est = data[target]
        assert 0.0 <= est["estimated_probability"] <= 1.0
        assert 0.0 <= est["percentage"] <= 100.0
        assert "uncertainty_level" in est
        assert len(est["confidence_interval_95"]) == 2
        assert est["calibration_status"] != ""

    # Verify medical disclaimer is present
    assert "disclaimer" in data
    assert "experimental research" in data["disclaimer"].lower()

def test_explainability_cad(valid_patient_payload):
    req = {
        "features": valid_patient_payload,
        "target": "CAD",
        "top_n": 8
    }
    resp = client.post("/api/explain", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["target"] == "CAD"
    assert len(data["top_features"]) <= 8
    assert len(data["top_features"]) > 0
    assert "causation_disclaimer" in data
    assert "NOT direct medical causation" in data["causation_disclaimer"]

def test_explainability_all_vessels(valid_patient_payload):
    for vessel in ["LAD", "LCX", "RCA"]:
        req = {
            "features": valid_patient_payload,
            "target": vessel,
            "top_n": 5
        }
        resp = client.post("/api/explain", json=req)
        assert resp.status_code == 200
        data = resp.json()
        assert data["target"] == vessel
        assert len(data["top_features"]) > 0

def test_metrics_endpoint():
    resp = client.get("/api/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert "metrics" in data
    assert "metadata" in data
    for target in TARGET_COLUMNS:
        assert target in data["metrics"]
        m = data["metrics"][target]
        assert "accuracy" in m
        assert "f1_score" in m
        assert "brier_score" in m
        assert "confusion_matrix" in m

def test_report_generation(valid_patient_payload):
    # First get a prediction
    pred_resp = client.post("/api/predict", json={"features": valid_patient_payload})
    assert pred_resp.status_code == 200
    pred_data = pred_resp.json()
    
    # Request report
    rep_resp = client.post("/api/reports", json={
        "prediction": pred_data,
        "features": valid_patient_payload
    })
    assert rep_resp.status_code == 200
    html = rep_resp.text
    assert "<html" in html
    assert "CardioVision AI" in html
    assert "Overall CAD" in html
    assert "Left Anterior Descending" in html
    assert "DISCLAIMER" in html

def test_history_crud(valid_patient_payload):
    # Save a record
    pred_resp = client.post("/api/predict", json={
        "features": valid_patient_payload,
        "save_to_history": True
    })
    assert pred_resp.status_code == 200
    pred_id = pred_resp.json()["prediction_id"]
    
    # Retrieve history
    hist_resp = client.get("/api/history")
    assert hist_resp.status_code == 200
    records = hist_resp.json()["records"]
    assert any(r["id"] == pred_id for r in records)
    
    # Delete the test record
    del_resp = client.delete(f"/api/history/{pred_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["deleted_id"] == pred_id

def test_archetype_fixtures():
    resp = client.get("/api/model-info")
    assert resp.status_code == 200
    data = resp.json()
    assert "demo_fixtures" in data
    fixtures = data["demo_fixtures"]
    assert "acute_anterior_cad" in fixtures
    assert "silent_diabetic_cad" in fixtures
    assert "young_familial_cad" in fixtures
    assert "low_risk_healthy" in fixtures

    # Test prediction on archetype
    pred_resp = client.post("/api/predict", json={"features": fixtures["acute_anterior_cad"]["data"]})
    assert pred_resp.status_code == 200
    pred = pred_resp.json()
    assert pred["cad"]["percentage"] > 50.0  # High risk case

def test_counterfactual_simulation(valid_patient_payload):
    baseline = dict(valid_patient_payload)
    baseline["BP"] = 160
    baseline["LDL"] = 190
    baseline["Current_Smoker"] = "Y"

    intervention = dict(baseline)
    intervention["BP"] = 120
    intervention["LDL"] = 90
    intervention["Current_Smoker"] = "N"

    sim_req = {
        "baseline_features": baseline,
        "intervention_features": intervention
    }
    resp = client.post("/api/simulate", json=sim_req)
    assert resp.status_code == 200
    sim_data = resp.json()
    
    assert "cad" in sim_data
    assert "lad" in sim_data
    assert "lcx" in sim_data
    assert "rca" in sim_data
    assert "clinical_guidance" in sim_data
    assert len(sim_data["clinical_guidance"]) >= 2
    assert len(sim_data["modified_factors"]) == 3
    
    # Risk delta should show reduction or non-increase
    assert sim_data["cad"]["simulated_pct"] <= sim_data["cad"]["baseline_pct"]

