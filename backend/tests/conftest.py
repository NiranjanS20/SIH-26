import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add the backend directory to sys.path so 'app' can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.security import generate_demo_token

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def admin_token_headers():
    token = generate_demo_token("admin", "Admin User")
    return {"Authorization": f"Bearer {token}"}
