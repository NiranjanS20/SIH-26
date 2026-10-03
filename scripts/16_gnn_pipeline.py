import os
import sys
import importlib.util
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.data import Data, Batch
from torch_geometric.nn import GCNConv, SAGEConv, GATConv
from sklearn.model_selection import GroupKFold
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, average_precision_score
from sklearn.preprocessing import StandardScaler
from scipy.spatial import cKDTree

# Import pooled data logic
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
    
    # Needs geometry for spatial graph
    pooled_df = pooled_df.dropna(subset=train_features + ['is_gondite_mn_ore'])
    return pooled_df, train_features

def construct_site_graphs(df, features, k=8):
    """Stage 1: Construct per-site spatial k-NN graphs"""
    site_graphs = {}
    for site_id, site_df in df.groupby('site_id'):
        # Normalize features per site or globally (globally is better, do it before this)
        # But for now, we just build edges
        coords = np.array([(g.x, g.y) for g in site_df.geometry])
        tree = cKDTree(coords)
        
        # k+1 because the query includes the point itself
        dists, idxs = tree.query(coords, k=k+1)
        
        edge_index = []
        edge_attr = []
        for i in range(len(coords)):
            for j, dist in zip(idxs[i][1:], dists[i][1:]): # skip self
                edge_index.append([i, j])
                edge_attr.append(1.0 / (dist + 1e-6)) # inverse distance weighting
                
        edge_index = torch.tensor(edge_index, dtype=torch.long).t().contiguous()
        edge_attr = torch.tensor(edge_attr, dtype=torch.float32)
        
        x = torch.tensor(site_df[features].values, dtype=torch.float32)
        y = torch.tensor(site_df['is_gondite_mn_ore'].values, dtype=torch.float32)
        
        # Also store original indices to map back predictions
        orig_indices = torch.tensor(site_df.index.values, dtype=torch.long)
        
        data = Data(x=x, edge_index=edge_index, edge_attr=edge_attr, y=y, orig_indices=orig_indices, site=site_id)
        site_graphs[site_id] = data
        print(f"Graph for {site_id}: {data.num_nodes} nodes, {data.num_edges} edges")
        
    return site_graphs

class GNNModel(nn.Module):
    """Stage 3: GCN / GraphSAGE / GAT Architecture"""
    def __init__(self, num_features, hidden_dim, num_layers=2, model_type='SAGE'):
        super().__init__()
        self.layers = nn.ModuleList()
        
        if model_type == 'GCN':
            conv = GCNConv
        elif model_type == 'SAGE':
            conv = SAGEConv
        elif model_type == 'GAT':
            conv = GATConv
        else:
            raise ValueError("Invalid model_type")
            
        self.layers.append(conv(num_features, hidden_dim))
        for _ in range(num_layers - 2):
            self.layers.append(conv(hidden_dim, hidden_dim))
        self.layers.append(conv(hidden_dim, hidden_dim))
        
        self.classifier = nn.Linear(hidden_dim, 1)

    def forward(self, x, edge_index, edge_attr=None):
        for i, layer in enumerate(self.layers):
            if isinstance(layer, GCNConv):
                x = layer(x, edge_index, edge_weight=edge_attr)
            else:
                x = layer(x, edge_index)
            if i < len(self.layers) - 1:
                x = F.relu(x)
                x = F.dropout(x, p=0.3, training=self.training)
        
        logits = self.classifier(x)
        return torch.sigmoid(logits).squeeze(-1)

def pu_loss(preds, labels, pi=0.05, positive_weight=1.0, unlabeled_weight=0.2):
    """
    Stage 2: Positive-Unlabeled (PU) Learning Loss.
    Standard BCE doesn't work well when negatives are actually unlabeled.
    We apply higher weight to known positives and a penalty to unlabeled.
    pi: estimated prior of positives in the unlabeled set.
    """
    # Simple weighted BCE
    # Unlabeled = 0, Positive = 1
    weights = torch.where(labels == 1, positive_weight, unlabeled_weight)
    bce = F.binary_cross_entropy(preds, labels, weight=weights, reduction='mean')
    return bce

