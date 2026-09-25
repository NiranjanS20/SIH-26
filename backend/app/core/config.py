from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Dongri Buzurg AI Backend"
    
    # comma separated string -> list
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175,http://localhost:3000,http://127.0.0.1:3000"
    
    JWT_SECRET: str = "moil-sih-2026-super-secret-key-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 8
    
    DATA_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/processed"))
    MODEL_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/processed"))
    
    # Weather feature — default OFF for demo-day network reliability
    WEATHER_ENABLED: bool = False
    OPENWEATHER_API_KEY: str = ""

    # Google Gemini API Key for Geological Copilot
    GEMINI_API_KEY: str = ""

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = 'ignore'

settings = Settings()
