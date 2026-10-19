# CardioVision AI
**An Explainable, Uncertainty-Aware Cardiovascular Risk Prediction and Interactive 3D Heart Visualization System**

*Multimodal AI Hackathon 2026 — Track A: Cardiovascular Risk Visualization & Prediction*

---

> ### ⚠️ Mandatory Medical & Academic Disclaimer
> **CardioVision AI is an experimental research and educational decision-support prototype.**
> Its outputs are model-estimated statistical probabilities and **must not be used as a medical diagnosis or to dictate treatment decisions**. It is not a substitute for clinical evaluation by a licensed healthcare professional or coronary angiographic imaging.

---

## 1. Project Overview & Main Differentiators

Existing cardiovascular risk calculators output generic black-box percentages. CardioVision AI differentiates itself through the integration of five scientifically responsible features:

### A. Patient Data Quality Checker
- Audits physiological plausibility (e.g. impossible blood pressure, extreme pulse rates, out-of-range ejection fraction).
- Detects unit inconsistencies (e.g. height entered in meters vs. cm, weight in lbs vs. kg).
- **Zero silent zero-substitution**: Transparently logs cohort median/mode imputations when laboratory tests are unavailable.
- Computes an objective Data Quality Score (0–100) and Quality Grade before model execution.

### B. Uncertainty-Aware Prediction
- Implements **5-Fold Stratified Platt Scaling (Sigmoid)** for well-calibrated probabilities.
- Quantifies prediction variability via **Tree-Ensemble Variance** across 100 decision trees.
- Produces **empirical 95% Confidence Intervals** $[Q_{2.5\%}, Q_{97.5\%}]$.
- Explicitly communicates stability vs. prediction equipoise on the clinical margin.

### C. Artery-Specific Interactive 3D Visualization
- Realistic, interactive 3D anatomical heart built in **Three.js / WebGL**.
- Features selectable coronary arteries: **LAD (Left Anterior Descending)**, **LCX (Left Circumflex)**, and **RCA (Right Coronary Artery)**.
- Color-coded risk pulsation glow mapping to each vessel's specific predicted probability.
- Clearly states that 3D highlighting communicates predicted territory risk, *not* physical CT/angiographic lesion geometry.

### D. Explainable AI with SHAP
- Calculates genuine patient-level **SHAP TreeExplainer** feature attributions.
- Displays ranked horizontal bar charts showing direction of impact (Increases Risk vs. Decreases Risk).
- Separate explanations for all 4 targets: Overall CAD, LAD, LCX, and RCA.
- Contextualizes each feature with clinical rationale while explicitly stating that **statistical association does not equal medical causation**.

### E. Transparent Prediction Reports
- Generates downloadable, self-contained printable reports formatted for **Print to PDF** or standalone HTML archiving.
- Encapsulates entered features, data quality audits, vessel probabilities, SHAP factors, calibration metadata, and safety disclaimers.

---

## 2. Four Prediction Targets

In accordance with the challenge requirements and the Z-Alizadeh Sani clinical literature:
1. **Overall CAD**: Stenosis $\ge 50\%$ in at least one major coronary vessel.
2. **LAD Stenosis**: Left Anterior Descending luminal narrowing $\ge 50\%$.
3. **LCX Stenosis**: Left Circumflex luminal narrowing $\ge 50\%$.
4. **RCA Stenosis**: Right Coronary Artery luminal narrowing $\ge 50\%$.

### Zero Data Leakage Pipeline
Target columns (`CAD`, `LAD`, `LCX`, `RCA`) and catheterization angiographic outcome (`Cath`) are strictly excluded from the model feature matrix. Data scaling (`StandardScaler`) and imputation (`SimpleImputer`) are fitted solely on training splits.

---

## 3. Technology Stack

- **Backend**: Python 3.14+ / 3.11+, FastAPI, Pydantic, scikit-learn, SHAP, NumPy, Pandas, Joblib, SQLite, SQLAlchemy, Pytest.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Three.js, Recharts, Lucide Icons.
- **Hardware Profile**: Optimized for CPU execution on standard laptops without dedicated GPUs.

---

