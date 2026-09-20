from fastapi import APIRouter, HTTPException, Depends
from app.services.workspace_service import get_workspace
from app.core.security import require_role

router = APIRouter()

@router.get("/{mine_id}/cause-analysis", dependencies=[Depends(require_role(["admin"]))])
def get_cause_analysis(mine_id: str):
    """Feature 4: SHAP Cause Analysis. Admin only — reveals internal operational vulnerabilities."""
    try:
        data = get_workspace(mine_id)
        return {"causeAnalysis": [rc.model_dump() for rc in data.riskContributors]}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
