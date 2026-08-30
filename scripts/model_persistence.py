import os
import json
import joblib
from datetime import datetime

LOG_FILE = 'data/processed/persistence_log.json'

def load_persistence_log():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_persistence_log(log_data):
    with open(LOG_FILE, 'w') as f:
        json.dump(log_data, f, indent=4)

def evaluate_and_save_model(model_name, new_model, new_metric, metric_name, model_path, minimize=True, epsilon=1e-4):
    """
    Evaluates a new model against an existing one based on a metric.
    Only overwrites if the new metric strictly improves (by at least epsilon).
    
    minimize: True for RMSE/MAE, False for F1/Accuracy
    """
    log_data = load_persistence_log()
    improved = False
    
    # Check if existing model and log exist
    if os.path.exists(model_path) and model_name in log_data:
        old_metric = log_data[model_name].get('metric_value')
        if old_metric is not None:
            if minimize:
                improved = new_metric < (old_metric - epsilon)
            else:
                improved = new_metric > (old_metric + epsilon)
        else:
            improved = True # No old metric to compare to
    else:
        old_metric = None
        improved = True # No existing model
        
    # Build comparison record
    comparison = {
        'timestamp': datetime.now().isoformat(),
        'model_name': model_name,
        'metric_name': metric_name,
        'before': float(old_metric) if old_metric is not None else None,
        'after': float(new_metric) if new_metric is not None else None,
        'improved': bool(improved)
    }
    
    if improved:
        print(f"\n[PERSISTENCE] {model_name} improved {metric_name} from {old_metric} to {new_metric}. Saving model.")
        if not model_path.endswith('.json'):
            joblib.dump(new_model, model_path)
        log_data[model_name] = {
            'metric_name': metric_name,
            'metric_value': new_metric,
            'last_updated': comparison['timestamp']
        }
    else:
        print(f"\n[PERSISTENCE] {model_name} did not improve {metric_name} (Old: {old_metric}, New: {new_metric}). Keeping existing model.")
        
    # Keep history
    if 'history' not in log_data:
        log_data['history'] = []
    log_data['history'].append(comparison)
    
    save_persistence_log(log_data)
    return improved
