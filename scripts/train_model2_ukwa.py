import os
import json
import numpy as np
import pandas as pd
import joblib

from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from prophet import Prophet
from xgboost import XGBRegressor
from catboost import CatBoostRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split

models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models'))
os.makedirs(models_dir, exist_ok=True)

def fit_annual_trend_qualitative():
    print("\n--- Qualitative Benchmarking: 6-Year Annual Trend ---")
    
    # Real 6-year data (actual ROM from MCDR)
    years = [2017, 2018, 2019, 2020, 2021, 2022]
    rom_actual = [23930, 49303, 89994, 74884, 94587, 113946]
    
    df_annual = pd.DataFrame({'year': years, 'rom': rom_actual})
    
    print("Real Data:")
    print(df_annual)
    
    print("\nPredicting year 2023 for trend plausibility (qualitative check):")
    
    # 1. Holt-Winters
    try:
        hw = ExponentialSmoothing(rom_actual, trend='add', seasonal=None, initialization_method='estimated').fit()
        hw_pred = hw.forecast(1)[0]
        print(f"Holt-Winters:      {hw_pred:,.0f} t")
    except Exception as e:
        print(f"Holt-Winters failed: {e}")
        
    # 2. SARIMAX
    try:
        sar = SARIMAX(rom_actual, order=(1,1,0)).fit(disp=False)
        sar_pred = sar.forecast(1)[0]
        print(f"SARIMAX (1,1,0):   {sar_pred:,.0f} t")
    except Exception as e:
        print(f"SARIMAX failed: {e}")
        
    # 3. Prophet
    try:
        prophet_df = pd.DataFrame({'ds': pd.to_datetime([f"{y}-12-31" for y in years]), 'y': rom_actual})
        m = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False)
        m.fit(prophet_df)
        future = m.make_future_dataframe(periods=1, freq='Y')
        forecast = m.predict(future)
        pro_pred = forecast.iloc[-1]['yhat']
        print(f"Prophet:           {pro_pred:,.0f} t")
    except Exception as e:
        print(f"Prophet failed: {e}")
        
    # 4. XGBoost & CatBoost
    X = np.array(years).reshape(-1, 1)
    y = np.array(rom_actual)
    X_future = np.array([[2023]])
    
    xgb = XGBRegressor(n_estimators=10, max_depth=2, random_state=42)
    xgb.fit(X, y)
    print(f"XGBoost:           {xgb.predict(X_future)[0]:,.0f} t")
    
    cat = CatBoostRegressor(iterations=10, depth=2, random_state=42, verbose=0)
    cat.fit(X, y)
    print(f"CatBoost:          {cat.predict(X_future)[0]:,.0f} t")

def generate_daily_synthetic():
    print("\n--- Quantitative Daily Calibration (Synthetic wrapping real annuals) ---")
    
    years = {
        2017: 23930,
        2018: 49303,
        2019: 89994,
        2020: 74884,
        2021: 94587,
        2022: 113946
    }
    
    df_list = []
    
    for y, target in years.items():
        dates = pd.date_range(start=f"{y}-04-01", end=f"{y+1}-03-31")
        df_year = pd.DataFrame({'date': dates})
        df_year['day_of_week'] = df_year['date'].dt.dayofweek
        
        # Zero-production day: Saturday (day_of_week == 5)
        df_year['is_saturday'] = (df_year['day_of_week'] == 5).astype(int)
        
        operating_days = sum(df_year['is_saturday'] == 0)
        base_daily = target / operating_days
        
        np.random.seed(y)
        noise = np.random.normal(0, base_daily * 0.1, len(df_year))
        daily_rom = np.where(df_year['is_saturday'] == 1, 0, base_daily + noise)
        daily_rom = np.maximum(daily_rom, 0)
        
        # scale to hit exact target
        scale_factor = target / np.sum(daily_rom)
        daily_rom = daily_rom * scale_factor
        
        df_year['rom_tonnes'] = daily_rom
        
        # Ukwa has NO beneficiation plant (manual sorting only, 100% dispatch)
        df_year['processed_tonnes'] = df_year['rom_tonnes']
        
        # Grade tiers (using MCDR prices)
        def price_logic(processed):
            if processed == 0: return 0
            # Rough proxy distribution to match typical Ukwa output
            val = (processed * 0.15 * 4709.07) + \
                  (processed * 0.45 * 9942.03) + \
                  (processed * 0.35 * 15243.41) + \
                  (processed * 0.05 * 24142.00)
            return val
            
        df_year['estimated_value'] = df_year['processed_tonnes'].apply(price_logic)
        df_list.append(df_year)
        
    df = pd.concat(df_list, ignore_index=True)
    print(f"Generated {len(df)} daily points over 6 years.")
    
    # Verify rollup
    print("\nVerify Rollup to Real Annual Targets:")
    for y, target in years.items():
        mask = (df['date'] >= f"{y}-04-01") & (df['date'] <= f"{y+1}-03-31")
        print(f"FY {y}-{str(y+1)[-2:]}: Target = {target:,.0f}, Sum = {df[mask]['rom_tonnes'].sum():,.0f}")
        
    return df

def train_daily_model(df):
    print("\n--- Training Supervised Model on Daily Synthetic Series ---")
    
    df['day_of_year'] = df['date'].dt.dayofyear
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    
    features = ['day_of_year', 'month', 'year', 'is_saturday']
    X = df[features]
    y = df['estimated_value']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    
    cat = CatBoostRegressor(iterations=100, depth=4, verbose=0, random_state=42)
    cat.fit(X_train, y_train)
    
    cat_preds = cat.predict(X_test)
    cat_rmse = np.sqrt(mean_squared_error(y_test, cat_preds))
    print(f"CatBoost RMSE on Value: {cat_rmse:,.0f}")
    
    xgb = XGBRegressor(n_estimators=100, max_depth=4, random_state=42)
    xgb.fit(X_train, y_train)
    
    xgb_preds = xgb.predict(X_test)
    xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_preds))
    print(f"XGBoost RMSE on Value: {xgb_rmse:,.0f}")
    
    # Save the winner
    if cat_rmse < xgb_rmse:
        print("Saving CatBoost model...")
        out_path = os.path.join(models_dir, 'model2_ukwa_ug.cbm')
        cat.save_model(out_path)
    else:
        print("Saving XGBoost model...")
        out_path = os.path.join(models_dir, 'model2_ukwa_ug.json')
        xgb.save_model(out_path)
    print(f"Model saved to {out_path}")

def main():
    fit_annual_trend_qualitative()
    df = generate_daily_synthetic()
    train_daily_model(df)

if __name__ == '__main__':
    main()
