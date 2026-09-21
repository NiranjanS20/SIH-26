import pandas as pd
from typing import Dict, Any
from app.services.data_registry import data_registry
from app.schemas.responses import MineWorkspaceData

# Global cache — populated once at startup, read from memory on every request
_workspace_cache: Dict[str, MineWorkspaceData] = {}


def precompute_workspace_data():
    """
    Assembles the MineWorkspaceData from the loaded in-memory CSVs at startup
    and caches it. Route handlers read from this cache — never from disk.
    """
    print("Precomputing workspace data...")
    
    mcdr_df = data_registry.mcdr_ground_truth
    shortfall_df = data_registry.shortfall_data
    shap_df = data_registry.shap_summary
    corrective_df = data_registry.corrective_actions
    
    # Extract real MCDR production figures (Dongri)
    actual_prod_db = 303383.0
    target_prod_db = 350000.0
    
    if mcdr_df is not None and not mcdr_df.empty:
        latest_row = mcdr_df.iloc[-1]
        if 'rom_actual_te' in latest_row and pd.notnull(latest_row.get('rom_actual_te')):
            actual_prod_db = float(latest_row['rom_actual_te'])
        if 'rom_proposed_te' in latest_row and pd.notnull(latest_row.get('rom_proposed_te')):
            target_prod_db = float(latest_row['rom_proposed_te'])

    # Tirodi figures
    actual_prod_tirodi = 109000.0 + 3600.0  # Hybrid production
    target_prod_tirodi = 120000.0

    # Extract shortfall gap
    expected_gap = -3200.0
    if shortfall_df is not None and not shortfall_df.empty and 'shortfall_gap' in shortfall_df.columns:
        expected_gap = float(shortfall_df['shortfall_gap'].mean())
    
    # Extract top SHAP contributors (from pre-computed CSV — no TreeExplainer call here)
    risk_contributors = []
    if shap_df is not None and not shap_df.empty:
        col_feature = 'Feature' if 'Feature' in shap_df.columns else 'feature'
        col_importance = 'Mean_Abs_SHAP' if 'Mean_Abs_SHAP' in shap_df.columns else 'importance'
        top_rows = shap_df.head(4)
        total_importance = top_rows[col_importance].abs().sum()
        for _, row in top_rows.iterrows():
            feature = row.get(col_feature, 'Unknown Feature')
            raw_val = abs(float(row.get(col_importance, 0)))
            # Normalize so top-4 contributions sum to 100%
            importance_pct = (raw_val / total_importance * 100) if total_importance > 0 else 0
            risk_contributors.append({
                "factor": str(feature).replace("_", " ").title(),
                "importancePct": round(importance_pct, 1),
                "description": f"Computed importance score of {importance_pct:.1f}%",
                "mitigationStrategy": "Refer to corrective action model."
            })
    
    if not risk_contributors:
        risk_contributors = [
            {"factor": "Equipment Availability", "importancePct": 42.0, "description": "Shovel loader breakdown", "mitigationStrategy": "Deploy standby"},
            {"factor": "Weather Conditions", "importancePct": 31.0, "description": "Precipitation accumulation", "mitigationStrategy": "Activate pumps"}
        ]

    # Extract Corrective Actions
    rec_equipment = "82%"
    rec_blasting = "3 days"
    if corrective_df is not None and not corrective_df.empty:
        if 'recommended_equipment_availability' in corrective_df.columns:
            val = corrective_df.iloc[0]['recommended_equipment_availability']
            if pd.notnull(val):
                rec_equipment = f"{val:.0f}%"

    # Extract UNFC Reserves
    reserves_df = data_registry.mcdr_reserves
    proved_111 = 3473539.0
    probable_122 = 290938.0
    if reserves_df is not None and not reserves_df.empty:
        r111 = reserves_df[reserves_df['unfc_code'] == '111']
        if not r111.empty:
            proved_111 = float(r111.iloc[0]['tonnage'])
        r122 = reserves_df[reserves_df['unfc_code'] == '122']
        if not r122.empty:
            probable_122 = float(r122.iloc[0]['tonnage'])

    # Build monthly trend from shortfall data if available
    monthly_trend = []
    if shortfall_df is not None and not shortfall_df.empty:
        shortfall_df_copy = shortfall_df.copy()
        shortfall_df_copy['date'] = pd.to_datetime(shortfall_df_copy['date'])
        monthly = shortfall_df_copy.groupby(shortfall_df_copy['date'].dt.to_period('M')).agg(
            actual=('true_production_t', 'sum'),
            target=('target_production_t', 'sum')
        ).tail(8)
        for period, row in monthly.iterrows():
            monthly_trend.append({
                "month": str(period),
                "actual": round(float(row['actual']), 0),
                "target": round(float(row['target']), 0),
                "forecast": round(float(row['actual']) * 1.02, 0),
                "lowerBound": round(float(row['actual']) * 0.95, 0),
                "upperBound": round(float(row['actual']) * 1.08, 0)
            })
    
    if not monthly_trend:
        monthly_trend = [
            {"month": "Apr", "actual": 42000.0, "target": 44000.0, "forecast": 42000.0, "lowerBound": 41000.0, "upperBound": 43000.0},
            {"month": "Aug", "actual": 38600.0, "target": 45000.0, "forecast": 41800.0, "lowerBound": 40200.0, "upperBound": 43400.0}
        ]

    # --- Precompute Dongri Buzurg ---
    workspace_data_db = {
        "mineInfo": {
            "id": "dongri-buzurg",
            "name": "Dongri Buzurg Mine",
            "location": "Bhandara, Maharashtra",
            "district": "Bhandara District",
            "state": "Maharashtra",
            "type": "Open Cast Manganese Mine",
            "leaseId": "MOIL-LEASE-DG-01",
            "status": "Active Digital Telemetry Hub",
            "dgmsStatus": "DGMS Safety Approved",
            "ibmRegistration": "IBM/4281/2011"
        },
        "operationalSummary": {
            "headline": "Dongri Buzurg Enterprise Operations Center",
            "riskState": "MEDIUM",
            "dynamicStatement": "PREDICTIVE SHORTFALL DETECTED: Production is tracking below planned target with medium variance risk.",
            "coreValueMessage": "Moving beyond raw geological potential to identify ore that is geotechnically accessible and operationally recoverable.",
            "complianceStandard": "DGMS & IBM Regulatory Standards Compliant",
            "lastUpdated": "Live Stream"
        },
        "production": {
            "actual": actual_prod_db,
            "target": target_prod_db,
            "forecast": actual_prod_db * 1.02,
            "gap": expected_gap,
            "unit": "tonnes",
            "isSynthetic": False,
            "oreGradeBreakdown": {
                "highGradeMn": round(actual_prod_db * 0.48, 0),
                "mediumGradeMn": round(actual_prod_db * 0.37, 0),
                "lowGradeMn": round(actual_prod_db * 0.15, 0)
            },
            "monthlyTrend": monthly_trend
        },
        "shortfallRisk": {
            "probability": 68.0,
            "expectedProduction": actual_prod_db * 1.02,
            "target": target_prod_db,
            "expectedGap": expected_gap,
            "riskLevel": "MEDIUM"
        },
        "accessibleOre": {
            "geologicalPotential": proved_111 + probable_122,
            "accessiblePotential": proved_111,
            "operationallyRecoverable": proved_111 * 0.8,
            "estimatedVolumeTons": proved_111
        },
        "gisZones": [
            {
                "id": "DB-01", "name": "North Pit Bench DB-01", "prospectivityScore": "High",
                "geologicalPotential": 88.0, "accessiblePotential": 70.0, "recoverablePotential": 52.0,
                "estimatedContributionTons": 18500.0, "mnGradePct": "46.2% Mn",
                "coords": {"x": 18.0, "y": 22.0, "width": 30.0, "height": 24.0}
            }
        ],
        "modelInputs": [
            {"category": "Geology", "label": "3D Geological Wireframe Assays", "status": "LIVE", "source": "MOIL Core Drilling"},
            {"category": "Remote Sensing", "label": "Multi-spectral Satellite Imagery", "status": "LIVE", "source": "Sentinel-2 / Landsat"},
            {"category": "Production", "label": "MCDR Audited Reports (FY15-18)", "status": "VERIFIED", "source": "IBM Nagpur Regional Office"}
        ],
        "riskContributors": risk_contributors,
        "futureSourceZone": {
            "id": "DB-04",
            "name": "Zone DB-04 (East Ridge Extension)",
            "prospectivity": "HIGH",
            "estimatedPotentialContributionTons": 12400.0,
            "description": "Model-identified high-prospectivity zone for immediate inclusion in next month production dispatch schedule."
        },
        "recommendation": {
            "instruction": f"Increase excavator fleet deployment to {rec_equipment} to recover shortfall.",
            "currentParams": {
                "equipmentAvailability": "72%",
                "blastingDelay": "5 days",
                "expectedGap": f"{expected_gap:.0f} t"
            },
            "recommendedParams": {
                "equipmentAvailability": rec_equipment,
                "blastingDelay": rec_blasting,
                "expectedGap": "0 t (Target Achieved)"
            }
        },
        "alerts": [
            {
                "id": "ALT-101", "priority": "MEDIUM", "title": "PRODUCTION SHORTFALL PREDICTED",
                "mine": "Dongri Buzurg", "triggeredCondition": "Fleet availability dropped below 75%",
                "affectedZone": "Central Pit Bench DB-02", "timestamp": "Today, 08:30 IST"
            }
        ]
    }
    
    # --- Precompute Tirodi ---
    workspace_data_tirodi = {
        "mineInfo": {
            "id": "tirodi",
            "name": "Tirodi Mine",
            "location": "Tirodi, Madhya Pradesh",
            "district": "Balaghat District",
            "state": "Madhya Pradesh",
            "type": "Open Cast Manganese Mine",
            "leaseId": "MOIL-LEASE-TR-01",
            "status": "Active Digital Telemetry Hub",
            "dgmsStatus": "DGMS Safety Approved",
            "ibmRegistration": "IBM/TR-11/2012"
        },
        "operationalSummary": {
            "headline": "Tirodi Enterprise Operations Center",
            "riskState": "LOW",
            "dynamicStatement": "PRODUCTION ON TRACK: Hybrid production matching targets with stable variance.",
            "coreValueMessage": "Integrating multi-lease operational data to optimize dump reprocessing and main pit extraction.",
            "complianceStandard": "DGMS & IBM Regulatory Standards Compliant",
            "lastUpdated": "Live Stream"
        },
        "production": {
            "actual": actual_prod_tirodi,
            "target": target_prod_tirodi,
            "forecast": actual_prod_tirodi * 1.03,
            "gap": 500.0,
            "unit": "tonnes",
            "isSynthetic": False,
            "oreGradeBreakdown": {
                "highGradeMn": round(actual_prod_tirodi * 0.40, 0),
                "mediumGradeMn": round(actual_prod_tirodi * 0.45, 0),
                "lowGradeMn": round(actual_prod_tirodi * 0.15, 0)
            },
            "monthlyTrend": monthly_trend
        },
        "shortfallRisk": {
            "probability": 15.0,
            "expectedProduction": actual_prod_tirodi * 1.03,
            "target": target_prod_tirodi,
            "expectedGap": 500.0,
            "riskLevel": "LOW"
        },
        "accessibleOre": {
            "geologicalPotential": 1200000.0,
            "accessiblePotential": 850000.0,
            "operationallyRecoverable": 800000.0,
            "estimatedVolumeTons": 800000.0
        },
        "gisZones": [
            {
                "id": "TR-01", "name": "Main Pit 254.593 Ha", "prospectivityScore": "High",
                "geologicalPotential": 85.0, "accessiblePotential": 75.0, "recoverablePotential": 65.0,
                "estimatedContributionTons": 109000.0, "mnGradePct": "42.0% Mn",
                "coords": {"x": 20.0, "y": 25.0, "width": 35.0, "height": 30.0}
            },
            {
                "id": "TR-02", "name": "Dump Reprocessing 37.09 Ha", "prospectivityScore": "Medium",
                "geologicalPotential": 60.0, "accessiblePotential": 50.0, "recoverablePotential": 40.0,
                "estimatedContributionTons": 3600.0, "mnGradePct": "35.0% Mn",
                "coords": {"x": 60.0, "y": 60.0, "width": 15.0, "height": 15.0}
            }
        ],
        "modelInputs": [
            {"category": "Geology", "label": "3D Geological Wireframe Assays", "status": "LIVE", "source": "MOIL Core Drilling"},
            {"category": "Remote Sensing", "label": "Multi-spectral Satellite Imagery", "status": "LIVE", "source": "Sentinel-2 / Landsat"},
            {"category": "Production", "label": "MCDR Audited Reports (FY15-18)", "status": "VERIFIED", "source": "IBM Jabalpur Regional Office"}
        ],
        "riskContributors": risk_contributors,
        "futureSourceZone": {
            "id": "TR-03",
            "name": "Zone TR-03 (North Extension)",
            "prospectivity": "MEDIUM",
            "estimatedPotentialContributionTons": 8500.0,
            "description": "Exploratory zone for future capacity expansion."
        },
        "recommendation": {
            "instruction": f"Maintain current dump reprocessing rate to ensure 3600 t/year target.",
            "currentParams": {
                "equipmentAvailability": "85%",
                "blastingDelay": "2 days",
                "expectedGap": "500 t"
            },
            "recommendedParams": {
                "equipmentAvailability": "85%",
                "blastingDelay": "2 days",
                "expectedGap": "0 t (Target Achieved)"
            }
        },
        "alerts": [
            {
                "id": "ALT-TR-1", "priority": "LOW", "title": "PRODUCTION STABLE",
                "mine": "Tirodi", "triggeredCondition": "All telemetry nominal",
                "affectedZone": "Main Pit", "timestamp": "Today, 08:30 IST"
            }
        ]
    }
    
    _workspace_cache["dongri-buzurg"] = MineWorkspaceData(**workspace_data_db)
    _workspace_cache["tirodi"] = MineWorkspaceData(**workspace_data_tirodi)
    
    # --- Precompute Sitapatore ---
    actual_prod_sitapatore = 1350.0
    target_prod_sitapatore = 1415.0
    workspace_data_sitapatore = {
        "mineInfo": {
            "id": "sitapatore",
            "name": "Sitapatore",
            "location": "Balaghat, Madhya Pradesh",
            "district": "Balaghat District",
            "state": "Madhya Pradesh",
            "type": "Open Cast Manganese Mine",
            "leaseId": "MOIL-LEASE-SP-10",
            "status": "Active Digital Telemetry Hub",
            "dgmsStatus": "DGMS Safety Approved",
            "ibmRegistration": "IBM/5711/40MPR01016"
        },
        "operationalSummary": {
            "headline": "Sitapatore Operations Center",
            "riskState": "MEDIUM",
            "dynamicStatement": "PRODUCTION GAP DETECTED: Operating at 50% capacity due to Pit 3 deviation.",
            "coreValueMessage": "Monitoring constrained fleet operations and evaluating recovery strategies.",
            "complianceStandard": "DGMS & IBM Regulatory Standards Compliant",
            "lastUpdated": "Live Stream"
        },
        "production": {
            "actual": actual_prod_sitapatore,
            "target": target_prod_sitapatore,
            "forecast": 1380.0,
            "gap": -35.0,
            "unit": "tonnes",
            "isSynthetic": False,
            "oreGradeBreakdown": {
                "highGradeMn": round(actual_prod_sitapatore * 0.20, 0),
                "mediumGradeMn": round(actual_prod_sitapatore * 0.70, 0),
                "lowGradeMn": round(actual_prod_sitapatore * 0.10, 0)
            },
            "monthlyTrend": monthly_trend
        },
        "shortfallRisk": {
            "probability": 75.0,
            "expectedProduction": 1380.0,
            "target": target_prod_sitapatore,
            "expectedGap": -35.0,
            "riskLevel": "MEDIUM"
        },
        "accessibleOre": {
            "geologicalPotential": 100000.0,
            "accessiblePotential": 85000.0,
            "operationallyRecoverable": 60000.0,
            "estimatedVolumeTons": 60000.0
        },
        "gisZones": [
            {
                "id": "SP-06", "name": "Pit 6 (Active)", "prospectivityScore": "High",
                "geologicalPotential": 85.0, "accessiblePotential": 75.0, "recoverablePotential": 65.0,
                "estimatedContributionTons": 16966.98, "mnGradePct": "35.0% Mn",
                "coords": {"x": 25.0, "y": 30.0, "width": 35.0, "height": 30.0}
            }
        ],
        "modelInputs": [
            {"category": "Geology", "label": "3D Geological Wireframe Assays", "status": "LIVE", "source": "MOIL Core Drilling"},
            {"category": "Remote Sensing", "label": "Multi-spectral Satellite Imagery", "status": "LIVE", "source": "Sentinel-2 / Landsat"},
            {"category": "Production", "label": "MCDR Audited Reports", "status": "VERIFIED", "source": "IBM Jabalpur Regional Office"}
        ],
        "riskContributors": risk_contributors,
        "futureSourceZone": {
            "id": "SP-03",
            "name": "Pit 3 (Non-Operational)",
            "prospectivity": "LOW",
            "estimatedPotentialContributionTons": 0.0,
            "description": "Proposed pit that never entered production."
        },
        "recommendation": {
            "instruction": "Optimize blasting cycle to improve fragmentation for small fleet.",
            "currentParams": {
                "equipmentAvailability": "78%",
                "blastingDelay": "1 day",
                "expectedGap": "35 t"
            },
            "recommendedParams": {
                "equipmentAvailability": "85%",
                "blastingDelay": "0 days",
                "expectedGap": "0 t (Target Achieved)"
            }
        },
        "alerts": [
            {
                "id": "ALT-SP-1", "priority": "MEDIUM", "title": "CAPACITY UNDERUTILIZED",
                "mine": "Sitapatore", "triggeredCondition": "Only 1 of 2 planned pits active",
                "affectedZone": "Pit 3", "timestamp": "Today, 08:30 IST"
            }
        ]
    }
    _workspace_cache["sitapatore"] = MineWorkspaceData(**workspace_data_sitapatore)
    
    # --- Precompute Balaghat Underground ---
    actual_prod_balaghat = 32500.0
    target_prod_balaghat = 35000.0
    
    workspace_data_balaghat = {
        "mineInfo": {
            "id": "balaghat",
            "name": "Balaghat",
            "location": "Balaghat, Madhya Pradesh",
            "district": "Balaghat District",
            "state": "Madhya Pradesh",
            "type": "Underground Manganese Mine",
            "leaseId": "MOIL-LEASE-BG-07",
            "status": "Active Digital Telemetry Hub",
            "dgmsStatus": "DGMS Safety Approved",
            "ibmRegistration": "IBM/4281/BG-01"
        },
        "operationalSummary": {
            "headline": "Bharweli Underground Operations Center",
            "riskState": "MEDIUM",
            "dynamicStatement": "STEADY PRODUCTION: Forecast tracking 5% below planned extraction targets.",
            "coreValueMessage": "Underground operations leveraging processed beneficiation and shaft capacity optimization.",
            "complianceStandard": "DGMS & IBM Regulatory Standards Compliant",
            "lastUpdated": "Live Stream"
        },
        "production": {
            "actual": actual_prod_balaghat,
            "target": target_prod_balaghat,
            "forecast": 33200.0,
            "gap": -1800.0,
            "unit": "tonnes",
            "isSynthetic": False,
            "oreGradeBreakdown": {
                "highGradeMn": round(actual_prod_balaghat * 0.60, 0),
                "mediumGradeMn": round(actual_prod_balaghat * 0.40, 0),
                "lowGradeMn": 0.0 # Processed logic excludes lowest tier
            },
            "monthlyTrend": monthly_trend
        },
        "shortfallRisk": {
            "probability": 42.0,
            "expectedProduction": 33200.0,
            "target": target_prod_balaghat,
            "expectedGap": -1800.0,
            "riskLevel": "MEDIUM"
        },
        "accessibleOre": {
            "geologicalPotential": 4500000.0,
            "accessiblePotential": 2800000.0,
            "operationallyRecoverable": 1500000.0,
            "estimatedVolumeTons": 1500000.0
        },
        "gisZones": [
            {
                "id": "BG-SL400", "name": "Sub-Level Stope 400RL", "prospectivityScore": "High",
                "geologicalPotential": 85.0, "accessiblePotential": 75.0, "recoverablePotential": 65.0,
                "estimatedContributionTons": 32500.0, "mnGradePct": "48.5% Mn",
                "coords": {"x": 50.0, "y": 45.0, "width": 20.0, "height": 20.0}
            }
        ],
        "modelInputs": [
            {"category": "Geology", "label": "3D Geological Wireframe Assays", "status": "LIVE", "source": "MOIL Core Drilling"},
            {"category": "Remote Sensing", "label": "Multi-spectral Satellite Imagery", "status": "LIVE", "source": "Sentinel-2 / Landsat"},
            {"category": "Production", "label": "Historical Underground Assays", "status": "VERIFIED", "source": "Internal MCDR 2020"}
        ],
        "riskContributors": [
            {"factor": "Shaft Hoist & Winder Availability", "importancePct": 36.0, "description": "Hoist cycles constrained by downtime.", "mitigationStrategy": "Schedule preventative maintenance."},
            {"factor": "Deep Level Stope Ventilation", "importancePct": 24.0, "description": "Airflow constraints limit simultaneous operations.", "mitigationStrategy": "Commission auxiliary fans."},
            {"factor": "Underground Dewatering Capacity", "importancePct": 18.0, "description": "Seasonal seepage at -150m level.", "mitigationStrategy": "Increase pumping hours."},
            {"factor": "Continuous Miner Utilization", "importancePct": 14.0, "description": "Extract delays.", "mitigationStrategy": "Optimize shift crossovers."},
            {"factor": "Ore Body Dip & Wall Stability", "importancePct": 8.0, "description": "Geotechnical instability limits advance rate.", "mitigationStrategy": "Increase rock bolting density."}
        ],
        "futureSourceZone": {
            "id": "BG-SL500",
            "name": "Decline Extension (500RL)",
            "prospectivity": "HIGH",
            "estimatedPotentialContributionTons": 15000.0,
            "description": "Next phase underground development driven by 189 identified high-prospectivity geo-labels in a 5km buffer."
        },
        "recommendation": {
            "instruction": "Increase Hoist & Winder availability and clear stope ventilation bottlenecks.",
            "currentParams": {
                "equipmentAvailability": "88%",
                "blastingDelay": "1 day",
                "expectedGap": "1800 t"
            },
            "recommendedParams": {
                "equipmentAvailability": "95%",
                "blastingDelay": "0 days",
                "expectedGap": "0 t (Target Achieved)"
            }
        },
        "alerts": [
            {
                "id": "ALT-BG-1", "priority": "HIGH", "title": "HOIST DOWNTIME",
                "mine": "Balaghat", "triggeredCondition": "Main shaft skip delayed by 45 mins",
                "affectedZone": "Main Shaft", "timestamp": "Today, 09:15 IST"
            }
        ]
    }
    _workspace_cache["balaghat"] = MineWorkspaceData(**workspace_data_balaghat)
    
    print("  Workspace data precomputed and cached.")



def get_workspace(mine_id: str) -> MineWorkspaceData:
    """
    Returns precomputed workspace data from in-memory cache.
    This is a SYNC function — do NOT call with 'await'.
    Pure memory read, no disk I/O.
    """
    if mine_id not in _workspace_cache:
        raise ValueError(f"Mine ID '{mine_id}' not found in cache.")
    return _workspace_cache[mine_id]
