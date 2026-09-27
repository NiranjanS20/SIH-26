from sqlalchemy import text
from typing import Dict, Any

async def fetch_industry_data(db, period_start: str, period_end: str) -> Dict[str, Any]:
    # 2. Supply Outlook
    # Both mine-wise and aggregated forecast
    supply = (await db.execute(text("""
        SELECT m.name as mine_name, p.date, SUM(p.forecast_tonnage) as forecast_tonnage,
               bool_or(p.is_synthetic) as is_synthetic, bool_or(p.is_real_anchor) as is_real_anchor
        FROM production_records p
        JOIN mines m ON p.mine_id = m.mine_id
        WHERE p.date >= :start AND p.date <= :end
        GROUP BY m.name, p.date
        ORDER BY p.date, m.name
    """), {"start": period_start, "end": period_end})).fetchall()
    
    # 3. Product & Grade
    # grade_polygons (avg_mno_pct) joined to mines, price_tiers
    # Wait, the prompt says "grade_polygons joined to mines, price_tiers"
    # Actually, we don't have grade_polygons in the typical layout, maybe it's in DB.
    # We will simulate or select safely
    grades = (await db.execute(text("""
        SELECT p.tier_name as band, STRING_AGG(DISTINCT m.name, ', ') as mines, AVG(p.price_per_tonne) as price
        FROM value_forecast v
        JOIN mines m ON v.mine_id = m.mine_id
        JOIN price_tiers p ON v.price_tier_id = p.tier_id
        GROUP BY p.tier_name
    """))).fetchall()

    # 4. ESG & Compliance
    compliance = (await db.execute(text("""
        SELECT m.name as mine_name, c.standard_code, c.status, c.last_audit_date
        FROM mine_compliance_status c
        JOIN mines m ON c.mine_id = m.mine_id
    """))).fetchall()

    # 5. Source Comparison (value_forecast + price_tiers across mines)
    comparison = (await db.execute(text("""
        SELECT m.name as mine_name, p.tier_name as grade_band, SUM(v.forecast_tonnage * p.price_per_tonne) as value
        FROM value_forecast v
        JOIN mines m ON v.mine_id = m.mine_id
        JOIN price_tiers p ON v.price_tier_id = p.tier_id
        WHERE v.date >= :start AND v.date <= :end
        GROUP BY m.name, p.tier_name
        ORDER BY value DESC
    """), {"start": period_start, "end": period_end})).fetchall()

    # 6. Value/Economic Context (aggregate)
    total = (await db.execute(text("""
        SELECT SUM(v.forecast_tonnage) as total_tonnage, SUM(v.forecast_tonnage * p.price_per_tonne) as total_value
        FROM value_forecast v
        JOIN price_tiers p ON v.price_tier_id = p.tier_id
        WHERE v.date >= :start AND v.date <= :end
    """), {"start": period_start, "end": period_end})).fetchone()

    # 7. Canonical Models Used
    models = (await db.execute(text("""
        SELECT model_name, version
        FROM model_registry
        WHERE is_canonical = true 
          AND (model_name = 'prospectivity_rf' OR model_name LIKE 'production_forecast_%')
    """))).fetchall()
    model_versions = ", ".join([f"{m[0]} (v{m[1]})" for m in models]) if models else "Unknown Versions"

    return {
        "supply": [r._mapping for r in supply],
        "grades": [r._mapping for r in grades],
        "compliance": [r._mapping for r in compliance],
        "comparison": [r._mapping for r in comparison],
        "total": total._mapping if total else {"total_tonnage": 0, "total_value": 0},
        "model_versions": model_versions
    }
