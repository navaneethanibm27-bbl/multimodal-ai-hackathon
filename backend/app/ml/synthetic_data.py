"""
Synthetic Dataset Generator for Software Testing & Ingestion Pipeline
Label: FOR SOFTWARE TESTING AND DEMONSTRATION ONLY.
Mirrors the schema and statistical distributions of the Z-Alizadeh Sani Cardiovascular Disease dataset.
"""

import os
import numpy as np
import pandas as pd
from typing import Tuple
from backend.app.ml.schema import (
    NUMERICAL_FEATURES, 
    CATEGORICAL_FEATURES, 
    TARGET_CAD, 
    TARGET_LAD, 
    TARGET_LCX, 
    TARGET_RCA
)

def generate_synthetic_z_alizadeh_dataset(
    n_samples: int = 303, 
    random_state: int = 42,
    output_path: str = None
) -> pd.DataFrame:
    """
    Generates a realistic synthetic dataset adhering to Z-Alizadeh Sani schema.
    Clearly labeled for software testing only.
    """
    rng = np.random.RandomState(random_state)
    
    # 1. Demographics
    age = rng.normal(loc=58.0, scale=10.0, size=n_samples).clip(30, 85).astype(int)
    sex = rng.choice(["Male", "Female"], size=n_samples, p=[0.60, 0.40])
    # Weight & Height correlated with sex
    length = np.where(sex == "Male", 
                      rng.normal(172, 7, n_samples).clip(150, 195), 
                      rng.normal(160, 6, n_samples).clip(140, 180)).round(1)
    weight = np.where(sex == "Male", 
                      rng.normal(78, 12, n_samples).clip(50, 125), 
                      rng.normal(68, 11, n_samples).clip(45, 115)).round(1)
    bmi = (weight / ((length / 100.0) ** 2)).round(2)
    
    # 2. History & Risk factors
    dm_prob = np.clip(0.15 + (age - 40) * 0.005 + (bmi > 28) * 0.15, 0.05, 0.6)
    dm = np.where(rng.uniform(size=n_samples) < dm_prob, "Y", "N")
    
    htn_prob = np.clip(0.25 + (age - 40) * 0.008 + (bmi > 27) * 0.12, 0.10, 0.8)
    htn = np.where(rng.uniform(size=n_samples) < htn_prob, "Y", "N")
    
    cur_smoker = np.where((sex == "Male") & (rng.uniform(size=n_samples) < 0.35), "Y", 
                          np.where((sex == "Female") & (rng.uniform(size=n_samples) < 0.08), "Y", "N"))
    ex_smoker = np.where((cur_smoker == "N") & (rng.uniform(size=n_samples) < 0.15), "Y", "N")
    fh = np.where(rng.uniform(size=n_samples) < 0.22, "Y", "N")
    obesity = np.where(bmi >= 27.5, "Y", "N")
    crf = np.where(rng.uniform(size=n_samples) < 0.04, "Y", "N")
    cva = np.where(rng.uniform(size=n_samples) < 0.03, "Y", "N")
    airway = np.where(rng.uniform(size=n_samples) < 0.05, "Y", "N")
    thyroid = np.where(rng.uniform(size=n_samples) < 0.04, "Y", "N")
    chf = np.where(rng.uniform(size=n_samples) < 0.05, "Y", "N")
    dlp = np.where(rng.uniform(size=n_samples) < 0.32, "Y", "N")
    
    # 3. Vitals & Symptoms
    bp = (rng.normal(132, 18, n_samples) + (htn == "Y") * 16).clip(90, 210).astype(int)
    pr = rng.normal(74, 10, n_samples).clip(52, 115).astype(int)
    edema = np.where(rng.uniform(size=n_samples) < 0.06, "Y", "N")
    weak_pulse = np.where(rng.uniform(size=n_samples) < 0.04, "Y", "N")
    lung_rales = np.where(rng.uniform(size=n_samples) < 0.05, "Y", "N")
    sys_murmur = np.where(rng.uniform(size=n_samples) < 0.08, "Y", "N")
    dia_murmur = np.where(rng.uniform(size=n_samples) < 0.03, "Y", "N")
    
    # Chest pain distributions
    cp_type = rng.choice(["typical", "atypical", "nonanginal", "none"], size=n_samples, p=[0.42, 0.28, 0.18, 0.12])
    typical_cp = np.where(cp_type == "typical", "Y", "N")
    atypical_cp = np.where(cp_type == "atypical", "Y", "N")
    nonanginal_cp = np.where(cp_type == "nonanginal", "Y", "N")
    exertional_cp = np.where((typical_cp == "Y") | (rng.uniform(size=n_samples) < 0.20), "Y", "N")
    lowth_angina = np.where((typical_cp == "Y") & (rng.uniform(size=n_samples) < 0.35), "Y", "N")
    
    # 4. ECG
    st_elev = np.where(rng.uniform(size=n_samples) < 0.09, "1", "0")
    st_depr = np.where(rng.uniform(size=n_samples) < 0.28, "1", "0")
    tinversion = np.where(rng.uniform(size=n_samples) < 0.30, "1", "0")
    q_wave = np.where(rng.uniform(size=n_samples) < 0.12, "1", "0")
    lvh = np.where((htn == "Y") & (rng.uniform(size=n_samples) < 0.24), "Y", "N")
    poor_r = np.where(rng.uniform(size=n_samples) < 0.14, "Y", "N")
    
    # 5. Laboratory
    fbs = (rng.normal(108, 30, n_samples) + (dm == "Y") * 65).clip(65, 380).round(1)
    cr = rng.normal(1.05, 0.28, n_samples).clip(0.5, 3.2).round(2)
    tg = (rng.normal(155, 60, n_samples) + (dlp == "Y") * 50).clip(40, 650).round(1)
    ldl = (rng.normal(115, 32, n_samples) + (dlp == "Y") * 30).clip(35, 260).round(1)
    hdl = rng.normal(44, 9, n_samples).clip(18, 95).round(1)
    bun = (rng.normal(17.5, 5.5, n_samples) + (cr > 1.3) * 10).clip(6, 65).round(1)
    esr = rng.normal(17, 12, n_samples).clip(2, 90).round(1)
    hb = np.where(sex == "Male", rng.normal(14.2, 1.4, n_samples), rng.normal(12.8, 1.2, n_samples)).clip(8.5, 18.0).round(1)
    k = rng.normal(4.25, 0.4, n_samples).clip(3.1, 5.6).round(2)
    na = rng.normal(140.5, 3.2, n_samples).clip(129, 153).round(1)
    wbc = rng.normal(7400, 1800, n_samples).clip(3400, 16000).round(0)
    lymph = rng.normal(32, 8, n_samples).clip(10, 58).round(1)
    neut = (100.0 - lymph - rng.uniform(4, 9, n_samples)).clip(35, 85).round(1)
    plt = rng.normal(235, 55, n_samples).clip(75, 520).round(0)
    
    # 6. Echo
    ef_tte = rng.normal(48, 8, n_samples).clip(20, 65).round(1)
    rwma = rng.choice(["0", "1", "2", "3", "4"], size=n_samples, p=[0.55, 0.20, 0.12, 0.08, 0.05])
    vhd = rng.choice(["N", "mild", "Moderate", "Severe"], size=n_samples, p=[0.68, 0.22, 0.08, 0.02])
    
    # Realistic coronary artery stenosis latent risk
    # Literature confirms LAD is most common, followed by RCA and LCX.
    risk_score = (
        (age - 58) * 0.05 +
        (sex == "Male") * 0.40 +
        (typical_cp == "Y") * 1.20 +
        (atypical_cp == "Y") * 0.35 +
        (dm == "Y") * 0.55 +
        (htn == "Y") * 0.45 +
        (cur_smoker == "Y") * 0.50 +
        (st_depr == "1") * 0.65 +
        (st_elev == "1") * 0.85 +
        (q_wave == "1") * 0.60 +
        (tinversion == "1") * 0.45 +
        (ef_tte < 45) * 0.55 +
        (rwma != "0") * 0.70 +
        (ldl > 130) * 0.35 -
        (hdl > 50) * 0.35 - 1.35 + # Baseline shift to match ~71% CAD / 29% Normal
        rng.normal(0, 0.6, n_samples)
    )
    
    # Calibrated vessel probabilities
    lad_prob = np.clip(1.0 / (1.0 + np.exp(-(risk_score + 0.20))), 0.05, 0.95)
    rca_prob = np.clip(1.0 / (1.0 + np.exp(-(risk_score - 0.60))), 0.03, 0.90)
    lcx_prob = np.clip(1.0 / (1.0 + np.exp(-(risk_score - 0.95))), 0.02, 0.85)
    
    lad_stenosis = np.where(rng.uniform(size=n_samples) < lad_prob, "Stenotic", "Normal")
    rca_stenosis = np.where(rng.uniform(size=n_samples) < rca_prob, "Stenotic", "Normal")
    lcx_stenosis = np.where(rng.uniform(size=n_samples) < lcx_prob, "Stenotic", "Normal")
    
    # Challenge and clinical definition: CAD = at least 50% narrowing in >= 1 major vessel (LAD, LCX, or RCA)
    cad_outcome = np.where(
        (lad_stenosis == "Stenotic") | (rca_stenosis == "Stenotic") | (lcx_stenosis == "Stenotic"),
        "Cad",
        "Normal"
    )
    cath_outcome = cad_outcome.copy() # Standard Z-Alizadeh Sani Cath column
    
    df = pd.DataFrame({
        "Age": age,
        "Weight": weight,
        "Length": length,
        "Sex": sex,
        "BMI": bmi,
        "DM": dm,
        "HTN": htn,
        "Current_Smoker": cur_smoker,
        "Ex_Smoker": ex_smoker,
        "FH": fh,
        "Obesity": obesity,
        "CRF": crf,
        "CVA": cva,
        "Airway_disease": airway,
        "Thyroid_Disease": thyroid,
        "CHF": chf,
        "DLP": dlp,
        "BP": bp,
        "PR": pr,
        "Edema": edema,
        "Weak_Peripheral_Pulse": weak_pulse,
        "Lung_Rales": lung_rales,
        "Systolic_Murmur": sys_murmur,
        "Diastolic_Murmur": dia_murmur,
        "Typical_Chest_Pain": typical_cp,
        "Atypical_Chest_Pain": atypical_cp,
        "Nonanginal_Chest_Pain": nonanginal_cp,
        "Exertional_CP": exertional_cp,
        "LowTH_Angina": lowth_angina,
        "Q_Wave": q_wave,
        "St_Elevation": st_elev,
        "St_Depression": st_depr,
        "Tinversion": tinversion,
        "LVH": lvh,
        "Poor_R_Progression": poor_r,
        "FBS": fbs,
        "CR": cr,
        "TG": tg,
        "LDL": ldl,
        "HDL": hdl,
        "BUN": bun,
        "ESR": esr,
        "HB": hb,
        "K": k,
        "Na": na,
        "WBC": wbc,
        "Lymph": lymph,
        "Neut": neut,
        "PLT": plt,
        "EF_TTE": ef_tte,
        "Region_RWMA": rwma,
        "VHD": vhd,
        # Outcomes / Targets
        TARGET_LAD: lad_stenosis,
        TARGET_LCX: lcx_stenosis,
        TARGET_RCA: rca_stenosis,
        TARGET_CAD: cad_outcome,
        "Cath": cath_outcome
    })
    
    if output_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        df.to_csv(output_path, index=False)
        
    return df

def get_or_create_dataset(csv_path: str) -> Tuple[pd.DataFrame, bool]:
    """
    Checks if a real dataset exists at csv_path.
    If not, creates the clearly labeled synthetic dataset for software testing.
    Returns (DataFrame, is_synthetic_flag).
    """
    if os.path.exists(csv_path) and os.path.getsize(csv_path) > 1000:
        df = pd.read_csv(csv_path)
        # Normalize column names: strip spaces, replace hyphens/dots with underscores
        df.columns = [c.strip().replace(" ", "_").replace("-", "_").replace(".", "_") for c in df.columns]
        return df, False
    else:
        df = generate_synthetic_z_alizadeh_dataset(n_samples=303, output_path=csv_path)
        return df, True

if __name__ == "__main__":
    test_path = "backend/data/z_alizadeh_sani_dataset.csv"
    df, is_synth = get_or_create_dataset(test_path)
    print(f"Dataset loaded: {len(df)} rows. Synthetic test dataset: {is_synth}")
    print(f"CAD distribution: {df[TARGET_CAD].value_counts().to_dict()}")
    print(f"LAD distribution: {df[TARGET_LAD].value_counts().to_dict()}")
