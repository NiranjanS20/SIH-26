from fastapi import APIRouter
from app.services.model_registry import model_registry
from app.services.data_registry import data_registry

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "models_loaded": model_registry.is_loaded,
        "data_loaded": data_registry.is_loaded
    }
