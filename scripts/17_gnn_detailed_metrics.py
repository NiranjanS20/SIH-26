import os
import sys
import time
import importlib.util
import pandas as pd
import numpy as np
import torch
from torch_geometric.data import Data, Batch
from sklearn.metrics import accuracy_score, mean_squared_error, confusion_matrix
from sklearn.preprocessing import StandardScaler
from scipy.spatial import cKDTree

# Import pooled data logic
spec = importlib.util.spec_from_file_location("pooled_script", "scripts/10_train_model1_pooled.py")
pooled_script = importlib.util.module_from_spec(spec)
sys.modules["pooled_script"] = pooled_script
spec.loader.exec_module(pooled_script)

# Import GNNModel from pipeline
spec2 = importlib.util.spec_from_file_location("gnn_pipeline", "scripts/16_gnn_pipeline.py")
gnn_pipeline = importlib.util.module_from_spec(spec2)
sys.modules["gnn_pipeline"] = gnn_pipeline
spec2.loader.exec_module(gnn_pipeline)

def main():
    print("=== Extracting Detailed Performance Metrics ===")
    
    # 1. Load Data
    t0 = time.time()
    df, features = gnn_pipeline.get_pooled_data()
    data_load_time = time.time() - t0
    
    scaler = StandardScaler()
    df[features] = scaler.fit_transform(df[features])
    
    # Construct Graphs
    t0 = time.time()
    site_graphs = gnn_pipeline.construct_site_graphs(df, features, k=8)
    graph_time = time.time() - t0
    
    # Prepare batch
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    all_batch = Batch.from_data_list(list(site_graphs.values())).to(device)
    
    # 2. Load Model
    model = gnn_pipeline.GNNModel(num_features=len(features), hidden_dim=64, num_layers=2, model_type='GAT').to(device)
    
    model_path = 'models/gnn/pooled_gnn_model.pth'
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
        print(f"Loaded trained GAT model from {model_path}")
    else:
        print("Model file not found! Please ensure training completed successfully.")
        return
        
    model.eval()
    
    # 3. Inference Speed Test
    # Warmup
    with torch.no_grad():
        _ = model(all_batch.x, all_batch.edge_index, all_batch.edge_attr)
        
    n_runs = 10
    inf_times = []
    with torch.no_grad():
        for _ in range(n_runs):
            t0 = time.time()
            test_preds = model(all_batch.x, all_batch.edge_index, all_batch.edge_attr)
            inf_times.append(time.time() - t0)
            
    avg_inference_time = (np.mean(inf_times) * 1000) # milliseconds
    
    # 4. Extract Metrics
    y_true = all_batch.y.cpu().numpy()
    y_prob = test_preds.cpu().numpy()
    
    # Convert probabilities to binary predictions using a threshold (0.5)
    # Because of extreme imbalance, models tend to predict low probabilities. 
    # Let's see raw thresholding at 0.5 first.
    threshold = 0.5
    y_pred = (y_prob > threshold).astype(int)
    
    accuracy = accuracy_score(y_true, y_pred)
    
    # Confusion Matrix
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    
    # Since GNN was trained to predict presence of ore (0/1), RMSE against actual Grade (MnO_pct) requires aligning df
    # Let's extract RMSE of the predicted probability against the binary label first (Brier score equivalent)
    rmse_prob = np.sqrt(mean_squared_error(y_true, y_prob))
    
    # For actual Grade RMSE, we need the original MnO_pct
    actual_grade = df['MnO_pct'].values
    
    # Let's assume the probability scales roughly with grade if calibrated (it isn't perfectly calibrated)
    # Instead, we will report RMSE of the probability itself as requested, or just print the matrix.
    
    print("\n" + "="*50)
    print("      GNN (GAT) DETAILED PERFORMANCE REPORT")
    print("="*50)
    print(f"Total Dataset Size : {len(y_true)} grid cells")
    print(f"Total Confirmed Ore: {int(y_true.sum())} cells")
    print("-" * 50)
    print(f"1. ACCURACY       : {accuracy * 100:.2f}%")
    print(f"   (Note: Accuracy is deceptive due to 99.6% negative class imbalance)")
    print("-" * 50)
    print(f"2. CONFUSION MATRIX:")
    print(f"   True Positives (TP) : {tp}   (Ore correctly identified)")
    print(f"   False Positives(FP) : {fp}   (Barren flagged as ore)")
    print(f"   True Negatives (TN) : {tn}   (Barren correctly identified)")
    print(f"   False Negatives(FN) : {fn}   (Ore missed by model)")
    print("-" * 50)
    print(f"3. RMSE           : {rmse_prob:.4f}")
    print(f"   (Root Mean Square Error between predicted prospectivity and actual 0/1 label)")
    print("-" * 50)
    print(f"4. SPEED & LATENCY:")
    print(f"   Data Loading   : {data_load_time:.2f} seconds")
    print(f"   Graph Build    : {graph_time:.2f} seconds")
    print(f"   Inference Time : {avg_inference_time:.2f} ms (for all {len(y_true)} cells simultaneously)")
    print("="*50)

if __name__ == '__main__':
    main()
