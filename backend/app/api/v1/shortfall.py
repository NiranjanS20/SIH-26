from fastapi import APIRouter, HTTPException
from app.services.workspace_service import get_workspace

router = APIRouter()

@router.get("/{mine_id}/shortfall")
def get_shortfall(mine_id: str):
    """Feature 3: Shortfall Early Warning. Pure memory read."""
    try:
        data = get_workspace(mine_id)
        return {"shortfall": data.shortfallRisk.model_dump(), "alerts": [a.model_dump() for a in data.alerts]}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
