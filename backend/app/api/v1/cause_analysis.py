from fastapi import APIRouter
from app.services.workspace_service import get_workspace_data

router = APIRouter()

@router.get("/{mine_id}/cause-analysis")
async def get_cause_analysis(mine_id: str):
    """
    Feature 4: SHAP Cause Analysis
    Returns the feature importance mapping for the predictions.
    # TODO: auth
    """
    data = await get_workspace_data(mine_id)
    return {"causeAnalysis": data["environmentalImpact"]}
