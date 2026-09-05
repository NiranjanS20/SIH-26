from fastapi import APIRouter, HTTPException
import datetime
from app.schemas.responses import Envelope, MineWorkspaceData, ResponseMeta
from app.services.workspace_service import get_workspace

router = APIRouter()

@router.get("/{mine_id}/workspace", response_model=Envelope[MineWorkspaceData])
def get_mine_workspace(mine_id: str):
    """Returns precomputed workspace data. Pure memory read — no disk I/O."""
    try:
        data = get_workspace(mine_id)  # sync call, no await
        meta = ResponseMeta(
            model_version="v2.1.0-xgb",
            computed_at=datetime.datetime.utcnow().isoformat() + "Z"
        )
        return Envelope(success=True, data=data, meta=meta)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
