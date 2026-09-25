import os
import json
import urllib.request
import subprocess
import time

def get_auth_token():
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/auth/login',
        data=json.dumps({'username': 'sitemanager', 'password': 'site123'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        return data['token']

def capture_mine_filter(token, mine_id, filter_mode, out_path):
    url = f"http://localhost:5173/?token={token}&route=workspace/{mine_id}&tab=prospectivity&filter={filter_mode}"
    cmd = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--virtual-time-budget=6000",
        "--window-size=1600,2200",
        f"--screenshot={out_path}",
        url
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Captured: {mine_id} [{filter_mode}] -> {out_path}")

def main():
    token = get_auth_token()
    os.makedirs(r"c:\PROJECTS\SIH-26\screenshots", exist_ok=True)

    targets = [
        # 1. Dongri Buzurg
        ("dongri-buzurg", "prospectivity"),
        ("dongri-buzurg", "elevation"),
        ("dongri-buzurg", "lst"),
        
        # 2. Tirodi
        ("tirodi", "prospectivity"),
        ("tirodi", "ndvi"),
        ("tirodi", "soil_moisture"),
        
        # 3. Sitapatore
        ("sitapatore", "prospectivity"),
        ("sitapatore", "ndvi"),
        
        # 4. Balaghat
        ("balaghat", "prospectivity"),
        ("balaghat", "elevation"),
        
        # 5. Chikla
        ("chikla", "prospectivity"),
        ("chikla", "lst"),
        
        # 6. Gumgaon
        ("gumgaon", "prospectivity"),
        ("gumgaon", "elevation"),
        
        # 7. Ukwa
        ("ukwa", "prospectivity"),
        ("ukwa", "soil_moisture"),
        
        # 8. Kandri
        ("kandri", "prospectivity"),
        
        # 9. Beldongri
        ("beldongri", "prospectivity"),
        
        # 10. Munsar
        ("munsar", "prospectivity"),
    ]

    for mine_id, filter_mode in targets:
        filename = f"{mine_id}_{filter_mode}.png"
        out_path = os.path.join(r"c:\PROJECTS\SIH-26\screenshots", filename)
        capture_mine_filter(token, mine_id, filter_mode, out_path)
        time.sleep(0.5)

    print("\n[COMPLETE] All target mine screenshots captured successfully.")

if __name__ == '__main__':
    main()
