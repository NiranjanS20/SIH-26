import os
import time
import warnings
import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from prophet import Prophet
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, mean_absolute_percentage_error
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

def load_data():
    proc_dir = 'data/processed'
    df = pd.read_csv(os.path.join(proc_dir, 'production_training.csv'))
    df['date'] = pd.to_datetime(df['date'])
    return df

def benchmark_models(df):
    features = [
        'month', 'is_weekend', 'is_monsoon', 'rainfall_mm', 
        'equipment_uptime_pct', 'blasting_delay_hrs', 
        'lag_1d_production_t', 'lag_7d_mean_production_t',
        'ndvi_seasonal_delta', 'soil_moisture_seasonal_delta',
        'stripping_ratio_miss', 'production_shortfall_pct', 'ob_overrun_pct'
    ]
    target = 'true_production_t'
    
    tscv = TimeSeriesSplit(n_splits=5)
    
    results = []
    
    models_to_run = ['XGBoost (Default/Tuned)', 'SARIMAX (Default)', 'Prophet (Default)', 'Holt-Winters (Default)']
    
    metrics = {m: {'RMSE': [], 'MAE': [], 'MAPE': [], 'TrainTime': [], 'InferenceTime_per_day': []} for m in models_to_run}
    
    for train_ix, test_ix in tscv.split(df):
        df_tr, df_te = df.iloc[train_ix].copy(), df.iloc[test_ix].copy()
        
        X_tr, y_tr = df_tr[features], df_tr[target]
        X_te, y_te = df_te[features], df_te[target]
        
        # Scaling for exogenous variables (SARIMAX/Prophet)
        scaler = StandardScaler()
        X_tr_sc = scaler.fit_transform(X_tr)
        X_te_sc = scaler.transform(X_te)
        
        # We need dataframes with proper column names for Prophet
        X_tr_sc_df = pd.DataFrame(X_tr_sc, columns=features, index=df_tr.index)
        X_te_sc_df = pd.DataFrame(X_te_sc, columns=features, index=df_te.index)
        
        # 1. XGBoost (Doesn't strictly need scaling, but we train it as original)
        xgb = XGBRegressor(n_estimators=200, learning_rate=0.1, max_depth=5, random_state=42)
        t0 = time.time()
        xgb.fit(X_tr, y_tr)
        t_train_xgb = time.time() - t0
        
        t1 = time.time()
        preds_xgb = xgb.predict(X_te)
        t_inf_xgb = time.time() - t1
        
        metrics['XGBoost (Default/Tuned)']['RMSE'].append(np.sqrt(mean_squared_error(y_te, preds_xgb)))
        metrics['XGBoost (Default/Tuned)']['MAE'].append(mean_absolute_error(y_te, preds_xgb))
        metrics['XGBoost (Default/Tuned)']['MAPE'].append(mean_absolute_percentage_error(y_te, preds_xgb))
        metrics['XGBoost (Default/Tuned)']['TrainTime'].append(t_train_xgb)
        metrics['XGBoost (Default/Tuned)']['InferenceTime_per_day'].append(t_inf_xgb / len(y_te) * 1000)
        
        # 2. SARIMAX (Uses scaled exogenous)
        try:
            t0 = time.time()
            sarimax = SARIMAX(endog=y_tr.values, exog=X_tr_sc, order=(1, 1, 1))
            sarimax_fit = sarimax.fit(disp=False)
            t_train_sarimax = time.time() - t0
            
            t1 = time.time()
            preds_sarimax = sarimax_fit.forecast(steps=len(y_te), exog=X_te_sc)
            t_inf_sarimax = time.time() - t1
        except Exception:
            preds_sarimax = np.full(len(y_te), y_tr.mean())
            t_train_sarimax = 0
            t_inf_sarimax = 0
            
        metrics['SARIMAX (Default)']['RMSE'].append(np.sqrt(mean_squared_error(y_te, preds_sarimax)))
        metrics['SARIMAX (Default)']['MAE'].append(mean_absolute_error(y_te, preds_sarimax))
        metrics['SARIMAX (Default)']['MAPE'].append(mean_absolute_percentage_error(y_te, preds_sarimax))
        metrics['SARIMAX (Default)']['TrainTime'].append(t_train_sarimax)
        metrics['SARIMAX (Default)']['InferenceTime_per_day'].append(t_inf_sarimax / len(y_te) * 1000 if len(y_te) > 0 else 0)
        
        # 3. Prophet (Uses scaled exogenous)
        try:
            prophet_df_tr = pd.DataFrame({'ds': df_tr['date'], 'y': y_tr})
            for f in features:
                prophet_df_tr[f] = X_tr_sc_df[f]
                
            t0 = time.time()
            prophet = Prophet()
            for f in features:
                prophet.add_regressor(f)
            prophet.fit(prophet_df_tr)
            t_train_prophet = time.time() - t0
            
            prophet_df_te = pd.DataFrame({'ds': df_te['date']})
            for f in features:
                prophet_df_te[f] = X_te_sc_df[f].values
                
            t1 = time.time()
            prophet_preds_df = prophet.predict(prophet_df_te)
            preds_prophet = prophet_preds_df['yhat'].values
            t_inf_prophet = time.time() - t1
        except Exception as e:
            print(f"Prophet failed: {e}")
            preds_prophet = np.full(len(y_te), y_tr.mean())
            t_train_prophet = 0
            t_inf_prophet = 0
        
        metrics['Prophet (Default)']['RMSE'].append(np.sqrt(mean_squared_error(y_te, preds_prophet)))
        metrics['Prophet (Default)']['MAE'].append(mean_absolute_error(y_te, preds_prophet))
        metrics['Prophet (Default)']['MAPE'].append(mean_absolute_percentage_error(y_te, preds_prophet))
        metrics['Prophet (Default)']['TrainTime'].append(t_train_prophet)
        metrics['Prophet (Default)']['InferenceTime_per_day'].append(t_inf_prophet / len(y_te) * 1000)
        
        # 4. Holt-Winters (Univariate only, no exogenous)
        try:
            t0 = time.time()
            hw = ExponentialSmoothing(y_tr.values, trend='add', seasonal='add', seasonal_periods=7) # Weekly seasonality
            hw_fit = hw.fit()
            t_train_hw = time.time() - t0
            
            t1 = time.time()
            preds_hw = hw_fit.forecast(steps=len(y_te))
            t_inf_hw = time.time() - t1
        except Exception:
            preds_hw = np.full(len(y_te), y_tr.mean())
            t_train_hw = 0
            t_inf_hw = 0
            
        metrics['Holt-Winters (Default)']['RMSE'].append(np.sqrt(mean_squared_error(y_te, preds_hw)))
        metrics['Holt-Winters (Default)']['MAE'].append(mean_absolute_error(y_te, preds_hw))
        metrics['Holt-Winters (Default)']['MAPE'].append(mean_absolute_percentage_error(y_te, preds_hw))
        metrics['Holt-Winters (Default)']['TrainTime'].append(t_train_hw)
        metrics['Holt-Winters (Default)']['InferenceTime_per_day'].append(t_inf_hw / len(y_te) * 1000 if len(y_te) > 0 else 0)

    for m in models_to_run:
        mean_metrics = {k: np.mean(v) for k, v in metrics[m].items()}
        mean_metrics['Algorithm'] = m
        mean_metrics['Task'] = 'Forecasting'
        results.append(mean_metrics)
        
    return pd.DataFrame(results)

if __name__ == '__main__':
    print("Loading data for Task 2 Benchmarking...")
    df = load_data()
    
    print("Benchmarking Time Series Models...")
    final_df = benchmark_models(df)
    
    out_path = 'models/benchmarks/feature2_leaderboard.csv'
    final_df.to_csv(out_path, index=False)
    print(f"Saved leaderboard to {out_path}")
