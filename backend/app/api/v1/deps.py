from fastapi import Depends, HTTPException, status, Request
from app.core.security import verify_jwt as get_current_user

def require_role(allowed_roles: list[str]):
    """
    FastAPI Dependency to strictly enforce RBAC at the application layer.
    """
    async def role_checker(request: Request, current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        
        # 1. Check basic role permission
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action."
            )
            
        # 2. For Site Managers, verify they are only accessing their assigned mine
        if user_role == "site_manager":
            assigned_mine = current_user.get("assigned_mine_id")
            # If the route has a {mine_id} path parameter, we must check it
            path_mine_id = request.path_params.get("mine_id")
            
            if path_mine_id and assigned_mine != path_mine_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Site Manager restriction: Cannot access data for mine '{path_mine_id}'."
                )
                
        # 3. For Industry Viewer, prevent access to operational routes
        # This is handled mostly by the allowed_roles passed in, but we can 
        # add a hardcoded fallback just in case.
        if user_role == "industry_viewer" and "site_manager" in allowed_roles:
            # Operational endpoints typically allow admin & site_manager, NOT industry_viewer.
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Industry Viewers cannot access internal operational endpoints."
            )
            
        return current_user
        
    return role_checker

async def set_rls_context(request: Request, db_session):
    """
    Sets the current_user's assigned_mine_id into the Postgres session 
    to trigger Row-Level Security (RLS) enforcement at the DB layer.
    """
    current_user = getattr(request.state, "user", None)
    if current_user and current_user.get("role") == "site_manager":
        assigned_mine = current_user.get("assigned_mine_id")
        if assigned_mine:
            # Set the local variable for this Postgres transaction
            await db_session.execute(
                f"SET LOCAL app.current_mine_id = '{assigned_mine}';"
            )
