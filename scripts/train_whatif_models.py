import os
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scripts.model_persistence import evaluate_and_save_model

def get_slug(name):
    return name.lower().replace(" ", "-")

def train_whatif_models():
    print("--- Phase: Training What-If Models for all mines ---")
    data_path = 'data/satellite data and more/synthetic_operational_data_all_mines.csv'
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Missing {data_path}")
        
    df = pd.read_csv(data_path)
    
    unique_mines = df['mine'].unique()
    
    # Model 2 specific features for this dataset
    features = [
        'seasonality_index', 
        'equipment_uptime_pct', 
        'blasting_delay_days', 
        'plant_availability_pct', 
        'rainfall_mm'
    ]
    target = 'actual_production_tons'
    
    proc_dir = 'data/processed'
    os.makedirs(proc_dir, exist_ok=True)
    
    # Also save the bounds cache
    bounds_cache = {}
    
    for mine_name in unique_mines:
        mine_slug = get_slug(mine_name)
        mine_df = df[df['mine'] == mine_name].sort_values('date').reset_index(drop=True)
        
        # Calculate bounds
        bounds_cache[mine_slug] = {
            "equipment_uptime_pct": {
                "min": float(mine_df["equipment_uptime_pct"].min()),
                "median": float(mine_df["equipment_uptime_pct"].median()),
                "max": float(mine_df["equipment_uptime_pct"].max())
            },
            "plant_availability_pct": {
                "min": float(mine_df["plant_availability_pct"].min()),
                "median": float(mine_df["plant_availability_pct"].median()),
                "max": float(mine_df["plant_availability_pct"].max())
            },
            "blasting_delay_days": {
                "min": float(mine_df["blasting_delay_days"].min()),
                "median": float(mine_df["blasting_delay_days"].median()),
                "max": float(mine_df["blasting_delay_days"].max())
            },
            "rainfall_mm": {
                "min": float(mine_df["rainfall_mm"].min()),
                "median": float(mine_df["rainfall_mm"].median()),
                "max": float(mine_df["rainfall_mm"].max())
            }
        }
        
        X = mine_df[features]
        y = mine_df[target]
        
        tscv = TimeSeriesSplit(n_splits=5)
        xgb_params = {'n_estimators': 150, 'learning_rate': 0.1, 'max_depth': 5, 'random_state': 42}
        
        model_name = f"model2_whatif_xgb_{mine_slug}"
        model_path = os.path.join(proc_dir, f"{model_name}.json")
        
        rmse_scores = []
        best_model = None
        
        print(f"\nTraining Model 2 (What-If) for {mine_name}...")
        for train_ix, test_ix in tscv.split(X):
            X_tr, X_te = X.iloc[train_ix], X.iloc[test_ix]
            y_tr, y_te = y.iloc[train_ix], y.iloc[test_ix]
            
            eval_split = int(len(X_tr) * 0.9)
            if eval_split == 0: continue
            X_train_sub, y_train_sub = X_tr.iloc[:eval_split], y_tr.iloc[:eval_split]
            X_eval, y_eval = X_tr.iloc[eval_split:], y_tr.iloc[eval_split:]
            
            model = xgb.XGBRegressor(**xgb_params, early_stopping_rounds=10)
            
            if os.path.exists(model_path):
                model.fit(X_train_sub, y_train_sub, eval_set=[(X_eval, y_eval)], verbose=False, xgb_model=model_path)
            else:
                model.fit(X_train_sub, y_train_sub, eval_set=[(X_eval, y_eval)], verbose=False)
                
            preds = model.predict(X_te)
            rmse_scores.append(np.sqrt(mean_squared_error(y_te, preds)))
            best_model = model
            
        if not rmse_scores:
            print(f"Skipping {mine_name} - not enough data")
            continue
            
        avg_rmse = np.mean(rmse_scores)
        print(f"{mine_name} TimeSeries CV RMSE: {avg_rmse:.2f}")
        
        evaluate_and_save_model(model_name, best_model, avg_rmse, 'RMSE', model_path, minimize=True)
        best_model.get_booster().save_model(model_path)
        
    # Save cache
    import json
    with open(os.path.join(proc_dir, "whatif_bounds_cache.json"), "w") as f:
        json.dump(bounds_cache, f, indent=2)
        
    print("\n[OK] What-If Models trained and bounds cached.")

if __name__ == '__main__':
    train_whatif_models()
