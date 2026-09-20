from fastapi import APIRouter, HTTPException, Depends
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

@router.post("/{mine_id}/simulate", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin"]))])
def run_simulation(mine_id: str, req: WhatIfRequest):
    """Feature 6: What-If Simulation. Admin only — live XGBoost inference."""
    try:
        result = simulate_whatif(
            mine_id,
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
