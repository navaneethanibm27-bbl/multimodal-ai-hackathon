# CardioVision AI - Dataset Directory

This directory holds the cardiovascular disease clinical dataset used to train the four risk models:
1. **CAD** (Overall Coronary Artery Disease)
2. **LAD** (Left Anterior Descending stenosis)
3. **LCX** (Left Circumflex stenosis)
4. **RCA** (Right Coronary Artery stenosis)

## Approved Dataset: Z-Alizadeh Sani Cardiovascular Dataset
- **Original Source**: UCI Machine Learning Repository / Zahra Alizadeh Sani et al.
- **Reference**: Alizadeh Sani, Z., et al. "A data mining approach for diagnosis of coronary artery disease." *Computer Methods and Programs in Biomedicine*, 2013.
- **Target CAD Definition**: At least 50% luminal narrowing (stenosis) in one or more major coronary arteries verified by coronary angiography (`Cath`).
- **Target Artery Definitions**:
  - `LAD`: Stenotic (>= 50% stenosis) vs Normal (< 50%)
  - `LCX`: Stenotic (>= 50% stenosis) vs Normal (< 50%)
  - `RCA`: Stenotic (>= 50% stenosis) vs Normal (< 50%)

## File Placement
Place the raw CSV file at:
`backend/data/z_alizadeh_sani_dataset.csv`

## Synthetic Software Testing Dataset
If `z_alizadeh_sani_dataset.csv` is not present, the pipeline automatically generates a synthetic test dataset adhering strictly to the schema, physiological ranges, and statistical correlations of the original study.
> **Note**: Synthetic test datasets are strictly labeled **FOR SOFTWARE TESTING ONLY** and must not be used or presented as clinical diagnostic evidence.

## Retraining the Models
Once the real dataset CSV is in place, run:
```bash
python -m backend.app.ml.train
```
This will retrain the four models, calculate calibrated probabilities and metrics, and save new model artifacts in `backend/artifacts/`.
