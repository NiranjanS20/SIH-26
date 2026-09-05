import asyncio
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.services.model_registry import model_registry
from app.services.data_registry import data_registry
from app.services.weather_service import fetch_current_weather
from app.api.v1.router import api_router


# --- Weather background loop (only runs if WEATHER_ENABLED=True) ---
async def weather_background_loop():
    """
    Periodically fetches weather data in the background.
    Uses httpx.AsyncClient — no OS threads spawned, no zombie-thread risk.
    Runs entirely within the event loop.
    """
    while True:
        try:
            data = await fetch_current_weather()
            if data:
                # Store latest weather on app state for endpoints to read
                weather_background_loop._latest = data
        except asyncio.CancelledError:
            raise  # propagate cancellation cleanly
        except Exception as e:
            print(f"[WEATHER] Background loop error: {e}")
        await asyncio.sleep(300)  # refresh every 5 minutes

weather_background_loop._latest = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP: Local disk reads only (fast, deterministic) ---
    print("=" * 60)
    print("Initializing Dongri Buzurg AI Backend...")
    print("=" * 60)
    
    # 1. Verify artifacts exist on disk
    model_registry.verify_artifacts()
    data_registry.verify_artifacts()
    
    # 2. Load models and data into memory (local disk, no network I/O)
    model_registry.load_models()
    data_registry.load_data()
    
    # 3. Precompute workspace data from in-memory registries
    from app.services.workspace_service import precompute_workspace_data
    precompute_workspace_data()
    
    # 4. Weather background task — scheduled but NOT awaited before yield.
    #    asyncio.create_task() just schedules it on the event loop; the actual
    #    network call happens after yield, when the server is already accepting
    #    requests. This means server startup is NEVER gated on weather API.
    if settings.WEATHER_ENABLED:
        app.state.weather_task = asyncio.create_task(weather_background_loop())
        print("[WEATHER] Background fetch task scheduled (WEATHER_ENABLED=True).")
    else:
        print("[WEATHER] Disabled (WEATHER_ENABLED=False). Server starts without network dependency.")
    
    print("=" * 60)
    print("Backend ready. Accepting requests.")
    print("=" * 60)
    
    yield
    
    # --- SHUTDOWN ---
    # Guard against AttributeError if WEATHER_ENABLED=False and the task was never created.
    if hasattr(app.state, "weather_task"):
        app.state.weather_task.cancel()
        try:
            await app.state.weather_task
        except asyncio.CancelledError:
            pass
    print("Backend shutdown complete.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Dongri Buzurg Prospectivity & Forecasting API",
    version="2.0.0",
    lifespan=lifespan
)

# --- Middleware ---

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip compression for large payloads (geojson, time-series arrays)
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Request timing middleware — logs {method} {path} {duration_ms} per request
@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    print(f"[TIMING] {request.method} {request.url.path} -> {duration_ms:.1f}ms")
    response.headers["X-Response-Time-Ms"] = f"{duration_ms:.1f}"
    return response


# Static files for heatmap images etc.
import os
if os.path.isdir(settings.DATA_DIR):
    app.mount("/static", StaticFiles(directory=settings.DATA_DIR), name="static")


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[ERROR] {request.method} {request.url.path}: {exc}")
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
