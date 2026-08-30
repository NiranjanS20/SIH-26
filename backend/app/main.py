from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.audit import HashChainAuditMiddleware
from app.core.rate_limit import setup_rate_limiting

from app.services.model_registry import model_registry
from app.services.data_registry import data_registry
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load models, CSVs, and precompute workspace cache
    print("Initializing backend lifespan...")
    
    # 1. Verify artifacts
    model_registry.verify_artifacts()
    data_registry.verify_artifacts()
    
    # 2. Load into memory
    model_registry.load_models()
    data_registry.load_data()
    
    # 3. Precompute workspace data (we will define workspace_service later)
    try:
        from app.services.workspace_service import precompute_workspace_data
        precompute_workspace_data()
    except ImportError:
        print("workspace_service not implemented yet, skipping precomputation.")
        
    yield
    # Shutdown
    print("Shutting down backend lifespan...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Dongri Buzurg Prospectivity & Forecasting API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit Logging
app.add_middleware(HashChainAuditMiddleware)

# GZip
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Setup SlowAPI Rate Limiting
setup_rate_limiting(app)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global exception caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc)
            }
        }
    )

# Include routers
app.include_router(api_router, prefix="/api/v1")
