import os
import pandas as pd
from app.core.config import settings

class DataRegistry:
    def __init__(self):
        self.mcdr_ground_truth = None
        self.mcdr_reserves = None
        self.shortfall_data = None
        self.shap_summary = None
        self.corrective_actions = None
        self.is_loaded = False

    def verify_artifacts(self):
        required_csvs = [
            "mcdr_ground_truth.csv",
            "mcdr_reserves.csv",
            "shortfall_data.csv",
            "shap_summary_model2.csv",
            "corrective_actions.csv"
        ]
        
        for csv in required_csvs:
            path = os.path.join(settings.DATA_DIR, csv)
            if not os.path.exists(path):
                raise RuntimeError(f"Startup Validation Failed: Missing required CSV artifact: {path}")
            print(f"Verified data artifact: {csv}")

    def load_data(self):
        print("Loading CSV datasets into memory...")
        self.mcdr_ground_truth = pd.read_csv(os.path.join(settings.DATA_DIR, "mcdr_ground_truth.csv"))
        self.mcdr_reserves = pd.read_csv(os.path.join(settings.DATA_DIR, "mcdr_reserves.csv"))
        self.shortfall_data = pd.read_csv(os.path.join(settings.DATA_DIR, "shortfall_data.csv"))
        self.shap_summary = pd.read_csv(os.path.join(settings.DATA_DIR, "shap_summary_model2.csv"))
        self.corrective_actions = pd.read_csv(os.path.join(settings.DATA_DIR, "corrective_actions.csv"))
        
        self.is_loaded = True
        print("All datasets loaded successfully.")

data_registry = DataRegistry()

def get_data_registry() -> DataRegistry:
    return data_registry