## 4. Quick Start & Setup Instructions (Windows / VS Code)

### Prerequisites
- Python 3.11+ or 3.14 (Verified on Python 3.14.3)
- Node.js v20+ or v24+ and npm

---

### Step 1: Backend Setup & Dependency Installation

Open a terminal in the project root directory:

```powershell
# 1. Install backend dependencies
python -m pip install -r backend/requirements.txt
```

### Step 2: Dataset Placement & Model Training

The pipeline looks for the approved dataset at:
`backend/data/z_alizadeh_sani_dataset.csv`

> **Note on Datasets**: If the real dataset CSV is not present, the pipeline automatically generates a clearly labeled synthetic test cohort mirroring the schema and statistical distributions of the published Z-Alizadeh Sani cohort **for software demonstration and automated testing only**.

To train the four calibrated models and generate evaluation artifacts:
```powershell
python -m backend.app.ml.train
```
This saves calibrated models (`cad_model.joblib`, `lad_model.joblib`, `lcx_model.joblib`, `rca_model.joblib`), metadata, and metrics into `backend/artifacts/`.

---

### Step 3: Run the Local Servers (Two-Terminal Workflow)

#### Terminal 1 — Backend (FastAPI + Uvicorn):
```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be active at: `http://127.0.0.1:8000`
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

#### Terminal 2 — Frontend (Vite + React + Three.js):
```powershell
cd frontend
npm install
npm run dev
```
Frontend Web Dashboard will be active at: `http://127.0.0.1:5173/`

---

## 5. Automated Testing

### Backend Unit & Integration Tests (12 Test Cases):
```powershell
python -m pytest backend/tests/test_backend.py -v
```
Verifies:
- Health and model-info endpoints
- Critical field validation & physiological bounds
- Unit auto-correction (meters to cm, lbs to kg)
- Calibrated 4-target predictions & ensemble uncertainty
- SHAP TreeExplainer attributions across all targets
- Evaluation metrics endpoint
- Report generation
- SQLite history persistence

### Frontend TypeScript Verification & Build:
```powershell
cd frontend
npm run build
```

---

## 6. Demonstration Workflow (3–5 Minute Hackathon Presentation)

1. **Overview (Landing Page)**:
   - Introduce the CardioVision AI vision: explainable, uncertainty-aware cardiovascular decision support.
   - Point out the 5 scientific differentiators and the academic disclaimer.
   - Click **"Start Risk Analysis"**.

2. **Patient Data Ingestion & Quality Audit**:
   - Click **"Load Demo: High-Risk CAD"** to instantly populate verified clinical inputs (advanced age, exertional chest pain, hypertension, ECG changes, reduced EF).
   - Click **"Validate Data"** to demonstrate **Differentiator A**: Live Data Quality Score (100/100) and imputation transparency.
   - Click **"Run Risk Analysis"**.

3. **Results Dashboard**:
   - Review calibrated probabilities across all 4 targets:
     - Overall CAD (~89%)
     - LAD (~80%)
     - LCX (~50%)
     - RCA (~63%)
   - Highlight **Differentiator B**: 95% Confidence Intervals and Tree Ensemble Stability.
   - Click on the **LAD** card or click **"Interactive 3D Heart"**.

4. **3D Coronary Perfusion & Anatomical Map**:
   - Rotate, zoom, and explore the 3D heart (**Differentiator C**).
   - Switch between **LAD**, **LCX**, and **RCA** tabs to see the corresponding artery highlight with color-coded risk pulsation glow.
   - Observe the perfusion anatomy and clinical significance in the synchronized details panel.
   - Click **"View LAD SHAP Feature Attributions"**.

5. **Explainable AI (SHAP XAI)**:
   - Examine the ranked horizontal bar chart (**Differentiator D**).
   - Point out features increasing risk (red) vs. decreasing risk (teal).
   - Review feature-by-feature clinical rationales and the **Association vs. Causation** clinical disclaimer.

6. **Model Performance & Transparent Decision Report**:
   - Click **"Model Performance"** to show real evaluation metrics, 2x2 confusion matrix with sensitivity/specificity, and reliability calibration curves.
   - Click **"Download Decision Report"** (**Differentiator E**) to preview the printable decision-support document and show the **Print to PDF** capability.
   - Click **"Reports & History"** to display the privacy-preserving SQLite audit trail.

