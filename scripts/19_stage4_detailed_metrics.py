import os
import sys
import time
import pandas as pd
import numpy as np
import torch
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler

# Import generation and model logic from stage 4 script
import importlib.util
spec = importlib.util.spec_from_file_location("stage4_script", "scripts/18_stage4_3d_gnn.py")
stage4 = importlib.util.module_from_spec(spec)
sys.modules["stage4_script"] = stage4
spec.loader.exec_module(stage4)

def main():
    print("=== Extracting Detailed 3D Performance Metrics ===")
    
    # 1. Load Data
    t0 = time.time()
    df = stage4.generate_synthetic_3d_drillholes(n_holes=100, max_depth=200, interval_length=2.0)
    data_load_time = time.time() - t0
    
    features = ['z', 'interval_length', 'density', 'lithology']
    scaler = StandardScaler()
    df[features] = scaler.fit_transform(df[features])
    
    # 2. Construct Graph
    t0 = time.time()
    graph_data = stage4.construct_3d_graph(df, features, k=12)
    graph_time = time.time() - t0
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    graph_data = graph_data.to(device)
    
    # 3. Load Model
    model = stage4.GNN3DModel(num_features=len(features), hidden_dim=128).to(device)
    model_path = 'models/gnn/3d_subsurface_gnn.pth'
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
    else:
        print("Model file not found!")
        return
        
    model.eval()
    
    # 4. Inference Speed Test
    # Warmup
    with torch.no_grad():
        _ = model(graph_data.x, graph_data.edge_index)
        
    n_runs = 10
    inf_times = []
    with torch.no_grad():
        for _ in range(n_runs):
            t0 = time.time()
            test_preds = model(graph_data.x, graph_data.edge_index)
            inf_times.append(time.time() - t0)
            
    avg_inference_time = (np.mean(inf_times) * 1000) # ms
    
    # 5. Extract Metrics
    y_true = graph_data.y.cpu().numpy().flatten()
    y_pred = test_preds.cpu().numpy().flatten()
    
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    
    # To provide a Confusion Matrix for a regression task, we apply a Cut-off Grade.
    # In mining, ore is defined by being above a certain cutoff grade (e.g. 20% Mn).
    cutoff = 20.0 
    y_true_binary = (y_true >= cutoff).astype(int)
    y_pred_binary = (y_pred >= cutoff).astype(int)
    
    accuracy = accuracy_score(y_true_binary, y_pred_binary)
    tn, fp, fn, tp = confusion_matrix(y_true_binary, y_pred_binary, labels=[0, 1]).ravel()
    
    print("\n" + "="*50)
    print("    3D GNN (GAT) DETAILED PERFORMANCE REPORT")
    print("="*50)
    print(f"Total Dataset Size : {len(y_true)} 3D drillhole intervals")
    print(f"Total Economic Ore : {int(y_true_binary.sum())} intervals (>20% Mn)")
    print("-" * 50)
    print(f"1. REGRESSION ACCURACY (Grade Estimation):")
    print(f"   R-Squared (R2) : {r2:.4f} (Variance explained)")
    print(f"   RMSE           : {rmse:.4f} %Mn")
    print(f"   MAE            : {mae:.4f} %Mn")
    print("-" * 50)
    print(f"2. ECONOMIC CLASSIFICATION (Cut-off >= 20% Mn):")
    print(f"   Accuracy       : {accuracy * 100:.2f}%")
    print(f"   True Positives (TP) : {tp}   (Ore correctly identified)")
    print(f"   False Positives(FP) : {fp}   (Waste flagged as ore)")
    print(f"   True Negatives (TN) : {tn}   (Waste correctly identified)")
    print(f"   False Negatives(FN) : {fn}   (Ore missed by model)")
    print("-" * 50)
    print(f"3. SPEED & LATENCY:")
    print(f"   Data Generation: {data_load_time:.2f} seconds")
    print(f"   Graph Build    : {graph_time:.2f} seconds")
    print(f"   Inference Time : {avg_inference_time:.2f} ms (for all {len(y_true)} intervals)")
    print("="*50)

if __name__ == '__main__':
    main()
