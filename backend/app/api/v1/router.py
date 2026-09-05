from fastapi import APIRouter
from app.api.v1.workspace import router as workspace_router
from app.api.v1.health import router as health_router
from app.api.v1.whatif import router as whatif_router
from app.api.v1.prospectivity import router as prospectivity_router
from app.api.v1.forecasting import router as forecasting_router
from app.api.v1.shortfall import router as shortfall_router
from app.api.v1.cause_analysis import router as cause_analysis_router
from app.api.v1.corrective_action import router as corrective_action_router

api_router = APIRouter()

api_router.include_router(workspace_router, prefix="/mines", tags=["Workspace"])
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(prospectivity_router, prefix="/mines", tags=["Feature 1: Prospectivity"])
api_router.include_router(forecasting_router, prefix="/mines", tags=["Feature 2: Forecasting"])
api_router.include_router(shortfall_router, prefix="/mines", tags=["Feature 3: Shortfall"])
api_router.include_router(cause_analysis_router, prefix="/mines", tags=["Feature 4: SHAP Analysis"])
api_router.include_router(corrective_action_router, prefix="/mines", tags=["Feature 5: Corrective Actions"])
api_router.include_router(whatif_router, prefix="/whatif", tags=["Feature 6: What-If Simulation"])
