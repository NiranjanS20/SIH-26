import pandas as pd
import numpy as np
import os
import joblib

def gap_to_target_lookup(model, row, target_production, features):
    # Grid size: 21x21 = 441 combinations (fast enough for inference)
    # Equipment uptime: from current to 1.0
    uptimes = np.linspace(row['equipment_uptime_pct'], 1.0, 21)
    # Blasting delay: from 0 to current
    delays = np.linspace(0, max(row['blasting_delay_hrs'], 0.1), 21)
    
    current_u = row['equipment_uptime_pct']
    current_d = row['blasting_delay_hrs']
    
    feasible_actions = []
    best_shortfall_diff = float('inf')
    best_shortfall_action = None
    
    # Batch predict for speed
    sim_rows = []
    sim_params = []
    for u in uptimes:
        for d in delays:
            sim_row = row.copy()
            sim_row['equipment_uptime_pct'] = u
            sim_row['blasting_delay_hrs'] = d
            sim_rows.append(sim_row[features].values)
            sim_params.append((u, d))
            
    X_sim = pd.DataFrame(sim_rows, columns=features)
    preds = model.predict(X_sim)
    
    for i, pred in enumerate(preds):
        u, d = sim_params[i]
        if pred >= target_production:
            # Normalized Euclidean distance (smallest change)
            # Uptime range is ~0.3, Delay range is ~4. Normalize to 0-1 scale approx.
            dist_u = (u - current_u) / max(1.0 - current_u, 1e-5)
            dist_d = (current_d - d) / max(current_d, 1e-5)
            total_change = np.sqrt(dist_u**2 + dist_d**2)
            
            feasible_actions.append({
                'uptime': u,
                'delay': d,
                'pred': pred,
                'change_score': total_change
            })
        else:
            diff = target_production - pred
            if diff < best_shortfall_diff:
                best_shortfall_diff = diff
                best_shortfall_action = {
                    'uptime': u,
                    'delay': d,
                    'pred': pred
                }
                
    if not feasible_actions:
        u = best_shortfall_action['uptime']
        d = best_shortfall_action['delay']
        p = best_shortfall_action['pred']
        return f"Max effort (Uptime: {u*100:.1f}%, Delay: {d:.1f}h) yields {p:.1f}t (still short by {best_shortfall_diff:.1f}t)"
        
    # Rank by smallest total change
    feasible_actions.sort(key=lambda x: x['change_score'])
    
    # Format top 2-3
    top_n = min(3, len(feasible_actions))
    options = []
    for i in range(top_n):
        opt = feasible_actions[i]
        options.append(f"Option {i+1}: Increase uptime to {opt['uptime']*100:.1f}% and reduce blasting delay to {opt['delay']:.1f} hrs (Forecast: {opt['pred']:.1f}t)")
        
    return " | ".join(options)

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
