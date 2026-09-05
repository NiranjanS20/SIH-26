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
        self.production_training = None
        self.production_calibration = None
        self.is_loaded = False

    def verify_artifacts(self):
        # Required CSVs that the backend cannot run without
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
            print(f"  Verified data artifact: {csv}")

    def load_data(self):
        print("Loading CSV datasets into memory...")
        self.mcdr_ground_truth = pd.read_csv(os.path.join(settings.DATA_DIR, "mcdr_ground_truth.csv"))
        self.mcdr_reserves = pd.read_csv(os.path.join(settings.DATA_DIR, "mcdr_reserves.csv"))
        self.shortfall_data = pd.read_csv(os.path.join(settings.DATA_DIR, "shortfall_data.csv"))
        self.shap_summary = pd.read_csv(os.path.join(settings.DATA_DIR, "shap_summary_model2.csv"))
        self.corrective_actions = pd.read_csv(os.path.join(settings.DATA_DIR, "corrective_actions.csv"))
        
        # Optional CSVs — confirmed real script outputs via grep of scripts/04_*.py and scripts/01_*.py
        optional_csvs = {
            "production_training": "production_training.csv",
            "production_calibration": "production_calibration.csv",
        }
        for attr, filename in optional_csvs.items():
            path = os.path.join(settings.DATA_DIR, filename)
            if os.path.exists(path):
                setattr(self, attr, pd.read_csv(path))
                print(f"  Loaded optional: {filename}")
            else:
                print(f"  Optional CSV not found, skipping: {filename}")
        
        self.is_loaded = True
        print("All datasets loaded successfully.")

data_registry = DataRegistry()

def get_data_registry() -> DataRegistry:
    return data_registry
