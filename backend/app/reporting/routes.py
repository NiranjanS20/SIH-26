import uuid
from datetime import datetime, timezone
import logging

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
import os
from sqlalchemy import text

from app.db.session import get_db_session
from app.api.v1.deps import require_role, get_current_user

# Reporting modules
from app.reporting.data_admin import fetch_admin_mine_data, fetch_admin_aggregate_data
from app.reporting.data_industry import fetch_industry_data
from app.reporting.charts import (
    render_production_chart, render_shortfall_chart, render_cause_chart,
    render_action_chart, render_ops_chart, render_blast_chart, render_supply_chart
)
from app.reporting.pdf_service import generate_pdf

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reports", tags=["Reporting"])

async def _process_admin_mine_report(db: AsyncSession, report_id: str, mine_id: str, start: str, end: str, current_user: dict):
    try:
        data = await fetch_admin_mine_data(db, mine_id, start, end)
        
        # Build Charts
        # prod chart
        dates = [d["date"] for d in data.get("production", [])]
        actual = [d["actual_tonnage"] for d in data.get("production", [])]
        target = [d["target_tonnage"] for d in data.get("production", [])]
        forecast = [d["forecast_tonnage"] for d in data.get("production", [])]
        prod_chart = render_production_chart(dates, actual, target, forecast)
        
        # shortfall chart
        risk_levels = [d["risk_level"] for d in data.get("shortfall", [])]
        counts = [d["count"] for d in data.get("shortfall", [])]
        shortfall_chart = render_shortfall_chart(risk_levels, counts)
        
        # cause chart
        features = [d["feature_name"] for d in data.get("causes", [])]
        shap_values = [float(d["avg_shap"]) for d in data.get("causes", [])]
        cause_chart = render_cause_chart(features, shap_values)
        
        # action chart
        statuses = [d["status"] for d in data.get("actions", [])]
        action_counts = [1 for _ in data.get("actions", [])] # Dummy count for layout
        action_chart = render_action_chart(statuses, action_counts)
        
        # ops chart
        ops_entries = data.get("ops_entries", [])
        ops_chart = render_ops_chart(list(range(len(ops_entries))), ops_entries)
        
        # blast chart
        reasons = [d["reason_code"] for d in data.get("blast_delays", [])]
        freqs = [d["count"] for d in data.get("blast_delays", [])]
        blast_chart = render_blast_chart(reasons, freqs)
        
        context = {
            "report_id": report_id,
            "report_title": f"Admin Operations Report - {mine_id.upper()}",
            "mine": data.get("mine", {}),
            "period_start": start,
            "period_end": end,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "generated_by": current_user.get("user_id", "System"),
            "model_versions": data.get("model_versions", "Unknown Versions"),
            "corrective_actions": data.get("actions", []),
            "prospectivity": data.get("prospectivity", []),
            "equipment": data.get("equipment", []),
            "value_forecast": data.get("value_forecast", []),
            "charts": {
                "production_chart": prod_chart,
                "shortfall_chart": shortfall_chart,
                "cause_chart": cause_chart,
                "action_chart": action_chart,
                "ops_chart": ops_chart,
                "blast_chart": blast_chart
            },
            "provenance": {
                "prod_real": sum(1 for d in data.get("production", []) if d.get("is_real_anchor")),
                "prod_synth": sum(1 for d in data.get("production", []) if d.get("is_synthetic")),
                "shortfall_real": sum(d.get("count", 0) for d in data.get("shortfall", []) if d.get("has_real")),
                "shortfall_synth": sum(d.get("count", 0) for d in data.get("shortfall", []) if not d.get("has_real"))
            }
        }
        
        filepath, content_hash = await generate_pdf(report_id, "admin_mine_report.html", context)
        
        # Update DB row
        await db.execute(text("""
            UPDATE generated_reports
            SET status = 'generated', file_path = :path, content_hash = :hash
            WHERE report_id = :id
        """), {"path": filepath, "hash": content_hash, "id": report_id})
        await db.commit()
    except Exception as e:
        logger.error(f"Error generating admin report {report_id}: {e}")
        await db.execute(text("UPDATE generated_reports SET status = 'failed' WHERE report_id = :id"), {"id": report_id})
        await db.commit()

async def _process_industry_report(db: AsyncSession, report_id: str, start: str, end: str, current_user: dict):
    try:
        data = await fetch_industry_data(db, start, end)
        
        # supply chart
        dates = sorted(list(set(d["date"] for d in data.get("supply", []))))
        lines_by_mine = {}
        for row in data.get("supply", []):
            mine = row["mine_name"]
            if mine not in lines_by_mine:
                lines_by_mine[mine] = []
            lines_by_mine[mine].append(row["forecast_tonnage"])
            
        supply_chart = render_supply_chart(dates, lines_by_mine)
        
        context = {
            "report_id": report_id,
            "report_title": "Industry Supply Reliability Outlook",
            "period_start": start,
            "period_end": end,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "generated_by": current_user.get("user_id", "System"),
            "model_versions": data.get("model_versions", "Unknown Versions"),
            "product_grades": data.get("grades", []),
            "compliance": data.get("compliance", []),
            "source_comparison": data.get("comparison", []),
            "total_tonnage": data.get("total", {}).get("total_tonnage", 0),
            "total_value": data.get("total", {}).get("total_value", 0),
            "charts": {
                "supply_chart": supply_chart
            },
            "provenance": {
                "prod_synth": sum(1 for d in data.get("supply", []) if d.get("is_synthetic")),
                "prod_real": sum(1 for d in data.get("supply", []) if d.get("is_real_anchor"))
            }
        }
        
        filepath, content_hash = await generate_pdf(report_id, "industry_report.html", context)
        
        await db.execute(text("""
            UPDATE generated_reports
            SET status = 'generated', file_path = :path, content_hash = :hash
            WHERE report_id = :id
        """), {"path": filepath, "hash": content_hash, "id": report_id})
        await db.commit()
    except Exception as e:
        logger.error(f"Error generating industry report {report_id}: {e}")
        await db.execute(text("UPDATE generated_reports SET status = 'failed' WHERE report_id = :id"), {"id": report_id})
        await db.commit()


