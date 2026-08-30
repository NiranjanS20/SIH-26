import pandas as pd
import numpy as np
import os

def calculate_shortfall():
    print("--- Phase 5: Model 3 Shortfall Calculation ---")
    proc_dir = 'data/processed'
    df = pd.read_csv(os.path.join(proc_dir, 'production_training.csv'))
    
    # 90-day rolling mean + 5% uplift
    df['rolling_90d_mean'] = df['true_production_t'].rolling(90).mean()
    # Explicit Stated Assumption: 5% management uplift target
    df['target_production_t'] = df['rolling_90d_mean'] * 1.05
    
    # Fill early NAs with the first valid target
    first_valid = df['target_production_t'].dropna().iloc[0]
    df['target_production_t'] = df['target_production_t'].fillna(first_valid)
    
    df['shortfall_gap'] = df['target_production_t'] - df['true_production_t']
    df['shortfall_pct'] = np.where(
        df['target_production_t'] > 0,
        df['shortfall_gap'] / df['target_production_t'] * 100,
        0
    )
    
    def classify_risk(pct):
        if pct <= 5: return 'Low'
        elif pct <= 15: return 'Medium'
        else: return 'High'
        
    df['risk_category'] = df['shortfall_pct'].apply(classify_risk)
    
    print("\nShortfall Risk Distribution:")
    print(df['risk_category'].value_counts())
    
    df.to_csv(os.path.join(proc_dir, 'shortfall_data.csv'), index=False)
    print("\n[OK] Model 3 Shortfall calculated and saved.")

if __name__ == '__main__':
    calculate_shortfall()
