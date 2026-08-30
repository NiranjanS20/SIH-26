from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Dongri Buzurg AI Backend"
    
    # comma separated string -> list
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    
    DATA_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/processed"))
    MODEL_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/processed"))
    
    JWT_SECRET: str = "your_super_secret_jwt_key_here_for_demo"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    RATE_LIMIT_PER_MINUTE: int = 100

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
