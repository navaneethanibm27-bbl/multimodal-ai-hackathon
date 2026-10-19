import {
  SystemHealth,
  ValidationResponse,
  PredictionResponse,
  ExplainResponse,
  ModelMetricsData,
  HistoryRecord
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server error ${res.status}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<SystemHealth>(res);
  },

  async getModelInfo(): Promise<any> {
    const res = await fetch(`${API_BASE}/model-info`);
    return handleResponse<any>(res);
  },

  async validateData(features: Record<string, any>): Promise<ValidationResponse> {
    const res = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features)
    });
    return handleResponse<ValidationResponse>(res);
  },

  async predict(features: Record<string, any>, saveToHistory: boolean = true): Promise<PredictionResponse> {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        features,
        enable_uncertainty_quantification: true,
        save_to_history: saveToHistory
      })
    });
    return handleResponse<PredictionResponse>(res);
  },

  async explain(features: Record<string, any>, target: string = 'CAD', topN: number = 8): Promise<ExplainResponse> {
    const res = await fetch(`${API_BASE}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        features,
        target,
        top_n: topN
      })
    });
    return handleResponse<ExplainResponse>(res);
  },

  async getMetrics(): Promise<{ metadata: any; metrics: Record<string, ModelMetricsData> }> {
    const res = await fetch(`${API_BASE}/metrics`);
    return handleResponse<{ metadata: any; metrics: Record<string, ModelMetricsData> }>(res);
  },

  async getReportHtml(prediction: PredictionResponse, features: Record<string, any>): Promise<string> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prediction, features })
    });
    if (!res.ok) {
      throw new Error(`Report generation failed: ${res.statusText}`);
    }
    return res.text();
  },

  async getHistory(): Promise<{ enabled: boolean; records: HistoryRecord[] }> {
    const res = await fetch(`${API_BASE}/history`);
    return handleResponse<{ enabled: boolean; records: HistoryRecord[] }>(res);
  },

  async deleteHistoryRecord(id: string): Promise<{ status: string; deleted_id: string }> {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ status: string; deleted_id: string }>(res);
  },

  async simulate(baselineFeatures: Record<string, any>, interventionFeatures: Record<string, any>): Promise<any> {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseline_features: baselineFeatures,
        intervention_features: interventionFeatures
      })
    });
    return handleResponse<any>(res);
  }
};

