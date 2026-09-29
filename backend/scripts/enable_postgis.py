import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()

async def main():
    db_url = os.environ.get('DATABASE_URL')
    engine = create_async_engine(db_url, echo=True)
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;"))
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
    print("Enabled PostGIS")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
