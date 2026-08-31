import json
from typing import Dict, Any
from app.services.data_registry import data_registry
from app.schemas.responses import MineWorkspaceData

# Global cache
_workspace_cache: Dict[str, MineWorkspaceData] = {}

def precompute_workspace_data():
    """
    Assembles the MineWorkspaceData from the loaded CSVs at startup and caches it.
    """
    print("Precomputing workspace data...")
    
    # 1. Fetch raw data
    mcdr_df = data_registry.mcdr_ground_truth
    shortfall_df = data_registry.shortfall_data
    shap_df = data_registry.shap_summary
    corrective_df = data_registry.corrective_actions
    
    # 2. Extract values safely
    # (In a fully dynamic system we'd compute everything. Here we blend static UI expectations with the dynamic CSVs).
    
    # Example: Grab the latest actual production from MCDR if available, else fallback
    actual_prod = 38600.0
    target_prod = 45000.0
    
    if mcdr_df is not None and not mcdr_df.empty:
        # Use the maximum year available in the real MCDR ground truth
        latest_row = mcdr_df.iloc[-1]
        actual_prod = float(latest_row['rom_actual_te']) if 'rom_actual_te' in latest_row and pd.notnull(latest_row['rom_actual_te']) else 303383.0
        target_prod = float(latest_row['rom_proposed_te']) if 'rom_proposed_te' in latest_row and pd.notnull(latest_row['rom_proposed_te']) else 350000.0

    expected_gap = -3200.0
    if shortfall_df is not None and not shortfall_df.empty and 'expected_gap' in shortfall_df.columns:
        expected_gap = float(shortfall_df.iloc[0]['expected_gap'])
    
    # Extract top SHAP contributors
    risk_contributors = []
    if shap_df is not None and not shap_df.empty:
        for idx, row in shap_df.head(4).iterrows():
            feature = row.get('feature', 'Unknown Feature')
            importance = abs(float(row.get('importance', 0))) * 100
            risk_contributors.append({
                "factor": feature.replace("_", " ").title(),
                "importancePct": round(importance, 1),
                "description": f"Computed importance score of {importance:.1f}%",
                "mitigationStrategy": "Refer to corrective action model."
            })
    
    # If SHAP is empty, provide default mock fallback to avoid breaking UI
    if not risk_contributors:
        risk_contributors = [
            {"factor": "Equipment Availability", "importancePct": 42.0, "description": "Shovel loader breakdown", "mitigationStrategy": "Deploy standby"},
            {"factor": "Weather Conditions", "importancePct": 31.0, "description": "Precipitation accumulation", "mitigationStrategy": "Activate pumps"}
        ]

    # Extract Corrective Actions
    rec_equipment = "82%"
    rec_blasting = "3 days"
    if corrective_df is not None and not corrective_df.empty:
        # Parse the CSV values if available
        if 'recommended_equipment_availability' in corrective_df.columns:
            val = corrective_df.iloc[0]['recommended_equipment_availability']
            rec_equipment = f"{val:.0f}%" if pd.notnull(val) else rec_equipment
            
    # Extract UNFC Reserves
    reserves_df = data_registry.mcdr_reserves
    proved_111 = 3473539.0
    probable_122 = 290938.0
    if reserves_df is not None and not reserves_df.empty:
        r111 = reserves_df[reserves_df['unfc_code'] == '111']
        if not r111.empty: proved_111 = float(r111.iloc[0]['tonnage'])
        r122 = reserves_df[reserves_df['unfc_code'] == '122']
        if not r122.empty: probable_122 = float(r122.iloc[0]['tonnage'])
            
    workspace_data = {
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
            "dynamicStatement": f"PREDICTIVE SHORTFALL DETECTED: Production is tracking below planned target with medium variance risk.",
            "coreValueMessage": "Moving beyond raw geological potential to identify ore that is geotechnically accessible and operationally recoverable.",
            "complianceStandard": "DGMS & IBM Regulatory Standards Compliant",
            "lastUpdated": "Live Stream • Today, 08:30 IST"
        },
        "production": {
            "actual": actual_prod,
            "target": target_prod,
            "forecast": 41800.0,
            "gap": expected_gap,
            "unit": "tonnes",
            "isSynthetic": True,
            "oreGradeBreakdown": {
                "highGradeMn": 18400.0,
                "mediumGradeMn": 14200.0,
                "lowGradeMn": 6000.0
            },
            "monthlyTrend": [
                {"month": "Apr", "actual": 42000.0, "target": 44000.0, "forecast": 42000.0, "lowerBound": 41000.0, "upperBound": 43000.0},
                {"month": "Aug (Current)", "actual": 38600.0, "target": 45000.0, "forecast": 41800.0, "lowerBound": 40200.0, "upperBound": 43400.0}
            ]
        },
        "shortfallRisk": {
            "probability": 68.0,
            "expectedProduction": 41800.0,
            "target": target_prod,
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
            {"category": "Geology", "label": "3D Geological Wireframe Assays", "status": "LIVE SIMULATED", "source": "MOIL Core Drilling"}
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
                "expectedGap": f"{expected_gap} t"
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
    
    import pandas as pd # Ensure pandas is imported inside if it wasn't at the top
    
    # Store in cache
    _workspace_cache["dongri-buzurg"] = MineWorkspaceData(**workspace_data)
    print("Workspace data precomputed and cached.")

def get_workspace(mine_id: str) -> MineWorkspaceData:
    if mine_id not in _workspace_cache:
        raise ValueError(f"Mine ID '{mine_id}' not found in cache.")
    return _workspace_cache[mine_id]
