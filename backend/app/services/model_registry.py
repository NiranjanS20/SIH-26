import os
import joblib
import xgboost as xgb
from app.core.config import settings

class ModelRegistry:
    def __init__(self):
        self.model1_clf = None
        self.model1_reg = None
        self.model2_xgb = None
        self.shap_explainer = None  # Task 3: instantiate once at startup
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
            print(f"  Verified model artifact: {m}")

    def load_models(self):
        print("Loading ML models into memory...")
        self.model1_clf = joblib.load(os.path.join(settings.MODEL_DIR, "model1_clf.joblib"))
        self.model1_reg = joblib.load(os.path.join(settings.MODEL_DIR, "model1_reg.joblib"))
        
        self.model2_xgb = xgb.Booster()
        self.model2_xgb.load_model(os.path.join(settings.MODEL_DIR, "model2_xgb.json"))
        
        self.is_loaded = True
        print("All ML models loaded successfully.")
        # NOTE: SHAP TreeExplainer is NOT loaded here because `import shap`
        # takes 30s+ on this system (it pulls in torch/tensorflow).
        # The cause-analysis endpoint uses pre-computed CSV data from
        # shap_summary_model2.csv, so the explainer is not needed at startup.
        # If on-demand SHAP is needed later, call get_shap_explainer().

    def get_shap_explainer(self):
        """
        Lazy-load SHAP TreeExplainer on first access.
        There must be exactly ONE instantiation site for TreeExplainer
        in the entire codebase — this is it.
        """
        if self.shap_explainer is None and self.model2_xgb is not None:
            try:
                import shap
                self.shap_explainer = shap.TreeExplainer(self.model2_xgb)
                print("  SHAP TreeExplainer instantiated (lazy, single instance).")
            except Exception as e:
                print(f"  WARNING: Could not instantiate SHAP TreeExplainer: {e}")
        return self.shap_explainer

model_registry = ModelRegistry()

def get_model_registry() -> ModelRegistry:
    return model_registry
