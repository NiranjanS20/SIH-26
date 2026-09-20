import jwt
import datetime
from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from app.core.config import settings

security = HTTPBearer(auto_error=False)


def verify_jwt(credentials: HTTPAuthorizationCredentials = Security(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="No authorization token provided")
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_role(allowed_roles: List[str]):
    """Dependency factory — call as Depends(require_role(['admin']))."""
    def role_checker(payload: dict = Security(verify_jwt)):
        user_role = payload.get("role")
        if not user_role or user_role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role(s): {allowed_roles}. Your role: {user_role}"
            )
        return payload
    return role_checker


def generate_demo_token(role: str, name: str) -> str:
    """Generate a signed JWT for demo purposes."""
    now = datetime.datetime.utcnow()
    payload = {
        "sub": name.lower().replace(" ", "_"),
        "name": name,
        "role": role,
        "iat": now,
        "exp": now + datetime.timedelta(hours=settings.JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
