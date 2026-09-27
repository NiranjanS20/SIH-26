import asyncio, os
import asyncpg

async def main():
    db_url = os.environ.get('DATABASE_URL', "postgresql://postgres:Jaya98765!@localhost:5432/mine_db")
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    
    conn = await asyncpg.connect(db_url)
    sql = open('scripts/setup_rls.sql').read()
    
    try:
        await conn.execute(sql)
        print('RLS setup complete.')
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
