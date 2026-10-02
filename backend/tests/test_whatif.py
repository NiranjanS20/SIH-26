import pytest
from app.services.whatif_service import simulate_whatif

def test_directionality_equipment_uptime():
    base_sim = simulate_whatif("dongri-buzurg", 80, 80, 0, 0, 1000)
    higher_eq_sim = simulate_whatif("dongri-buzurg", 90, 80, 0, 0, 1000)
    
    assert higher_eq_sim["predicted_production_tons"] > base_sim["predicted_production_tons"]

def test_directionality_blasting_delay():
    base_sim = simulate_whatif("dongri-buzurg", 80, 80, 0, 0, 1000)
    higher_delay_sim = simulate_whatif("dongri-buzurg", 80, 80, 2, 0, 1000)
    
    assert higher_delay_sim["predicted_production_tons"] < base_sim["predicted_production_tons"]

def test_whatif_bounds_endpoint(client):
    response = client.get("/api/v1/whatif/dongri-buzurg/bounds")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "drivers" in data
    assert "equipment_uptime_pct" in data["drivers"]
    assert data["drivers"]["rainfall_mm"]["is_rainfall_proxy"] == True

def test_whatif_simulate_endpoint(client, admin_token_headers):
    payload = {
        "equipment_uptime_pct": 85,
        "plant_availability_pct": 80,
        "blasting_delay_days": 1,
        "rainfall_mm": 5
    }
    response = client.post("/api/v1/whatif/dongri-buzurg/simulate", json=payload, headers=admin_token_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert "predicted_production_tons" in data
    assert "gap_pct" in data
    assert data["is_rainfall_proxy"] == True
    assert "inference_time_ms" in data
