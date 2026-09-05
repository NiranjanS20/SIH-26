# Task 2 fix: Replace blocking `requests` with async-native `httpx.AsyncClient`.
#
# PRIMARY FIX: httpx.AsyncClient performs network I/O natively within the
# asyncio event loop — no OS thread is spawned to bridge a blocking call
# into async code. This structurally eliminates the zombie-thread failure
# mode (Problem B), not just time-limits it.
#
# SECONDARY DEFENSE: An explicit timeout=3.0 is still set on the httpx call
# as a second layer of defense, but understand that the primary fix is the
# async-native client, not the timeout value.

import httpx
from datetime import datetime
from typing import Optional, Dict, Any
from app.core.config import settings

LAT = 21.49
LON = 79.66

async def fetch_current_weather() -> Optional[Dict[str, Any]]:
    """
    Fetches real-time weather data for Dongri Buzurg mine from OpenWeatherMap.
    Returns a dictionary mapping to the WeatherData schema, or None on failure.
    Uses httpx.AsyncClient — no OS thread spawned, no zombie-thread risk.
    """
    api_key = settings.OPENWEATHER_API_KEY
    if not api_key:
        print("[WEATHER] No OPENWEATHER_API_KEY configured, skipping fetch.")
        return None

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={LAT}&lon={LON}&appid={api_key}&units=metric"

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(url)

            if response.status_code == 200:
                data = response.json()
                rain_data = data.get("rain", {})
                rainfall = rain_data.get("1h", 0.0)

                return {
                    "temperature": float(data.get("main", {}).get("temp", 0.0)),
                    "humidity": float(data.get("main", {}).get("humidity", 0.0)),
                    "rainfall": float(rainfall),
                    "windSpeed": float(data.get("wind", {}).get("speed", 0.0)),
                    "timestamp": datetime.now().isoformat()
                }
            else:
                print(f"[WEATHER] API returned status {response.status_code}: {response.text}")
                return None
    except httpx.TimeoutException:
        print("[WEATHER] Request timed out (3s limit). Server continues normally.")
        return None
    except Exception as e:
        print(f"[WEATHER] Failed to fetch: {e}")
        return None
