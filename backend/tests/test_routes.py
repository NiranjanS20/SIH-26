import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import generate_demo_token

client = TestClient(app)

def get_auth_headers(role: str = "admin", name: str = "Test User"):
    token = generate_demo_token(role, name)
    return {"Authorization": f"Bearer {token}"}

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200

# LOGIN TESTS
def test_admin_login():
    response = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    assert response.json()["role"] == "admin"

def test_site_manager_login():
    response = client.post("/api/v1/auth/login", json={"username": "sitemanager", "password": "site123"})
    assert response.status_code == 200
    assert response.json()["role"] == "site_manager"

def test_industry_login():
    response = client.post("/api/v1/auth/login", json={"username": "industry", "password": "industry123"})
    assert response.status_code == 200
    assert response.json()["role"] == "industry_viewer"

def test_invalid_credentials():
    response = client.post("/api/v1/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert response.status_code == 401

def test_invalid_token():
    response = client.get("/api/v1/mines/dongri-buzurg/workspace", headers={"Authorization": "Bearer invalid.token.here"})
    assert response.status_code == 401

# AUTHORIZATION TESTS
def test_workspace_no_auth():
    response = client.get("/api/v1/mines/dongri-buzurg/workspace")
    assert response.status_code == 401 # Should be 401 Unauthorized, not 403

def test_admin_cause_analysis():
    with TestClient(app) as client_with_lifespan:
        response = client_with_lifespan.get(
            "/api/v1/mines/dongri-buzurg/cause-analysis",
            headers=get_auth_headers("admin", "Admin User")
        )
        assert response.status_code in [200, 404]

def test_site_manager_denial_cause_analysis():
    with TestClient(app) as client_with_lifespan:
        response = client_with_lifespan.get(
            "/api/v1/mines/dongri-buzurg/cause-analysis",
            headers=get_auth_headers("site_manager", "Site Manager User")
        )
        assert response.status_code == 403

def test_industry_viewer_denial_operational():
    with TestClient(app) as client_with_lifespan:
        # Industry viewer should be denied from workspace (operational endpoint)
        response = client_with_lifespan.get(
            "/api/v1/mines/dongri-buzurg/workspace",
            headers=get_auth_headers("industry_viewer", "Industry User")
        )
        assert response.status_code == 403

        # Also denied from whatif
        payload = {
            "equipment_availability_pct": 85.0,
            "blasting_delay_days": 1.0,
            "precipitation_mm": 50.0
        }
        resp_denied = client_with_lifespan.post(
            "/api/v1/whatif/dongri-buzurg/simulate",
            json=payload,
            headers=get_auth_headers(role="industry_viewer")
        )
        assert resp_denied.status_code == 403

        # Authorized
        resp_allowed = client_with_lifespan.post(
            "/api/v1/whatif/dongri-buzurg/simulate",
            json=payload,
            headers=get_auth_headers(role="admin")
        )
        assert resp_allowed.status_code in [200, 500]

def test_admin_endpoints_rbac():
    with TestClient(app) as client_with_lifespan:
        # Admin allowed
        admin_resp = client_with_lifespan.get(
            "/api/v1/admin/overview",
            headers=get_auth_headers("admin", "Admin User")
        )
        assert admin_resp.status_code == 200
        assert admin_resp.json()["success"] is True

        # Site manager denied from admin overview
        sm_resp = client_with_lifespan.get(
            "/api/v1/admin/overview",
            headers=get_auth_headers("site_manager", "Site Manager User")
        )
        assert sm_resp.status_code == 403

        # Industry viewer denied from admin overview
        ind_resp = client_with_lifespan.get(
            "/api/v1/admin/overview",
            headers=get_auth_headers("industry_viewer", "Industry User")
        )
        assert ind_resp.status_code == 403

    def test_gemini_interpret_endpoint(self, client_with_lifespan):
        payload = {
            "latitude": 21.5545,
            "longitude": 79.7020,
            "site_name": "Dongri Buzurg Mine",
            "peak_grade_pct": 42.8,
            "seam_center_m": 185,
            "overburden_m": 45,
            "boreholes": [
                {"id": "BH-01", "dist": 100, "depth": 320, "dip": 85}
            ]
        }
        resp = client_with_lifespan.post("/api/v1/prospectivity/gemini-interpret", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "interpretation" in data
        assert len(data["interpretation"]) > 50

