from fastapi import APIRouter
from app.services.workspace_service import get_workspace_data

router = APIRouter()

@router.get("/{mine_id}/forecasting")
async def get_forecasting(mine_id: str):
    """
    Feature 2: Machine Learning Production Forecasting
    Returns the target vs actual vs predicted data series.
    # TODO: auth
    """
    data = await get_workspace_data(mine_id)
    return {"forecasting": data["production"]}
