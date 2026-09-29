from fastapi import APIRouter, HTTPException, Depends
import datetime
from app.services.workspace_service import get_workspace
from app.core.security import require_role
from app.schemas.responses import Envelope, ResponseMeta

router = APIRouter()

@router.get("/{mine_id}/forecasting", dependencies=[Depends(require_role(["admin", "site_manager"]))])
def get_forecasting(mine_id: str):
    """Feature 2: ML Production Forecasting. Pure memory read."""
    try:
        data = get_workspace(mine_id)
        meta = ResponseMeta(
            model_version="v2.1.0-xgb",
            computed_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
        )
        return Envelope(
            success=True,
            data={"forecasting": data.production.model_dump()},
            meta=meta
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

