import psutil, os, time, asyncio
from app.services.weather_service import fetch_current_weather

async def main():
    print('Initial threads:', psutil.Process(os.getpid()).num_threads())
    for _ in range(10):
        try:
            await fetch_current_weather()
        except:
            pass
    print('Final threads:', psutil.Process(os.getpid()).num_threads())

asyncio.run(main())
