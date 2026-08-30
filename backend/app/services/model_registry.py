import os
import joblib
import xgboost as xgb
from app.core.config import settings

class ModelRegistry:
    def __init__(self):
        self.model1_clf = None
        self.model1_reg = None
        self.model2_xgb = None
        self.is_loaded = False

    def verify_artifacts(self):
        required_models = [
            "model1_clf.joblib",
            "model1_reg.joblib",
            "model2_xgb.json"
        ]
        
        for m in required_models:
            path = os.path.join(settings.MODEL_DIR, m)
            if not os.path.exists(path):
                raise RuntimeError(f"Startup Validation Failed: Missing required model artifact: {path}")
            print(f"Verified model artifact: {m}")

    def load_models(self):
        print("Loading ML models into memory...")
        self.model1_clf = joblib.load(os.path.join(settings.MODEL_DIR, "model1_clf.joblib"))
        self.model1_reg = joblib.load(os.path.join(settings.MODEL_DIR, "model1_reg.joblib"))
        
        self.model2_xgb = xgb.Booster()
        self.model2_xgb.load_model(os.path.join(settings.MODEL_DIR, "model2_xgb.json"))
        
        self.is_loaded = True
        print("All ML models loaded successfully.")

model_registry = ModelRegistry()

def get_model_registry() -> ModelRegistry:
    return model_registry
