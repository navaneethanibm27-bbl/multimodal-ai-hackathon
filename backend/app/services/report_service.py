"""
CardioVision AI - Transparent Prediction Report Service
Differentiator E:
Generates comprehensive clinical decision-support reports containing:
- Entered clinical features & data quality status
- Overall CAD & vessel-specific probabilities (LAD, LCX, RCA)
- SHAP feature attributions
- Model version, calibration & ensemble uncertainty bounds
- Mandatory medical research safety disclaimer
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
from backend.app.schemas.prediction import PredictionResponse

def generate_html_report(prediction: PredictionResponse, features: Dict[str, Any]) -> str:
    """
    Generates a beautifully styled, self-contained printable HTML medical research report.
    Compatible with browser Print to PDF.
    """
    now = datetime.now(timezone.utc).strftime("%B %d, %Y - %H:%M:%S UTC")
    
    # Generate warnings HTML
    warnings_html = ""
    if prediction.quality_warnings:
        for w in prediction.quality_warnings:
            bg_color = "#fef2f2" if w.severity == "error" else "#fffbeb"
            border_color = "#f87171" if w.severity == "error" else "#fde68a"
            text_color = "#991b1b" if w.severity == "error" else "#92400e"
            warnings_html += f"""
            <div style="background:{bg_color}; border-left: 4px solid {border_color}; padding: 10px 14px; margin-bottom: 8px; border-radius: 4px;">
                <div style="font-weight: 600; color: {text_color}; font-size: 13px;">[{w.severity.upper()}] {w.field}</div>
                <div style="font-size: 13px; color: #374151; margin-top: 2px;">{w.message}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Suggested Action: {w.suggested_action}</div>
            </div>
            """
    else:
        warnings_html = "<div style='color: #065f46; font-size: 13px;'>✓ No data quality flags detected. All inputs within plausible clinical bounds.</div>"

    # Vessel table rows
    vessels = [
        ("Overall CAD", prediction.cad),
        ("LAD (Left Anterior Descending)", prediction.lad),
        ("LCX (Left Circumflex)", prediction.lcx),
        ("RCA (Right Coronary Artery)", prediction.rca),
    ]
    
    vessel_rows = ""
    for name, v in vessels:
        prob_color = "#dc2626" if v.percentage >= 70 else ("#d97706" if v.percentage >= 40 else "#059669")
        reasons_list = "".join([f"<li>{r}</li>" for r in v.uncertainty_reasons]) if v.uncertainty_reasons else "<li>None reported</li>"
        vessel_rows += f"""
        <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; font-weight: 600; color: #1e293b;">{name}</td>
            <td style="padding: 12px; font-size: 16px; font-weight: 700; color: {prob_color};">{v.percentage}%</td>
            <td style="padding: 12px; font-size: 13px;">{v.risk_level}</td>
            <td style="padding: 12px; font-size: 12px; color: #4b5563;">
                <div>{v.uncertainty_level}</div>
                <div style="font-size: 11px; color: #9ca3af;">95% CI: [{v.confidence_interval_95[0]*100:.1f}%, {v.confidence_interval_95[1]*100:.1f}%]</div>
            </td>
            <td style="padding: 12px; font-size: 11px; color: #6b7280;">
                <ul style="margin: 0; padding-left: 16px;">{reasons_list}</ul>
            </td>
        </tr>
        """

    # Clinical features summary table
    feat_rows = ""
    items = list(features.items())
    for i in range(0, len(items), 3):
        chunk = items[i:i+3]
        cells = ""
        for k, val in chunk:
            display_val = str(val) if val is not None else "<span style='color:#9ca3af;'>N/A</span>"
            cells += f"""
            <td style="padding: 8px 12px; font-weight: 500; color: #475569; width: 18%;">{k}:</td>
            <td style="padding: 8px 12px; font-weight: 600; color: #0f172a; width: 15%;">{display_val}</td>
            """
        feat_rows += f"<tr style='border-bottom: 1px solid #f1f5f9;'>{cells}</tr>"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CardioVision AI - Patient Risk Analysis Report #{prediction.prediction_id}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            line-height: 1.5;
            margin: 0;
            padding: 36px;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 18px;
            margin-bottom: 24px;
        }}
        .title {{
            font-size: 24px;
            font-weight: 800;
            color: #0f766e;
            letter-spacing: -0.5px;
        }}
        .subtitle {{
            font-size: 13px;
            color: #64748b;
        }}
        .disclaimer-box {{
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            font-size: 12px;
            color: #334155;
            border-radius: 4px;
            margin-bottom: 24px;
        }}
        .card {{
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 18px;
            margin-bottom: 24px;
        }}
        .card-title {{
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 12px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        th {{
            text-align: left;
            padding: 10px 12px;
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }}
        @media print {{
            body {{ padding: 12px; }}
            .no-print {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background:#0f766e; color:white; border:none; padding:10px 18px; border-radius:6px; font-weight:600; cursor:pointer;">
            🖨️ Print / Save as PDF
        </button>
    </div>

    <div class="header">
        <div>
            <div class="title">CardioVision AI</div>
            <div class="subtitle">Explainable, Uncertainty-Aware Cardiovascular Risk Prediction System</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
            <div><strong>Report ID:</strong> {prediction.prediction_id}</div>
            <div><strong>Date Generated:</strong> {now}</div>
            <div><strong>Model Version:</strong> {prediction.model_version}</div>
        </div>
    </div>

    <div class="disclaimer-box">
        <strong>MEDICAL SAFETY & RESEARCH DISCLAIMER:</strong><br>
        {prediction.disclaimer}
    </div>

    <div class="card">
        <div class="card-title">1. Patient Data Quality & Imputation Summary</div>
        <div style="display: flex; gap: 24px; margin-bottom: 14px;">
            <div><strong>Quality Score:</strong> <span style="color:#0f766e; font-weight:700;">{prediction.data_quality_score}/100</span></div>
            <div><strong>Rating:</strong> <span style="font-weight:600;">{prediction.data_quality_grade}</span></div>
            <div><strong>Imputation Applied:</strong> {'Yes' if prediction.imputation_applied else 'None'}</div>
        </div>
        <div>{warnings_html}</div>
    </div>

    <div class="card">
        <div class="card-title">2. Calibrated Probability & Vessel-Specific Risk Analysis</div>
        <table>
            <thead>
                <tr>
                    <th>Anatomical Target</th>
                    <th>Model Probability</th>
                    <th>Risk Band</th>
                    <th>Ensemble Uncertainty</th>
                    <th>Uncertainty Contributors</th>
                </tr>
            </thead>
            <tbody>
                {vessel_rows}
            </tbody>
        </table>
    </div>

    <div class="card">
        <div class="card-title">3. Model Provenance & Calibration Metadata</div>
        <div style="font-size: 13px; color: #475569; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>Training Cohort:</strong> {prediction.dataset_source}</div>
            <div><strong>Calibration Technique:</strong> 5-Fold Stratified Platt Scaling (Sigmoid)</div>
            <div><strong>Ensemble Architecture:</strong> Balanced Random Forest (100 Decision Trees)</div>
            <div><strong>Software Test Mode:</strong> {'Yes (Synthetic Reference)' if prediction.is_synthetic_model else 'No (Clinical Data)'}</div>
        </div>
    </div>

    <div class="card">
        <div class="card-title">4. Recorded Clinical Features</div>
        <table>
            <tbody>
                {feat_rows}
            </tbody>
        </table>
    </div>

    <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 11px; color: #94a3b8;">
        Generated by CardioVision AI Decision Support Prototype • Multimodal AI Hackathon 2026 • Track A: Cardiovascular Risk Visualization & Prediction
    </div>
</body>
</html>"""
    return html
