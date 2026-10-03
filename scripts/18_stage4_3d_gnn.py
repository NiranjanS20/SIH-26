import os
import time
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.data import Data, Batch
from torch_geometric.nn import SAGEConv, GATConv
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from scipy.spatial import cKDTree
from sklearn.preprocessing import StandardScaler

# --- 1. Synthesize 3D Drillhole Data ---
def generate_synthetic_3d_drillholes(n_holes=50, max_depth=200, interval_length=2.0):
    """
    Synthesizes realistic 3D drillhole composited data.
    Nodes: 2m intervals along drillholes.
    Features: XYZ, Density, Lithology, Interval Length.
    Target: MnO_pct
    """
    print("Synthesizing 3D subsurface drillhole data...")
    np.random.seed(42)
    
    # Define a bounding box for Dongri Buzurg roughly
    x_center, y_center = 5000, 5000
    x_spread, y_spread = 1000, 1000
    
    holes = []
    for hole_id in range(n_holes):
        # Collar coordinates
        x = np.random.normal(x_center, x_spread)
        y = np.random.normal(y_center, y_spread)
        
        # Depth intervals
        depths = np.arange(0, max_depth, interval_length)
        
        for z in depths:
            # Create a localized ore body (plunging lens)
            dist_to_core = np.sqrt((x - x_center)**2 + (y - y_center)**2 + (z - 80)**2)
            
            # Grade distribution
            if dist_to_core < 150:
                # High grade core
                mno_pct = np.random.normal(45.0, 5.0)
                lithology = 1 # Ore zone
                density = np.random.normal(3.8, 0.2)
            elif dist_to_core < 300:
                # Low grade halo
                mno_pct = np.random.normal(15.0, 5.0)
                lithology = 2 # Halo
                density = np.random.normal(2.9, 0.2)
            else:
                # Barren host rock
                mno_pct = np.random.exponential(1.5)
                lithology = 0 # Host
                density = np.random.normal(2.6, 0.1)
                
            mno_pct = np.clip(mno_pct, 0.0, 60.0)
            
            holes.append({
                'hole_id': hole_id,
                'x': x,
                'y': y,
                'z': -z, # Depth is negative Z
                'interval_length': interval_length,
                'density': density,
                'lithology': lithology,
                'MnO_pct': mno_pct
            })
            
    df = pd.DataFrame(holes)
    print(f"Generated {len(df)} 3D intervals across {n_holes} simulated drillholes.")
    return df

# --- 2. Construct 3D Spatial Graph ---
def construct_3d_graph(df, features, k=10):
    print(f"Constructing 3D spatial k-NN graph (k={k})...")
    coords = df[['x', 'y', 'z']].values
    
    # Anisotropic scaling: Z (depth) distances often mean something different geologically than XY distances.
    # We apply a slight down-weighting to Z distance to encourage along-strike/dip connections over cross-strata.
    scaled_coords = coords.copy()
    scaled_coords[:, 2] *= 0.5 
    
    tree = cKDTree(scaled_coords)
    dists, idxs = tree.query(scaled_coords, k=k+1)
    
    edge_index = []
    edge_attr = []
    
    for i in range(len(coords)):
        for j, dist in zip(idxs[i][1:], dists[i][1:]): # skip self
            edge_index.append([i, j])
            # Inverse distance weighting for edges
            weight = 1.0 / (dist + 1e-6)
            edge_attr.append([weight])
            
    edge_index = torch.tensor(edge_index, dtype=torch.long).t().contiguous()
    edge_attr = torch.tensor(edge_attr, dtype=torch.float32)
    
    x_features = torch.tensor(df[features].values, dtype=torch.float32)
    y_target = torch.tensor(df['MnO_pct'].values, dtype=torch.float32).unsqueeze(1)
    
    data = Data(x=x_features, edge_index=edge_index, edge_attr=edge_attr, y=y_target)
    print(f"3D Graph constructed: {data.num_nodes} nodes, {data.num_edges} edges.")
    return data