def train_and_evaluate_gnn():
    print("=== Stage 1-3: GNN Prospectivity Mapping ===")
    df, features = get_pooled_data()
    
    # Global scaling
    scaler = StandardScaler()
    df[features] = scaler.fit_transform(df[features])
    
    site_graphs = construct_site_graphs(df, features, k=8)
    
    # GroupKFold by site_id
    sites = list(site_graphs.keys())
    
    metrics = {'Precision': [], 'Recall': [], 'F1': [], 'AUROC': [], 'AUPRC': []}
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # For GNN, we do leave-one-site-out CV
    for holdout_site in sites:
        print(f"\nTraining with Hold-out site: {holdout_site}")
        
        train_data_list = [site_graphs[s] for s in sites if s != holdout_site]
        test_data = site_graphs[holdout_site].to(device)
        
        train_batch = Batch.from_data_list(train_data_list).to(device)
        
        model = GNNModel(num_features=len(features), hidden_dim=64, num_layers=2, model_type='GAT').to(device)
        optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=1e-4)
        
        model.train()
        for epoch in range(200):
            optimizer.zero_grad()
            preds = model(train_batch.x, train_batch.edge_index, train_batch.edge_attr)
            loss = pu_loss(preds, train_batch.y, positive_weight=10.0, unlabeled_weight=1.0)
            loss.backward()
            optimizer.step()
            
            if epoch % 50 == 0:
                print(f"  Epoch {epoch:03d}, Loss: {loss.item():.4f}")
                
        model.eval()
        with torch.no_grad():
            test_preds = model(test_data.x, test_data.edge_index, test_data.edge_attr)
            
        y_true = test_data.y.cpu().numpy()
        y_prob = test_preds.cpu().numpy()
        y_pred = (y_prob > 0.5).astype(int)
        
        if len(np.unique(y_true)) > 1:
            p = precision_score(y_true, y_pred, zero_division=0)
            r = recall_score(y_true, y_pred, zero_division=0)
            f1 = f1_score(y_true, y_pred, zero_division=0)
            auroc = roc_auc_score(y_true, y_prob)
            auprc = average_precision_score(y_true, y_prob)
            
            metrics['Precision'].append(p)
            metrics['Recall'].append(r)
            metrics['F1'].append(f1)
            metrics['AUROC'].append(auroc)
            metrics['AUPRC'].append(auprc)
            print(f"  Test AUPRC: {auprc:.4f}, AUROC: {auroc:.4f}, F1: {f1:.4f}")
        else:
            print(f"  Skipping metrics for {holdout_site} (only 1 class in test set)")
            
    if len(metrics['F1']) > 0:
        print("\n--- GNN Cross-Validation Results ---")
        for k, v in metrics.items():
            print(f"{k}: {np.mean(v):.4f} +/- {np.std(v):.4f}")
            
    # Save the final pooled model
    print("\nTraining final pooled GNN model on all sites...")
    all_batch = Batch.from_data_list(list(site_graphs.values())).to(device)
    final_model = GNNModel(num_features=len(features), hidden_dim=64, num_layers=2, model_type='GAT').to(device)
    optimizer = torch.optim.Adam(final_model.parameters(), lr=0.01, weight_decay=1e-4)
    
    final_model.train()
    for epoch in range(200):
        optimizer.zero_grad()
        preds = final_model(all_batch.x, all_batch.edge_index, all_batch.edge_attr)
        loss = pu_loss(preds, all_batch.y, positive_weight=10.0, unlabeled_weight=1.0)
        loss.backward()
        optimizer.step()
        
    os.makedirs('models/gnn', exist_ok=True)
    torch.save(final_model.state_dict(), 'models/gnn/pooled_gnn_model.pth')
    print("Saved final GNN model to models/gnn/pooled_gnn_model.pth")
    
if __name__ == '__main__':
    train_and_evaluate_gnn()
