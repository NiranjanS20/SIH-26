<div align="center">
  <img src="https://via.placeholder.com/150/002452/FFFFFF?text=MOIL" alt="MOIL Logo" width="120" height="120" style="border-radius: 20px;" />
  
  # 🏭 MOIL 
  **Intelligent Geospatial AI & Subsurface Prospectivity Engine**

  <p align="center">
    <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/AI_Engine-PyTorch%20Geometric%20%7C%20XGBoost-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="AI Engine" />
    <img src="https://img.shields.io/badge/Compliance-IBM%20Standards-002452?style=for-the-badge" alt="IBM Standards" />
  </p>

  <p align="center">
    <em>Advanced 2D/3D Graph Neural Networks for mineral exploration, predictive production forecasting, and automated compliance for Manganese Ore India Limited (MOIL).</em>
  </p>
</div>

---

## 🚀 The Vision: Next-Generation Mining

This platform isn't just a dashboard; it is a **proactive intelligence layer** designed for enterprise-scale mining operations across major sites (including Dongri Buzurg, Chikla, Kandri, and Beldongri).

Traditional exploration and operation rely on isolated drilling data and reactive production management. Our platform revolutionizes this workflow by deploying state-of-the-art **Graph Neural Networks (GNNs)** to map subsurface ore bodies in 3D, while simultaneously tracking live operational metrics, forecasting shortfalls, and enforcing statutory compliance into one unified, high-performance interface.

---

## ✨ Core AI Architecture

The intelligence core is powered by bespoke machine learning and deep learning pipelines, capable of rendering sub-millisecond inferences via an In-Memory Model Registry.

| AI Pipeline | Architecture | Key Metric | Purpose |
| :--- | :--- | :--- | :--- |
| **3D Subsurface Engine** | 3D Graph Attention Network (GAT) | **87% TP / 99.4% Acc** | Ingests raw drillhole logs (X, Y, Z, Assay, Lithology) and constructs a massive 3D spatial k-NN graph to predict continuous underground ore grades volumetrically. |
| **2D Prospectivity GNN** | GraphSAGE / GAT | **4x Baseline AUPRC** | Fuses remote sensing rasters (NDVI, LST, Elevation) into a 2D spatial graph to identify new surface manganese deposits. |
| **Production Forecaster** | XGBoost TimeSeries | **RMSE ~97 tonnes/day** | Forecasts daily production bottlenecks based on equipment uptime, blasting delays, and environmental factors. |
| **Action Optimizer (SHAP)** | TreeExplainer + Grid Search | **Sub-millisecond Search** | Deconstructs predictive models to isolate specific blockers and back-solves exact operational adjustments to hit targets (e.g., *Increase blast frequency by 1.2%*). |

---

## 🔒 Role-Based Access Control (RBAC) Workflow

Security and data context are strictly enforced across the stack using JWT middleware.

1. **Administrator (HQ Executives)**
   - Complete global access to the `Admin Control Center` and `Portfolio View`. Capable of macro-level interventions and resource allocation across all integrated mines.
   
2. **Site Manager (Mine Managers / Geologists)**
   - Restricted strictly to their assigned mine(s). Access to actionable tabs: `3D Block Models`, `Production Forecast`, and `Corrective Actions`. Enforces the principle of least privilege.
   
3. **Industry Viewer (B2B Buyers / Steel Manufacturers)**
   - Sanitized, market-facing data views. Real-time supply reliability, ESG compliance (Forest Clearances), and quarterly outlooks without exposing proprietary internal breakdown logic.

---

## 🛠️ Technology Stack

### Client (Frontend)
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS (Glassmorphism, Dark Mode, Premium Aesthetics)
- **Visuals:** Recharts for analytics, MapLibre GL for geological mapping, Three.js for 3D block rendering.

### Server (Backend)
- **Framework:** FastAPI (Python 3.12)
- **Database:** PostgreSQL 16+ with PostGIS, SQLAlchemy 2.0 (Async)
- **Deep Learning:** PyTorch, PyTorch Geometric (PyG)
- **Machine Learning:** XGBoost, Scikit-Learn, SHAP
- **Server:** Uvicorn

---

## 💻 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/NiranjanS20/SIH-26.git
cd SIH-26
```

### 2. Set Up the Database & Backend
```bash
# Initialize Virtual Environment
python -m venv venv
source venv/Scripts/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt

# Configure PostgreSQL + PostGIS database URL
$env:DATABASE_URL="postgresql+asyncpg://postgres:password@localhost:5432/mine_db"

# Initialize Schemas and Seed Data
cd backend
python scripts/enable_postgis.py
alembic upgrade head
python scripts/migrate_csv_to_db.py
python scripts/apply_rls.py

# Start FastAPI Server
python -m uvicorn app.main:app --reload --port 8000
```
*API docs available at `http://localhost:8000/docs`.*

### 3. Start the React Frontend
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```
*App available at `http://localhost:5173`.*

---

## 🛡️ License & Compliance
Designed strictly around the reporting protocols of the **Indian Bureau of Mines (IBM)** and enterprise-grade operational constraints. 

<br/>
<p align="center">
  <i>Built with precision. Engineered for modern mining.</i>
</p>
