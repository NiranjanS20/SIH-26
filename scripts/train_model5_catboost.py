import os
import pandas as pd
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

def map_rule_action(primary_cause):
    if primary_cause == 'equipment_uptime_pct':
        return "Schedule immediate preventive maintenance"
    elif primary_cause == 'blasting_delay_hrs':
        return "Review drill/blast patterns and safety clearance"
    elif primary_cause in ['rainfall_mm', 'is_monsoon']:
        return "Increase pump capacity and adjust monthly target"
    elif primary_cause == 'is_weekend':
        return "Consider targeted overtime"
    else:
        return "Review historical trends"

def train_catboost():
    print("--- Task 3: Training CatBoost for Feature 5 ---")
    proc_dir = 'data/processed'
    df = pd.read_csv(os.path.join(proc_dir, 'shortfall_data_with_shap.csv'))
    
    features_list = [
        'month', 'is_weekend', 'is_monsoon', 'rainfall_mm', 
        'equipment_uptime_pct', 'blasting_delay_hrs', 
        'lag_1d_production_t', 'lag_7d_mean_production_t',
        'ndvi_seasonal_delta', 'soil_moisture_seasonal_delta',
        'stripping_ratio_miss', 'production_shortfall_pct', 'ob_overrun_pct'
    ]
    
    # We only care about high risk days where action is needed
    high_risk = df[df['risk_category'] == 'High'].copy()
    
    if len(high_risk) == 0:
        print("No high risk days found. Training on all data for demonstration.")
        high_risk = df.copy()
    
    # Extract primary cause and target
    primary_causes = []
    rule_actions = []
    
    for idx, row in high_risk.iterrows():
        shap_vals = {f: abs(row.get(f'shap_{f}', 0)) for f in features_list}
        if sum(shap_vals.values()) == 0:
            # Fallback if no SHAP available
            primary_cause = 'equipment_uptime_pct'
        else:
            primary_cause = max(shap_vals, key=shap_vals.get)
            
        primary_causes.append(primary_cause)
        rule_actions.append(map_rule_action(primary_cause))
        
    high_risk['primary_shap_cause'] = primary_causes
    high_risk['target_action'] = rule_actions
    
    # Define categorical features for CatBoost
    cat_features = ['is_weekend', 'is_monsoon', 'primary_shap_cause']
    
    # Convert types
    for col in cat_features:
        high_risk[col] = high_risk[col].astype(str)
        
    X = high_risk[cat_features]
    y = high_risk['target_action']
    
    # Stratify if enough classes, else just random split
    try:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    except ValueError:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
    clf = CatBoostClassifier(iterations=100, learning_rate=0.1, depth=4, loss_function='MultiClass', random_seed=42, verbose=False)
    
    print("Fitting CatBoostClassifier...")
    clf.fit(X_train, y_train, cat_features=cat_features)
    
    preds = clf.predict(X_test).flatten()
    
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, average='macro', zero_division=0)
    rec = recall_score(y_test, preds, average='macro', zero_division=0)
    f1 = f1_score(y_test, preds, average='macro', zero_division=0)
    
    print(f"\nMetrics:")
    print(f"Accuracy: {acc:.4f}")
    print(f"Precision (macro): {prec:.4f}")
    print(f"Recall (macro): {rec:.4f}")
    print(f"F1 (macro): {f1:.4f}")
    
    cm = confusion_matrix(y_test, preds)
    cm_df = pd.DataFrame(cm, index=clf.classes_, columns=clf.classes_)
    cm_df.to_csv(os.path.join('models/evaluation', 'feature5_confusion_matrix.csv'))
    
    clf.save_model(os.path.join(proc_dir, 'model5_catboost.cbm'))
    print("\nSaved model5_catboost.cbm")
    
    # Create Markdown report
    with open('models/evaluation/feature5_catboost_report.md', 'w') as f:
        f.write("# Feature 5 CatBoost Model Evaluation\n\n")
        f.write("## Objective\n")
        f.write("Train a CatBoost classifier to predict corrective action categories based on operational context and top SHAP causes.\n\n")
        f.write("## Data Limitations & Clarification\n")
        f.write("> [!WARNING]\n")
        f.write("> The synthetic dataset does not contain richer categorical fields (like `equipment_type`, `shift`, `delay_cause_category`) beyond `is_weekend` and `is_monsoon`. To remain compliant with synthetic data anchoring policies, no uncalibrated random categorical fields were artificially injected.\n")
        f.write("> \n")
        f.write("> As a result, the categorical case for CatBoost is weaker than ideally planned. The model achieves near 1.0 accuracy because it is effectively acting as a proxy to reproduce the deterministic logic of the rule engine, rather than learning independently from a complex set of human-applied historical interventions.\n\n")
        f.write("## Metrics\n")
        f.write(f"- **Accuracy:** {acc:.4f}\n")
        f.write(f"- **Precision (Macro):** {prec:.4f}\n")
        f.write(f"- **Recall (Macro):** {rec:.4f}\n")
        f.write(f"- **F1-Score (Macro):** {f1:.4f}\n\n")
        f.write("## Confusion Matrix\n")
        f.write("Saved to `models/evaluation/feature5_confusion_matrix.csv`.\n\n")
        f.write("## Worked Examples\n")
        
        examples = X_test.copy()
        examples['True Action (Rule Engine)'] = y_test
        examples['Predicted Action (CatBoost)'] = preds
        
        # Select 3-5 diverse examples if possible
        samples = examples.sample(min(5, len(examples)))
        
        for idx, row in samples.iterrows():
            f.write(f"### Example {idx}\n")
            f.write(f"- **Context:** Weekend={row['is_weekend']}, Monsoon={row['is_monsoon']}\n")
            f.write(f"- **Primary SHAP Cause:** `{row['primary_shap_cause']}`\n")
            f.write(f"- **Rule Engine Expected Action:** *{row['True Action (Rule Engine)']}*\n")
            f.write(f"- **CatBoost Predicted Action:** *{row['Predicted Action (CatBoost)']}*\n")
            f.write(f"- **Match:** {'Yes' if row['True Action (Rule Engine)'] == row['Predicted Action (CatBoost)'] else 'No'}\n\n")
            

if __name__ == '__main__':
    train_catboost()
