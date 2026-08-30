from fastapi import APIRouter
from app.api.v1.workspace import router as workspace_router
from app.api.v1.health import router as health_router
from app.api.v1.whatif import router as whatif_router

api_router = APIRouter()

# Note: In a real app we might prefix workspace with /mines
api_router.include_router(workspace_router, prefix="/mines", tags=["Workspace"])
api_router.include_router(health_router, tags=["Health"])

# Secondary routes (to be implemented) will be included here
# api_router.include_router(prospectivity_router, prefix="/prospectivity", tags=["Feature 1: Prospectivity"])
# api_router.include_router(forecasting_router, prefix="/forecasting", tags=["Feature 2: Forecasting"])
# api_router.include_router(shortfall_router, prefix="/shortfall", tags=["Feature 3: Shortfall"])
# api_router.include_router(cause_analysis_router, prefix="/cause-analysis", tags=["Feature 4: SHAP Analysis"])
# api_router.include_router(corrective_action_router, prefix="/corrective-action", tags=["Feature 5: Corrective Actions"])
api_router.include_router(whatif_router, prefix="/whatif", tags=["Feature 6: What-If Simulation"])
