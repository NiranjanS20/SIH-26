import jwt
from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from app.core.config import settings

security = HTTPBearer()

def verify_jwt(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        # In a real app, algorithms should be explicit. For demo, we just decode.
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(allowed_roles: List[str]):
    def role_checker(payload: dict = Security(verify_jwt)):
        user_role = payload.get("role")
        if not user_role or user_role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return payload
    return role_checker

# Helper to mock token generation for demo purposes
def generate_demo_token(role: str):
    return jwt.encode({"sub": "demo_user", "role": role}, settings.JWT_SECRET, algorithm="HS256")
