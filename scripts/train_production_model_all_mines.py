import os
import pandas as pd
import numpy as np
import json
import joblib
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import shap

def to_camel_case(text):
    return ''.join(word.title() if i > 0 else word.lower() for i, word in enumerate(text.split()))

def get_mine_id(mine_name):
    return mine_name.lower().replace(" ", "-")

def run_pipeline():
    print("--- Starting Production Forecasting Pipeline for ALL Mines ---")
    data_path = r"D:\Personal_Projects\SIH_26009\data\satellite data and more\synthetic_operational_data_all_mines.csv"
    
    if not os.path.exists(data_path):
        print(f"ERROR: Cannot find {data_path}")
        return

    df = pd.read_csv(data_path)
    mines = df['mine'].unique()
    
    # We will save model artifacts here
    models_dir = r"D:\Personal_Projects\SIH_26009\backend\app\models"
    os.makedirs(models_dir, exist_ok=True)
    
    metadata = {}
    
    for mine in mines:
        mine_id = get_mine_id(mine)
        print(f"\n--- Training XGBoost for {mine} ({mine_id}) ---")
        
        mine_df = df[df['mine'] == mine].copy()
        
        # Features and target
        features = ['equipment_uptime_pct', 'blasting_delay_days', 'plant_availability_pct', 'rainfall_mm', 'seasonality_index']
        X = mine_df[features]
        y = mine_df['actual_production_tons']
        
        # Train-test split (chronological or random. Given it's daily synthetic, random is okay for baseline)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train Model
        model = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
        model.fit(X_train, y_train)
        
        # Evaluate
        preds = model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        print(f"Model trained. RMSE: {rmse:.2f} tons")
        
        # Save Model
        model_path = os.path.join(models_dir, f"xgb_{mine_id}.pkl")
        joblib.dump(model, model_path)
        
        # Calculate SHAP values for Feature Importance
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test)
        
        # Mean absolute SHAP values per feature
        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        total_shap = np.sum(mean_abs_shap)
        
        feature_importance = []
        colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        categories = ['Operational', 'Operational', 'Operational', 'Environmental', 'Environmental']
        
        for idx, col in enumerate(features):
            weight_pct = (mean_abs_shap[idx] / total_shap) * 100 if total_shap > 0 else 0
            
            # Map column names to pretty labels
            labels = {
                'equipment_uptime_pct': 'Equipment Uptime',
                'blasting_delay_days': 'Blasting Delays',
                'plant_availability_pct': 'Plant Availability',
                'rainfall_mm': 'Rainfall & Monsoon Impact',
                'seasonality_index': 'Seasonal Variations'
            }
            
            feature_importance.append({
                "feature": labels[col],
                "weightPct": round(weight_pct, 1),
                "category": categories[idx],
                "color": colors[idx]
            })
            
        # Sort by importance descending
        feature_importance = sorted(feature_importance, key=lambda x: x['weightPct'], reverse=True)
        
        # Calculate baseline metrics
        avg_actual = mine_df['actual_production_tons'].mean() * 30  # Monthly avg
        avg_target = mine_df['planned_target_tons_per_day'].mean() * 30
        
        metadata[mine_id] = {
            "mineName": mine,
            "rmse_tons": round(rmse, 2),
            "monthly_actual_tons": round(avg_actual, 0),
            "monthly_target_tons": round(avg_target, 0),
            "featureImportance": feature_importance
        }
        
    # Save Metadata to JSON
    metadata_path = os.path.join(models_dir, "production_metadata.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"\nAll models trained and saved to {models_dir}")
    print(f"Metadata exported to {metadata_path}")

if __name__ == "__main__":
    run_pipeline()