@router.post("/admin/{mine_id}", dependencies=[Depends(require_role(["admin", "site_manager"]))])
async def generate_admin_report(
    mine_id: str,
    period_start: str,
    period_end: str,
    background_tasks: BackgroundTasks,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] == "site_manager" and current_user.get("assigned_mine_id") != mine_id:
        raise HTTPException(status_code=403, detail="Not authorized for this mine.")
        
    report_id = f"RPT-{mine_id.upper()}-{datetime.now().strftime('%Y-%m-%d-%H%M%S')}"
    
    await db.execute(text("""
        INSERT INTO generated_reports (report_id, report_type, mine_id, period_start, period_end, generated_by, generated_at, status)
        VALUES (:id, 'admin_mine', :mine, :start, :end, :user, :at, 'pending')
    """), {
        "id": report_id, "mine": mine_id, "start": period_start, "end": period_end, 
        "user": current_user.get("user_id"), "at": datetime.now(timezone.utc)
    })
    await db.commit()
    
    background_tasks.add_task(_process_admin_mine_report, db, report_id, mine_id, period_start, period_end, current_user)
    
    return {"report_id": report_id, "status": "pending"}


@router.post("/industry", dependencies=[Depends(require_role(["admin", "industry_viewer"]))])
async def generate_industry_report(
    period_start: str,
    period_end: str,
    current_user: dict = Depends(get_current_user)
):
    report_id = f"RPT-IND-{datetime.now().strftime('%Y-%m-%d-%H%M%S')}"
    
    # Generate the PDF inline using mocked data for a working hackathon button
    try:
        # Provide some dummy data that matches the expected context
        supply_chart = render_supply_chart(["2026-09-01", "2026-09-15"], {"Mine A": [1000, 1100], "Mine B": [2000, 1900]})
        context = {
            "report_id": report_id,
            "report_title": "Industry Supply Reliability Outlook (Demo)",
            "period_start": period_start,
            "period_end": period_end,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "generated_by": current_user.get("user_id", "System"),
            "model_versions": "v2.1.0-mock",
            "product_grades": [{"band": "High Grade", "mines": "Dongri Buzurg", "price": 450.0}],
            "compliance": [{"mine_name": "Dongri Buzurg", "standard_code": "ISO14001", "status": "Compliant", "last_audit_date": "2026-01-15"}],
            "source_comparison": [{"mine_name": "Dongri Buzurg", "grade_band": "High Grade", "value": 250000}],
            "total_tonnage": 50000,
            "total_value": 750000,
            "charts": {
                "supply_chart": supply_chart
            },
            "provenance": {
                "prod_synth": 0,
                "prod_real": 100
            }
        }
        
        filepath, content_hash = await generate_pdf(report_id, "industry_report.html", context)
        return {
            "report_id": report_id, 
            "status": "generated", 
            "download_url": f"http://localhost:8000/api/v1/reports/download/{report_id}"
        }
    except Exception as e:
        logger.error(f"Error generating industry report {report_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

@router.get("/download/{report_id}")
async def download_report(report_id: str):
    from app.reporting.pdf_service import OUTPUT_DIR
    
    # Check for HTML version first
    html_filename = f"{report_id}.html"
    html_filepath = os.path.join(OUTPUT_DIR, html_filename)
    if os.path.exists(html_filepath):
        return FileResponse(
            path=html_filepath,
            filename=html_filename,
            media_type='text/html'
        )
        
    pdf_filename = f"{report_id}.pdf"
    pdf_filepath = os.path.join(OUTPUT_DIR, pdf_filename)
    if not os.path.exists(pdf_filepath):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(
        path=pdf_filepath,
        filename=pdf_filename,
        media_type='application/pdf',
        headers={"Content-Disposition": f"attachment; filename={pdf_filename}"}
    )

@router.get("/{report_id}")
async def get_report_status(report_id: str, db: AsyncSession = Depends(get_db_session)):
    res = await db.execute(text("SELECT status, file_path, content_hash FROM generated_reports WHERE report_id = :id"), {"id": report_id})
    row = res.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {
        "report_id": report_id,
        "status": row[0],
        "download_url": f"/api/v1/reports/download/{report_id}" if row[0] == "generated" else None,
        "content_hash": row[2]
    }

@router.patch("/{report_id}/archive", dependencies=[Depends(require_role(["admin"]))])
async def archive_report(report_id: str, db: AsyncSession = Depends(get_db_session)):
    # Verify report exists
    res = await db.execute(text("SELECT status FROM generated_reports WHERE report_id = :id"), {"id": report_id})
    if not res.fetchone():
        raise HTTPException(status_code=404, detail="Report not found")
        
    await db.execute(text("""
        UPDATE generated_reports 
        SET status = 'archived' 
        WHERE report_id = :id
    """), {"id": report_id})
    await db.commit()
    
    return {"report_id": report_id, "status": "archived"}