# --- 3. 3D GNN Architecture ---
class GNN3DModel(nn.Module):
    def __init__(self, num_features, hidden_dim, num_layers=3):
        super().__init__()
        # We use GAT (Attention) because drillhole data requires attending to structural continuity
        # Increased heads to 8 for better isolation of high-grade vs low-grade boundaries
        self.conv1 = GATConv(num_features, hidden_dim, heads=4, concat=False)
        self.conv2 = GATConv(hidden_dim, hidden_dim, heads=4, concat=False)
        self.conv3 = GATConv(hidden_dim, hidden_dim, heads=4, concat=False)
        
        # Regression head for Grade Estimation
        self.regressor = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1)
        )

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        
        x = self.conv2(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        
        x = self.conv3(x, edge_index)
        x = F.relu(x)
        
        return self.regressor(x)

def weighted_mse_loss(pred, target):
    # Apply a 10x penalty to errors in the Economic Ore zone (>20% Mn)
    # This prevents the model from under-predicting the rare high-grade intervals.
    weights = torch.where(target >= 20.0, 10.0, 1.0)
    loss = weights * (pred - target) ** 2
    return loss.mean()

# --- 4. Training and Evaluation ---
def main():
    print("=== Stage 4: 3D Geological GNN Implementation ===")
    
    # 1. Synthesize and prepare data
    df = generate_synthetic_3d_drillholes(n_holes=100, max_depth=200, interval_length=2.0)
    
    # Features for the node
    # Note: Z is included as a feature so the network learns depth-dependent mineralization trends
    features = ['z', 'interval_length', 'density', 'lithology']
    
    scaler = StandardScaler()
    df[features] = scaler.fit_transform(df[features])
    
    # 2. Build 3D Graph
    # We construct one massive graph representing the entire subsurface block
    graph_data = construct_3d_graph(df, features, k=12)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    graph_data = graph_data.to(device)
    
    # 3. K-Fold Cross Validation on Nodes (Masking)
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    indices = np.arange(graph_data.num_nodes)
    
    rmses, r2s, maes = [], [], []
    
    print("\nTraining 3D GNN for Grade Estimation (MnO%)...")
    for fold, (train_idx, test_idx) in enumerate(kf.split(indices)):
        model = GNN3DModel(num_features=len(features), hidden_dim=128).to(device)
        optimizer = torch.optim.Adam(model.parameters(), lr=0.005, weight_decay=1e-4)
        
        train_mask = torch.tensor(train_idx, dtype=torch.long).to(device)
        test_mask = torch.tensor(test_idx, dtype=torch.long).to(device)
        
        # Training loop
        model.train()
        for epoch in range(100):
            optimizer.zero_grad()
            out = model(graph_data.x, graph_data.edge_index)
            loss = weighted_mse_loss(out[train_mask], graph_data.y[train_mask])
            loss.backward()
            optimizer.step()
            
        # Evaluation
        model.eval()
        with torch.no_grad():
            preds = model(graph_data.x, graph_data.edge_index)
            
            y_true = graph_data.y[test_mask].cpu().numpy()
            y_pred = preds[test_mask].cpu().numpy()
            
            rmse = np.sqrt(mean_squared_error(y_true, y_pred))
            mae = mean_absolute_error(y_true, y_pred)
            r2 = r2_score(y_true, y_pred)
            
            rmses.append(rmse)
            maes.append(mae)
            r2s.append(r2)
            
        print(f"Fold {fold+1} -> RMSE: {rmse:.2f} Mn%, R2: {r2:.3f}", flush=True)
        
    print("\n" + "="*50)
    print("      STAGE 4: 3D GNN PERFORMANCE METRICS")
    print("="*50)
    print(f"1. R-Squared (R2) Score : {np.mean(r2s):.4f} +/- {np.std(r2s):.4f}")
    print(f"   (Variance explained by the 3D Graph Model)")
    print("-" * 50)
    print(f"2. Root Mean Square Err : {np.mean(rmses):.4f} +/- {np.std(rmses):.4f} Mn%")
    print(f"   (Average deviation from true drillhole grade)")
    print("-" * 50)
    print(f"3. Mean Absolute Error  : {np.mean(maes):.4f} +/- {np.std(maes):.4f} Mn%")
    print("="*50)
    
    # Save final 3D model
    os.makedirs('models/gnn', exist_ok=True)
    torch.save(model.state_dict(), 'models/gnn/3d_subsurface_gnn.pth')
    print("\nSaved Final 3D Model to: models/gnn/3d_subsurface_gnn.pth")

if __name__ == "__main__":
    main()
