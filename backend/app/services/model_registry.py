import os
import joblib
import xgboost as xgb
from app.core.config import settings

class ModelRegistry:
    def __init__(self):
        self.model1_clf = None
        self.model1_pooled_reg = None
        self.model2_xgb = None
        self.model2_xgb_tirodi = None
        self.model2_xgb_sitapatore = None
        self.shap_explainer = None  # Task 3: instantiate once at startup
        self.is_loaded = False

    def verify_artifacts(self):
        required_models = [
            "model1_clf.joblib",
            "model1_pooled_reg.joblib",
            "model2_xgb.json",
            "model2_xgb_tirodi.json",
            "model2_xgb_sitapatore.json"
        ]
        
        for m in required_models:
            path = os.path.join(settings.MODEL_DIR, m)
            if not os.path.exists(path):
                raise RuntimeError(f"Startup Validation Failed: Missing required model artifact: {path}")
            print(f"  Verified model artifact: {m}")

    def load_models(self):
        print("Loading ML models into memory...")
        self.model1_clf = joblib.load(os.path.join(settings.MODEL_DIR, "model1_clf.joblib"))
        self.model1_pooled_reg = joblib.load(os.path.join(settings.MODEL_DIR, "model1_pooled_reg.joblib"))
        
        self.model2_xgb = xgb.Booster()
        self.model2_xgb.load_model(os.path.join(settings.MODEL_DIR, "model2_xgb.json"))
        
        self.model2_xgb_tirodi = xgb.Booster()
        self.model2_xgb_tirodi.load_model(os.path.join(settings.MODEL_DIR, "model2_xgb_tirodi.json"))
        
        self.model2_xgb_sitapatore = xgb.Booster()
        self.model2_xgb_sitapatore.load_model(os.path.join(settings.MODEL_DIR, "model2_xgb_sitapatore.json"))
        
        self.is_loaded = True
        print("All ML models loaded successfully.")
        
        # Eagerly instantiate SHAP TreeExplainer at startup to avoid lazy-loading latency during live demos
        try:
            import shap
            self.shap_explainer = shap.TreeExplainer(self.model2_xgb)
            print("  SHAP TreeExplainer instantiated (eagerly).")
        except Exception as e:
            print(f"  WARNING: Could not instantiate SHAP TreeExplainer: {e}")

    def get_shap_explainer(self):
        """
        Return the eagerly loaded SHAP TreeExplainer.
        """
        return self.shap_explainer

model_registry = ModelRegistry()

def get_model_registry() -> ModelRegistry:
    return model_registry
