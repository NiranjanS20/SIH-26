# DEFERRED — not wired into the app in this recovery pass.
# Scope: see security implementation prompt (JWT/RS256, RBAC, Argon2id,
# AES-256-GCM, SHA-256 hash-chain audit). Do not delete this file.

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI
from app.core.config import settings

# Initialize the Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"])

def setup_rate_limiting(app: FastAPI):
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
