from fastapi import APIRouter
from app.services.workspace_service import get_workspace_data

router = APIRouter()

@router.get("/{mine_id}/shortfall")
async def get_shortfall(mine_id: str):
    """
    Feature 3: Shortfall Early Warning
    Returns projected gap deficits and alerts.
    # TODO: auth
    """
    data = await get_workspace_data(mine_id)
    return {"shortfall": data["alerts"]}
