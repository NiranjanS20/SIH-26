# Dongri Buzurg AI Prospectivity & Forecasting Platform

An AI-driven manganese prospectivity and production-forecasting system built for MOIL's Dongri Buzurg opencast mine (Bhandara district, Maharashtra) - Smart India Hackathon (SIH 2026).

## Architecture

This project is structured as a monolithic repository containing both the frontend dashboard and the machine learning backend:
- **Frontend (`/src`)**: React + TypeScript + Vite. Dynamic dashboard utilizing Tailwind CSS for the user interface.
- **Backend (`/backend`)**: FastAPI (Python) serving machine learning inferences (Random Forest, XGBoost), handling role-based access control (RBAC), and maintaining hash-chained audit logs.
- **Data & Models (`/data/processed` & `/models`)**: Trained artifacts and extracted ground-truth CSVs that the backend loads directly into memory on startup.

## Quick Start Guide

### 1. Backend Setup
The backend runs on Python 3.10+ and uses FastAPI.

```bash
# Navigate to the root directory
cd SIH_26009

# (Optional but recommended) Create a virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows

# Install the backend dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server (Runs on port 8000)
uvicorn backend.app.main:app --reload
```
*API Documentation available at: `http://localhost:8000/docs`*

### 2. Frontend Setup
The frontend runs on Node.js and uses Vite.

```bash
# Open a new terminal instance and navigate to the root directory
cd SIH_26009

# Install Node dependencies
npm install

# Start the React development server (Runs on port 5173)
npm run dev
```
*Dashboard available at: `http://localhost:5173`*

## Key Features
1. **Prospectivity Scoring**: Spatial predictions for high-yield manganese zones.
2. **Production Forecasting**: Live XGBoost what-if simulation based on equipment availability, blasting delays, and weather conditions.
3. **Shortfall Diagnosis**: Automated gap analysis identifying potential risks in the mining cycle.
4. **Corrective Actions**: Rule-based remediation engine for mitigating operational delays.

## Development & Testing
To run the automated backend test suite:
```bash
pytest backend/tests/test_routes.py
```
