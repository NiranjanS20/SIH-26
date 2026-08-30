# Dongri Buzurg AI Backend

## Overview
This is the FastAPI backend for the Dongri Buzurg Prospectivity & Forecasting Platform (SIH 2026). It serves ML inferences and insights seamlessly to the frontend workspace.

## Setup Instructions

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Environment Variables:**
Copy `.env.example` to `.env`. The defaults work out-of-the-box for local React development (`localhost:5173`).

3. **Run the server:**
```bash
uvicorn app.main:app --reload
```
The server will start on `http://127.0.0.1:8000`. 
API docs are available at `http://127.0.0.1:8000/docs`.

## Architecture
- **Framework:** FastAPI
- **Security:** JWT Authentication and Role-Based Access Control (RBAC). SlowAPI rate limiting. Hash-chain audit logging.
- **Performance:** In-memory caching of the entire workspace state (assembled from pandas CSVs at startup). Live XGBoost inference for What-If scenarios.
- **Startup Validation:** The lifespan event verifies all models and datasets exist before the server accepts traffic.
