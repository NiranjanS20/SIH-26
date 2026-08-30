from fastapi import APIRouter
from app.services.model_registry import model_registry
from app.services.data_registry import data_registry
from app.core.security import generate_demo_token

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "models_loaded": model_registry.is_loaded,
        "data_loaded": data_registry.is_loaded
    }

@router.get("/auth/demo-login")
def get_demo_login():
    """Generates a demo JWT token for the React frontend."""
    return {
        "access_token": generate_demo_token("Mine Officer"),
        "token_type": "bearer"
    }
