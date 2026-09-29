import os
import re

files_to_fix = [
    r'd:\Personal_Projects\SIH_26009\backend\app\api\v1\admin.py',
    r'd:\Personal_Projects\SIH_26009\backend\app\api\v1\auth.py',
    r'd:\Personal_Projects\SIH_26009\backend\app\api\v1\cause_analysis.py',
    r'd:\Personal_Projects\SIH_26009\backend\app\api\v1\corrective_action.py',
    r'd:\Personal_Projects\SIH_26009\backend\app\api\v1\forecasting.py',
    r'd:\Personal_Projects\SIH_26009\backend\app\api\v1\health.py',
    r'd:\Personal_Projects\SIH_26009\backend\app\api\v1\prospectivity.py',
    r'd:\Personal_Projects\SIH_26009\backend\app\api\v1\shortfall.py',
]

def fix_admin(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'from app.schemas.responses import Envelope' not in content:
        content = 'from app.schemas.responses import Envelope\n' + content
    
    # Overview
    content = content.replace('@router.get("/overview", dependencies=[Depends(require_role(["admin"]))])', '@router.get("/overview", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin"]))])')
    content = re.sub(r'return \{\s*"success": True,\s*"data": (\{.*?"systemStatus".*?\})[^\}]*?\}\s*\}', r'return Envelope(success=True, data=\1)', content, flags=re.DOTALL)
    
    # Governance
    content = content.replace('@router.get("/model-governance", dependencies=[Depends(require_role(["admin"]))])', '@router.get("/model-governance", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin"]))])')
    content = re.sub(r'return \{\s*"success": True,\s*"models": models_info,\s*"trainingHistory": (history\[-10:\] if history else \[\]),\s*"governanceNotes": (\[.*?\])\s*\}', r'return Envelope(success=True, data={"models": models_info, "trainingHistory": \1, "governanceNotes": \2})', content, flags=re.DOTALL)
    
    # System Health
    content = content.replace('@router.get("/system-health", dependencies=[Depends(require_role(["admin"]))])', '@router.get("/system-health", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin"]))])')
    content = re.sub(r'return \{\s*"success": True,\s*"models": model_checks,\s*"datasets": csv_checks,\s*"environment": (\{.*?\})\s*\}', r'return Envelope(success=True, data={"models": model_checks, "datasets": csv_checks, "environment": \1})', content, flags=re.DOTALL)
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_auth(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'from app.schemas.responses import Envelope' not in content:
        content = 'from app.schemas.responses import Envelope\n' + content
    content = content.replace('@router.post("/login", response_model=LoginResponse)', '@router.post("/login", response_model=Envelope[LoginResponse])')
    content = re.sub(r'return LoginResponse\(token=token, role=user\["role"\]\)', r'return Envelope(success=True, data=LoginResponse(token=token, role=user["role"]))', content)
    
    content = content.replace('@router.get("/me")', '@router.get("/me", response_model=Envelope[dict])')
    content = re.sub(r'return \{"username": current_user\["username"\], "role": current_user\["role"\]\}', r'return Envelope(success=True, data={"username": current_user["username"], "role": current_user["role"]})', content)
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_cause(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'from app.schemas.responses import Envelope' not in content:
        content = 'from app.schemas.responses import Envelope\n' + content
    content = content.replace('@router.get("/{mine_id}/cause-analysis", dependencies=[Depends(require_role(["admin"]))])', '@router.get("/{mine_id}/cause-analysis", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin"]))])')
    content = re.sub(r'return \{"causeAnalysis": \[rc\.model_dump\(\) for rc in data\.riskContributors\]\}', r'return Envelope(success=True, data={"causeAnalysis": [rc.model_dump() for rc in data.riskContributors]})', content)
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_corrective(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'from app.schemas.responses import Envelope' not in content:
        content = 'from app.schemas.responses import Envelope\n' + content
    content = content.replace('@router.get("/{mine_id}/corrective-action", dependencies=[Depends(require_role(["admin", "site_manager"]))])', '@router.get("/{mine_id}/corrective-action", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin", "site_manager"]))])')
    content = re.sub(r'return \{"correctiveAction": \[a\.model_dump\(\) for a in data\.actions\]\}', r'return Envelope(success=True, data={"correctiveAction": [a.model_dump() for a in data.actions]})', content)
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_forecasting(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'from app.schemas.responses import Envelope' not in content:
        content = 'from app.schemas.responses import Envelope\n' + content
    content = content.replace('@router.get("/{mine_id}/forecasting", dependencies=[Depends(require_role(["admin", "site_manager"]))])', '@router.get("/{mine_id}/forecasting", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin", "site_manager"]))])')
    content = re.sub(r'return \{"forecasting": \{"production": \[d\.model_dump\(\) for d in data\.productionTrend\]\}\}', r'return Envelope(success=True, data={"forecasting": {"production": [d.model_dump() for d in data.productionTrend]}})', content)
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_health(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'from app.schemas.responses import Envelope' not in content:
        content = 'from app.schemas.responses import Envelope\n' + content
    content = content.replace('@router.get("/health")', '@router.get("/health", response_model=Envelope[dict])')
    content = re.sub(r'return \{"status": "ok", "message": "API is running"\}', r'return Envelope(success=True, data={"status": "ok", "message": "API is running"})', content)
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_prospectivity(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'from app.schemas.responses import Envelope' not in content:
        content = 'from app.schemas.responses import Envelope\n' + content
    content = content.replace('@router.get("/{mine_id}/prospectivity", dependencies=[Depends(require_role(["admin", "site_manager"]))])', '@router.get("/{mine_id}/prospectivity", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin", "site_manager"]))])')
    content = re.sub(r'return \{\n\s*"prospectivity": (.*?),?\n\s*"geospatial": (.*?)\n\s*\}', r'return Envelope(success=True, data={"prospectivity": \1, "geospatial": \2})', content, flags=re.DOTALL)
    
    content = content.replace('@router.post("/gemini-interpret", dependencies=[Depends(require_role(["admin", "site_manager"]))])', '@router.post("/gemini-interpret", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin", "site_manager"]))])')
    content = re.sub(r'return \{"analysis": response\.text\}', r'return Envelope(success=True, data={"analysis": response.text})', content)
    
    content = content.replace('@router.post("/model-predict", dependencies=[Depends(require_role(["admin", "site_manager"]))])', '@router.post("/model-predict", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin", "site_manager"]))])')
    content = re.sub(r'return \{\s*"prospectivity_score": round\(prob, 2\),\s*"risk_level": risk,\s*"estimated_reserves_mt": round\(reserves, 2\)\s*\}', r'return Envelope(success=True, data={"prospectivity_score": round(prob, 2), "risk_level": risk, "estimated_reserves_mt": round(reserves, 2)})', content)
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_shortfall(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'from app.schemas.responses import Envelope' not in content:
        content = 'from app.schemas.responses import Envelope\n' + content
    content = content.replace('@router.get("/{mine_id}/shortfall", dependencies=[Depends(require_role(["admin", "site_manager"]))])', '@router.get("/{mine_id}/shortfall", response_model=Envelope[dict], dependencies=[Depends(require_role(["admin", "site_manager"]))])')
    content = re.sub(r'return \{"shortfall": \{"alerts": \[a\.model_dump\(\) for a in data\.shortfallAlerts\]\}\}', r'return Envelope(success=True, data={"shortfall": {"alerts": [a.model_dump() for a in data.shortfallAlerts]}})', content)
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

for p in files_to_fix:
    print(f"Fixing {os.path.basename(p)}")
    if 'admin.py' in p: fix_admin(p)
    elif 'auth.py' in p: fix_auth(p)
    elif 'cause_analysis.py' in p: fix_cause(p)
    elif 'corrective_action.py' in p: fix_corrective(p)
    elif 'forecasting.py' in p: fix_forecasting(p)
    elif 'health.py' in p: fix_health(p)
    elif 'prospectivity.py' in p: fix_prospectivity(p)
    elif 'shortfall.py' in p: fix_shortfall(p)
print('Done!')
