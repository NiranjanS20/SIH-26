from fastapi import APIRouter
from app.services.workspace_service import get_workspace_data

router = APIRouter()

@router.get("/{mine_id}/corrective-action")
async def get_corrective_action(mine_id: str):
    """
    Feature 5: Recommended Corrective Actions
    Returns actionable remediation tasks to close the shortfall.
    # TODO: auth
    """
    data = await get_workspace_data(mine_id)
    return {"correctiveActions": data["recommendedActions"]}
