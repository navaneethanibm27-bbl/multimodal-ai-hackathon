"""
CardioVision AI - Main FastAPI Application
Explainable, Uncertainty-Aware Cardiovascular Risk Prediction and 3D Heart Visualization
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.database.connection import init_db
from backend.app.ml.model_loader import registry
from backend.app.api.routes import (
    health,
    validation,
    predictions,
    explainability,
    metrics,
    reports,
    history,
    simulation
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization warning: {e}")
        
    # Verify models loaded
    registry.load_artifacts()
    print(f"CardioVision AI API initialized. Models loaded: {registry.is_loaded}")
    yield

# Ensure database tables exist on import
try:
    init_db()
except Exception as e:
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multimodal AI Hackathon 2026 - Track A: Cardiovascular Risk Visualization & Prediction API",
    lifespan=lifespan
)

# CORS configuration for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes under /api
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(validation.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(explainability.router, prefix=settings.API_V1_STR)
app.include_router(metrics.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(history.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_url": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
