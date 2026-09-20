from fastapi import APIRouter, HTTPException, Depends
from app.services.workspace_service import get_workspace
from app.core.security import require_role

router = APIRouter()

@router.get("/{mine_id}/shortfall", dependencies=[Depends(require_role(["admin", "site_manager"]))])
def get_shortfall(mine_id: str):
    """Feature 3: Shortfall Early Warning. Pure memory read."""
    try:
        data = get_workspace(mine_id)
        return {"shortfall": data.shortfallRisk.model_dump(), "alerts": [a.model_dump() for a in data.alerts]}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
