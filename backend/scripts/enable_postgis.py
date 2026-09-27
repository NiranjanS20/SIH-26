import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    db_url = os.environ.get('DATABASE_URL', "postgresql+asyncpg://postgres:Jaya98765!@localhost:5432/mine_db")
    engine = create_async_engine(db_url, echo=True)
    async with engine.begin() as conn:
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
    print("Enabled PostGIS")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
