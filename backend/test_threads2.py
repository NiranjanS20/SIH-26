import psutil, os, time, asyncio
import httpx

async def fetch_weather_fail():
    async with httpx.AsyncClient() as client:
        await client.get('http://255.255.255.255', timeout=1.0)

async def main():
    print('Initial threads:', psutil.Process(os.getpid()).num_threads())
    for _ in range(10):
        try:
            await fetch_weather_fail()
        except:
            pass
    print('Final threads:', psutil.Process(os.getpid()).num_threads())

asyncio.run(main())
