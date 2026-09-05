from fastapi import APIRouter, HTTPException
from app.services.workspace_service import get_workspace

router = APIRouter()

@router.get("/{mine_id}/prospectivity")
def get_prospectivity(mine_id: str):
    """Feature 1: AI/GIS Prospectivity. Pure memory read."""
    try:
        data = get_workspace(mine_id)
        return {
            "prospectivity": data.accessibleOre.model_dump(),
            "gisZones": [zone.model_dump() for zone in data.gisZones]
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
