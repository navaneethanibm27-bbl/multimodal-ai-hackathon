import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "CardioVision AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Data & Artifacts paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    DATASET_PATH: str = os.path.join(BASE_DIR, "data", "z_alizadeh_sani_dataset.csv")
    ARTIFACTS_DIR: str = os.path.join(BASE_DIR, "artifacts")
    
    # Database
    SQLITE_DB_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'cardiovision.db')}"
    ENABLE_HISTORY_PERSISTENCE: bool = True

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
