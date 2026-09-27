import asyncio
import os
import pandas as pd
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import insert

from app.models import (
    Mine, User, GeochemSample, GradePolygon, ProspectivityZone, RasterLayer,
    ProductionRecord, ShortfallEvent, CauseAnalysis, CorrectiveAction,
    ValueForecast, PriceTier, DelayReasonLookup, Equipment, ProductionEntry,
    BlastingEvent, ModelRegistry, AuditLog, GeneratedReport, ComplianceStandard,
    SdgMapping, MineComplianceStatus
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/moil_db")
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession)

async def load_delay_reasons(session):
    print("Loading delay reasons...")
    reasons = [
        {"reason_code": "equipment_unavailable", "description": "Equipment Breakdown or Unavailable"},
        {"reason_code": "weather", "description": "Weather-related Delays (e.g. Heavy Rain)"},
        {"reason_code": "clearance_delay", "description": "Blasting Clearance Delay"},
        {"reason_code": "other", "description": "Other Delay"}
    ]
    stmt = insert(DelayReasonLookup).values(reasons)
    stmt = stmt.on_conflict_do_nothing(index_elements=["reason_code"])
    await session.execute(stmt)

async def load_mines(session):
    print("Loading mines...")
    mines_data = [
        {"mine_id": "dongri_buzurg", "name": "Dongri Buzurg", "district": "Bhandara", "state": "Maharashtra", "mine_type": "opencast"},
        {"mine_id": "tirodi", "name": "Tirodi", "district": "Balaghat", "state": "Madhya Pradesh", "mine_type": "opencast"},
        {"mine_id": "sitapatore", "name": "Sitapatore", "district": "Balaghat", "state": "Madhya Pradesh", "mine_type": "opencast"},
        {"mine_id": "balaghat", "name": "Balaghat", "district": "Balaghat", "state": "Madhya Pradesh", "mine_type": "underground"},
        {"mine_id": "beldongri", "name": "Beldongri", "district": "Nagpur", "state": "Maharashtra", "mine_type": "opencast"},
        {"mine_id": "chikla", "name": "Chikla", "district": "Bhandara", "state": "Maharashtra", "mine_type": "underground"},
        {"mine_id": "gumgaon", "name": "Gumgaon", "district": "Nagpur", "state": "Maharashtra", "mine_type": "underground"},
        {"mine_id": "kandri", "name": "Kandri", "district": "Nagpur", "state": "Maharashtra", "mine_type": "underground"},
        {"mine_id": "mansar", "name": "Mansar", "district": "Nagpur", "state": "Maharashtra", "mine_type": "opencast"},
        {"mine_id": "munsar", "name": "Munsar", "district": "Nagpur", "state": "Maharashtra", "mine_type": "opencast"},
        {"mine_id": "ukwa", "name": "Ukwa", "district": "Balaghat", "state": "Madhya Pradesh", "mine_type": "underground"},
        {"mine_id": "dongri", "name": "Dongri", "district": "Bhandara", "state": "Maharashtra", "mine_type": "opencast"},
    ]
    stmt = insert(Mine).values(mines_data)
    stmt = stmt.on_conflict_do_nothing(index_elements=["mine_id"])
    await session.execute(stmt)

async def load_synthetic_production(session):
    print("Loading synthetic production data...")
    csv_path = "../data/satellite data and more/synthetic_operational_data_all_mines.csv"
    if not os.path.exists(csv_path):
        print(f"Skipping {csv_path}: not found.")
        return

    df = pd.read_csv(csv_path)
    # Generate unique IDs and format for DB
    records = []
    
    for idx, row in df.iterrows():
        # Clean mine name to ID
        mine_id = row['mine'].lower().replace(" ", "_")
        
        record_id = f"prod_{mine_id}_{row['date']}"
        records.append({
            "record_id": record_id,
            "mine_id": mine_id,
            "period": pd.to_datetime(row['date']).date(),
            "actual_tonnage": row['actual_production_tons'],
            "target_tonnage": row['planned_target_tons_per_day'],
            "forecast_tonnage": row['actual_production_tons'], # approx
            "source": "model_forecast",
            "is_synthetic": True
        })

    # Bulk upsert in chunks
    chunk_size = 100
    for i in range(0, len(records), chunk_size):
        chunk = records[i:i + chunk_size]
        stmt = insert(ProductionRecord).values(chunk)
        stmt = stmt.on_conflict_do_nothing(index_elements=["record_id"])
        await session.execute(stmt)

async def main():
    async with AsyncSessionLocal() as session:
        # Load independent tables first
        await load_delay_reasons(session)
        await load_mines(session)
        
        # Then dependent tables
        await load_synthetic_production(session)
        
        await session.commit()
    
    print("Database seeding completed.")

if __name__ == "__main__":
    asyncio.run(main())
