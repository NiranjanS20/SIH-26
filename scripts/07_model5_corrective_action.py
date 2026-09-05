import pandas as pd
import numpy as np
import os
import joblib

def gap_to_target_lookup(model, row, target_production, features):
    # Sweep equipment uptime and blasting delay to find what is needed to reach target
    # We will simulate ranges
    uptimes = np.linspace(row['equipment_uptime_pct'], 1.0, 5) # From current to 100%
    delays = np.linspace(0, row['blasting_delay_hrs'], 5) # From 0 to current delay
    
    best_diff = float('inf')
    best_action = "No feasible action found"
    
    # Simple grid search for the back-solve
    for u in uptimes:
        for d in delays:
            sim_row = row.copy()
            sim_row['equipment_uptime_pct'] = u
            sim_row['blasting_delay_hrs'] = d
            
            # Predict
            X_sim = pd.DataFrame([sim_row[features]])
            pred = model.predict(X_sim)[0]
            
            if pred >= target_production:
                # We reached it!
                action = f"Increase uptime to {u*100:.1f}% and reduce blasting delay to {d:.1f} hrs."
                return action
            else:
                diff = target_production - pred
                if diff < best_diff:
                    best_diff = diff
                    best_action = f"Max effort (Uptime: {u*100:.1f}%, Delay: {d:.1f}h) yields {pred:.1f}t (still short by {diff:.1f}t)"
                    
    return best_action

def generate_actions():
    print("--- Phase 5: Model 5 Corrective Action ---")
    proc_dir = 'data/processed'
    df = pd.read_csv(os.path.join(proc_dir, 'shortfall_data_with_shap.csv'))
    from xgboost import XGBRegressor
    model = XGBRegressor()
    model.load_model(os.path.join(proc_dir, 'model2_xgb.json'))
    
    features = [
        'month', 'is_weekend', 'is_monsoon', 'rainfall_mm', 
        'equipment_uptime_pct', 'blasting_delay_hrs', 
        'lag_1d_production_t', 'lag_7d_mean_production_t',
        'ndvi_seasonal_delta', 'soil_moisture_seasonal_delta',
        'stripping_ratio_miss', 'production_shortfall_pct', 'ob_overrun_pct'
    ]
    
    high_risk = df[df['risk_category'] == 'High'].copy()
    
    actions = []
    
    for idx, row in high_risk.iterrows():
        # Find primary cause from SHAP
        shap_vals = {f: abs(row[f'shap_{f}']) for f in features}
        primary_cause = max(shap_vals, key=shap_vals.get)
        
        target = row['target_production_t']
        
        # Rule-based primary action
        if primary_cause == 'equipment_uptime_pct':
            rule_action = "Primary Cause: Equipment Downtime. Schedule immediate preventive maintenance."
        elif primary_cause == 'blasting_delay_hrs':
            rule_action = "Primary Cause: Blasting Delays. Review drill/blast patterns and safety clearance."
        elif primary_cause == 'rainfall_mm' or primary_cause == 'is_monsoon':
            rule_action = "Primary Cause: Weather/Monsoon. Increase pump capacity and adjust monthly target."
        elif primary_cause == 'is_weekend':
            rule_action = "Primary Cause: Weekend Shift. Consider targeted overtime."
        else:
            rule_action = f"Primary Cause: {primary_cause}. Review historical trends."
            
        # Gap-to-target back-solve
        gap_action = gap_to_target_lookup(model, row, target, features)
        
        actions.append({
            'date': row.get('date', f'Day_{idx}'),
            'shortfall_pct': row['shortfall_pct'],
            'rule_action': rule_action,
            'gap_to_target_action': gap_action
        })
        
    act_df = pd.DataFrame(actions)
    if not act_df.empty:
        print("\nSample Corrective Actions (High Risk Days):")
        print(act_df.head())
        act_df.to_csv(os.path.join(proc_dir, 'corrective_actions.csv'), index=False)
    
    print("\n[OK] Corrective Actions generated.")

if __name__ == '__main__':
    generate_actions()
