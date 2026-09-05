import subprocess
import time
import requests
import sys

print("Starting uvicorn...")
p = subprocess.Popen([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8002"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

# Wait enough time for SHAP to load (~30-40s)
print("Waiting 45 seconds for server to start and load SHAP...")
time.sleep(45)

endpoints = [
    "/api/v1/health",
    "/api/v1/mines/dongri-buzurg/workspace",
    "/api/v1/mines/dongri-buzurg/prospectivity",
    "/api/v1/mines/dongri-buzurg/forecasting",
    "/api/v1/mines/dongri-buzurg/shortfall",
    "/api/v1/mines/dongri-buzurg/cause-analysis",
    "/api/v1/mines/dongri-buzurg/corrective-action"
]

print("\n--- Endpoint Timing Test ---")
for ep in endpoints:
    try:
        r = requests.get(f"http://127.0.0.1:8002{ep}")
        print(f"{ep} -> Status: {r.status_code}, X-Response-Time-Ms: {r.headers.get('X-Response-Time-Ms')}")
    except Exception as e:
        print(f"Failed {ep}: {e}")

print("\n--- Testing Shutdown Guard (WEATHER_ENABLED=False) ---")
p.terminate()
try:
    stdout, _ = p.communicate(timeout=15)
    print("Server output during run and shutdown:")
    for line in stdout.split('\n'):
        # Filter out noisy sklearn warnings for clean output reading
        if "InconsistentVersionWarning" not in line and "warnings.warn(" not in line and "model_persistence.html" not in line:
            print(line)
except subprocess.TimeoutExpired:
    p.kill()
    print("Force killed due to timeout")
