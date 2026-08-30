from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.schemas.responses import Envelope, ResponseMeta
from app.services.whatif_service import simulate_whatif
from app.core.security import require_role
import datetime

router = APIRouter()

class WhatIfRequest(BaseModel):
    equipment_availability_pct: float
    blasting_delay_days: float
    precipitation_mm: float

@router.post("/simulate", response_model=Envelope[dict])
def run_simulation(
    req: WhatIfRequest,
    user=Depends(require_role(["Mine Officer", "HQ Oversight"]))
):
    try:
        result = simulate_whatif(
            req.equipment_availability_pct,
            req.blasting_delay_days,
            req.precipitation_mm
        )
        
        return Envelope(
            success=True,
            data=result,
            meta=ResponseMeta(model_version="v2.1.0-xgb", computed_at=datetime.datetime.utcnow().isoformat() + "Z")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
