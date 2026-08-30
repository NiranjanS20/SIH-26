from fastapi import APIRouter, HTTPException, Depends
import datetime
from app.schemas.responses import Envelope, MineWorkspaceData, ResponseMeta
from app.services.workspace_service import get_workspace
from app.core.security import require_role

router = APIRouter()

@router.get("/{mine_id}/workspace", response_model=Envelope[MineWorkspaceData])
def get_mine_workspace(
    mine_id: str,
    # Example RBAC: Anyone with one of these roles can view the workspace
    user=Depends(require_role(["Mine Officer", "HQ Oversight", "Industry Viewer"]))
):
    try:
        data = get_workspace(mine_id)
        
        # Populate meta block with versioning
        meta = ResponseMeta(
            model_version="v2.1.0-xgb",
            computed_at=datetime.datetime.utcnow().isoformat() + "Z"
        )
        
        return Envelope(
            success=True,
            data=data,
            meta=meta
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
