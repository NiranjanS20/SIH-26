from fastapi import APIRouter, HTTPException, Depends
from app.services.workspace_service import get_workspace
from app.core.security import require_role

router = APIRouter()

@router.get("/{mine_id}/corrective-action", dependencies=[Depends(require_role(["admin", "site_manager"]))])
def get_corrective_action(mine_id: str):
    """Feature 5: Recommended Corrective Actions. Pure memory read."""
    try:
        data = get_workspace(mine_id)
        return {"correctiveActions": data.recommendation.model_dump()}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
