from fastapi import APIRouter
from app.services.workspace_service import get_workspace_data

router = APIRouter()

@router.get("/{mine_id}/prospectivity")
async def get_prospectivity(mine_id: str):
    """
    Feature 1: AI/GIS Prospectivity 
    Returns the GIS/Zonal potential analysis and heatmap references.
    # TODO: auth
    """
    data = await get_workspace_data(mine_id)
    return {"prospectivity": data["accessibleOre"]}