---

## 7. Project Architecture

```
multimodal ai hackathon/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application & lifespan
│   │   ├── core/config.py              # Configuration & environment settings
│   │   ├── schemas/
│   │   │   ├── patient.py              # Pydantic schemas for patient & quality validation
│   │   │   └── prediction.py           # Schemas for prediction, uncertainty, & XAI
│   │   ├── ml/
│   │   │   ├── schema.py               # Feature ranges, plausible limits, units
│   │   │   ├── synthetic_data.py       # Testing dataset generator & ingestion helper
│   │   │   ├── preprocessing.py        # Leak-free ColumnTransformer pipeline
│   │   │   ├── train.py                # 4-target training & calibration pipeline
│   │   │   ├── evaluate.py             # Metrics, confusion matrix, calibration curve
│   │   │   └── model_loader.py         # Thread-safe model registry & artifact cache
│   │   ├── services/
│   │   │   ├── data_validation.py      # Data quality audit service
│   │   │   ├── prediction_service.py   # Calibrated inference & tree uncertainty
│   │   │   ├── explainability_service.py # SHAP TreeExplainer service
│   │   │   └── report_service.py       # Printable HTML report generator
│   │   ├── database/
│   │   │   ├── connection.py           # SQLite connection & session management
│   │   │   └── models.py               # Privacy-preserving PredictionRecord model
│   │   └── api/routes/
│   │       ├── health.py               # Health & model-info routes
│   │       ├── validation.py           # /api/validate endpoint
│   │       ├── predictions.py          # /api/predict endpoint
│   │       ├── explainability.py       # /api/explain endpoint
│   │       ├── metrics.py              # /api/metrics endpoint
│   │       ├── reports.py              # /api/reports endpoint
│   │       └── history.py              # /api/history endpoints
│   ├── data/                           # Dataset storage directory
│   ├── artifacts/                      # Trained Joblib models & metadata
│   ├── tests/
│   │   └── test_backend.py             # 12 automated pytest test cases
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Sticky header with live API pulse badge
│   │   │   ├── DisclaimerBanner.tsx    # Safety disclaimer
│   │   │   ├── Footer.tsx              # Footer with links and academic notice
│   │   │   ├── 3DHeart/
│   │   │   │   ├── HeartCanvas.tsx     # Three.js 3D anatomical heart viewport
│   │   │   │   └── ArteryDetailsPanel.tsx # Perfusion details panel
│   │   │   └── Reports/
│   │   │       └── ReportModal.tsx     # Printable decision report modal
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx         # Overview, 5 pillars, workflow
│   │   │   ├── PatientDataEntry.tsx    # Structured form & quality audit
│   │   │   ├── MainResultsDashboard.tsx # 4-target risk dashboard
│   │   │   ├── HeartVisualizationPage.tsx # Dual-panel 3D visualization
│   │   │   ├── ExplainabilityDashboard.tsx # SHAP waterfall charts & notes
│   │   │   ├── ModelPerformanceDashboard.tsx # Confusion matrix & calibration
│   │   │   └── HistoryDashboard.tsx    # Anonymous audit log
│   │   ├── services/api.ts             # Fetch API client
│   │   ├── types/index.ts              # TypeScript domain types
│   │   ├── App.tsx                     # Main application state & router
│   │   └── index.css                   # Tailwind v4 styling
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
└── README.md
```

---

## 8. Limitations & Future Roadmap

- **Cohort Size**: The Z-Alizadeh Sani clinical cohort contains 303 angiographically verified patients. While adequate for academic decision-support prototypes, clinical translation requires validation on larger external multi-center registries.
- **Geometric Specificity**: The 3D heart represents anatomical coronary perfusion territories; patient-specific coronary tree reconstruction requires 3D rotational angiography or high-resolution CCTA segmentation.
- **Deep Multimodal Integration**: Future versions can ingest raw 12-lead ECG signal waveforms and DICOM echocardiography video clips alongside tabular biomarkers.
