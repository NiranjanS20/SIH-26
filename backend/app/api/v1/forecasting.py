from fastapi import APIRouter, HTTPException, Depends
from app.services.workspace_service import get_workspace
from app.core.security import require_role

router = APIRouter()

@router.get("/{mine_id}/forecasting", dependencies=[Depends(require_role(["admin", "site_manager"]))])
def get_forecasting(mine_id: str):
    """Feature 2: ML Production Forecasting. Pure memory read."""
    try:
        data = get_workspace(mine_id)
        return {"forecasting": data.production.model_dump()}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
