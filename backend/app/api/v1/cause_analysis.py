from fastapi import APIRouter, HTTPException
from app.services.workspace_service import get_workspace

router = APIRouter()

@router.get("/{mine_id}/cause-analysis")
def get_cause_analysis(mine_id: str):
    """Feature 4: SHAP Cause Analysis. Pure memory read from pre-computed data."""
    try:
        data = get_workspace(mine_id)
        return {"causeAnalysis": [rc.model_dump() for rc in data.riskContributors]}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
