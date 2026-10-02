from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.schemas.responses import Envelope, ResponseMeta
from app.services.whatif_service import simulate_whatif, get_whatif_bounds
from app.api.v1.deps import require_role
from fastapi.concurrency import run_in_threadpool
from typing import Optional
import datetime
import time

router = APIRouter()

class WhatIfRequest(BaseModel):
    equipment_uptime_pct: float
    plant_availability_pct: float
    blasting_delay_days: float
    rainfall_mm: float
    target_tons_per_day_override: Optional[float] = None

@router.get("/{mine_id}/bounds", response_model=Envelope[dict])
async def get_bounds(mine_id: str):
    """Returns the cached per-mine slider configuration based on training data ranges."""
    try:
        bounds = get_whatif_bounds(mine_id)
        return Envelope(
            success=True,
            data=bounds,
            meta=ResponseMeta(model_version="v2", computed_at=datetime.datetime.utcnow().isoformat() + "Z")
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        if "No model" in str(e) or "missing" in str(e).lower() or "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{mine_id}/simulate", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin", "site_manager"]))])
async def run_simulation(mine_id: str, req: WhatIfRequest):
    """Live XGBoost inference for What-If Simulator."""
    try:
        start_time = time.perf_counter()
        bounds = get_whatif_bounds(mine_id)
        result = await run_in_threadpool(
            simulate_whatif,
            mine_id,
            req.equipment_uptime_pct,
            req.plant_availability_pct,
            req.blasting_delay_days,
            req.rainfall_mm,
            bounds,
            req.target_tons_per_day_override
        )
        result['inference_time_ms'] = int((time.perf_counter() - start_time) * 1000)
        return Envelope(
            success=True,
            data=result,
            meta=ResponseMeta(model_version=result.get("model_version", "v2"), computed_at=datetime.datetime.utcnow().isoformat() + "Z")
        )
    except Exception as e:
        if "No model" in str(e) or "missing" in str(e).lower() or "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
