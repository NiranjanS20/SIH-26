from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.security import generate_demo_token

router = APIRouter()

# ---------------------------------------------------------------------------
# Demo user store (hardcoded for hackathon prototype)
# Production: replace with DB lookup + Argon2id password verification
# ---------------------------------------------------------------------------
DEMO_USERS = {
    "admin": {
        "password": "admin123",
        "role": "admin",
        "name": "Rajesh Kumar (Admin)",
        "display_name": "Rajesh Kumar",
    },
    "sitemanager": {
        "password": "site123",
        "role": "site_manager",
        "name": "Priya Sharma (Site Manager)",
        "display_name": "Priya Sharma",
    },
    "industry": {
        "password": "industry123",
        "role": "industry_viewer",
        "name": "Tata Steel (Industry Partner)",
        "display_name": "Tata Steel",
    },
}


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    role: str
    name: str
    display_name: str


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    """
    Authenticate a user and return a signed JWT.
    Role is determined server-side — no client-provided role claim accepted.
    """
    user = DEMO_USERS.get(req.username.strip().lower())
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = generate_demo_token(role=user["role"], name=user["name"])
    return LoginResponse(
        token=token,
        role=user["role"],
        name=user["name"],
        display_name=user["display_name"],
    )


@router.get("/me")
def get_current_user_info():
    """
    Placeholder — in production, verify JWT and return user profile.
    Frontend decodes JWT client-side for display only; backend re-validates on every request.
    """
    return {"message": "Decode your JWT client-side for display. Backend enforces on each request."}
