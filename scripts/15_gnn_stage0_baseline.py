import os
import sys
import importlib.util
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from lightgbm import LGBMClassifier
from sklearn.model_selection import GroupKFold
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, average_precision_score
from sklearn.preprocessing import StandardScaler

# Import 10_train_model1_pooled.py dynamically
spec = importlib.util.spec_from_file_location("pooled_script", "scripts/10_train_model1_pooled.py")
pooled_script = importlib.util.module_from_spec(spec)
sys.modules["pooled_script"] = pooled_script
spec.loader.exec_module(pooled_script)

def get_pooled_data():
    df_dongri = pooled_script.process_dongri_buzurg()
    df_sitapatore = pooled_script.process_sitapatore()
    
    # Calculate derived features for Dongri Buzurg
    df_dongri['ndvi_seasonal_delta'] = df_dongri['ndvi_monsoon'] - df_dongri['ndvi_dry']
    df_dongri['lst_seasonal_range'] = df_dongri['lst_summer'] - df_dongri['lst_monsoon']
    df_dongri['soil_moisture_seasonal_delta'] = df_dongri['soil_moisture_monsoon'] - df_dongri['soil_moisture_dry']
    
    df_tirodi = pooled_script.process_tirodi()
    
    core_features = [
        'ndvi_monsoon', 'ndvi_dry', 'ndvi_seasonal_delta', 'ndvi_current',
        'lst_monsoon', 'lst_summer', 'lst_seasonal_range', 'lst_current',
        'soil_moisture_monsoon', 'soil_moisture_dry', 'soil_moisture_seasonal_delta', 'soil_moisture_current',
        'iron_oxide_index', 'clay_index', 'slope', 'elevation', 'mno_geochem_proxy'
    ]
    
    pooled_df = pd.concat([df_dongri, df_tirodi, df_sitapatore], ignore_index=True)
    pooled_df['site_is_tirodi'] = (pooled_df['site_id'] == 'tirodi').astype(int)
    
    train_features = core_features + ['site_is_tirodi']
    
    pooled_df = pooled_df.dropna(subset=train_features + ['MnO_pct', 'is_gondite_mn_ore'])
    
    return pooled_df, train_features

def main():
    print("=== Stage 0: Re-establishing Verified Baseline ===")
    pooled_df, train_features = get_pooled_data()
    
    X = pooled_df[train_features]
    y = pooled_df['is_gondite_mn_ore']
    groups = pooled_df['site_id']
    
    print(f"Total Pooled Samples: {len(pooled_df)}")
    print(f"Class Distribution: {y.value_counts().to_dict()}")
    
    models = {
        'Random Forest': RandomForestClassifier(class_weight='balanced', random_state=42),
        'Logistic Regression': LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42),
        'SVM': SVC(kernel='rbf', probability=True, class_weight='balanced', random_state=42),
        'LightGBM': LGBMClassifier(class_weight='balanced', random_state=42, verbose=-1)
    }
    
    gkf = GroupKFold(n_splits=len(groups.unique()))
    
    results = []
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        metrics = {'Precision': [], 'Recall': [], 'F1': [], 'AUROC': [], 'AUPRC': []}
        
        for train_idx, test_idx in gkf.split(X, y, groups):
            X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
            y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
            test_sites = groups.iloc[test_idx].unique()
            print(f"  Hold-out site: {test_sites[0]}")
            
            scaler = StandardScaler()
            X_train_sc = scaler.fit_transform(X_train)
            X_test_sc = scaler.transform(X_test)
            
            model.fit(X_train_sc, y_train)
            
            preds = model.predict(X_test_sc)
            probs = model.predict_proba(X_test_sc)[:, 1] if hasattr(model, 'predict_proba') else preds
            
            # Since some sites might not have positive cases, handle metrics carefully
            if len(np.unique(y_test)) > 1:
                metrics['Precision'].append(precision_score(y_test, preds, zero_division=0))
                metrics['Recall'].append(recall_score(y_test, preds, zero_division=0))
                metrics['F1'].append(f1_score(y_test, preds, zero_division=0))
                metrics['AUROC'].append(roc_auc_score(y_test, probs))
                metrics['AUPRC'].append(average_precision_score(y_test, probs))
            else:
                print(f"    Skipping metrics for {test_sites[0]} (only 1 class in test set)")
                
        if len(metrics['F1']) > 0:
            mean_metrics = {k: np.mean(v) for k, v in metrics.items()}
            mean_metrics['Model'] = name
            results.append(mean_metrics)
            print(f"  {name} Mean AUPRC: {mean_metrics['AUPRC']:.4f}")
            
    res_df = pd.DataFrame(results)
    print("\n--- Baseline Results ---")
    print(res_df.to_string(index=False))
    
    # Save results
    os.makedirs('models/benchmarks', exist_ok=True)
    res_df.to_csv('models/benchmarks/stage0_baseline.csv', index=False)
    print("\nSaved to models/benchmarks/stage0_baseline.csv")

if __name__ == '__main__':
    main()
