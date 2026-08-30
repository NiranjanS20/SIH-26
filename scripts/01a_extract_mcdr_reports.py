import os
import pandas as pd

def create_mcdr_datasets():
    print("--- Phase 1a: Extract MCDR Ground Truth Data ---")
    out_dir = 'data/processed'
    os.makedirs(out_dir, exist_ok=True)
    
    # Ground Truth ROM table (exactly as verified in the prompt)
    # Using '—' as NaN for missing values
    gt_data = [
        {'year': '2010-11', 'rom_actual_te': 303383, 'rom_proposed_te': None, 'stripping_ratio_proposed': None, 'stripping_ratio_actual': None, 'ob_generated_m3': None, 'recovery_pct': None, 'source_report': 'A', 'source_table_ref': 'Report A, past production'},
        {'year': '2011-12', 'rom_actual_te': 298993, 'rom_proposed_te': None, 'stripping_ratio_proposed': None, 'stripping_ratio_actual': None, 'ob_generated_m3': None, 'recovery_pct': None, 'source_report': 'A', 'source_table_ref': 'Report A, past production'},
        {'year': '2012-13', 'rom_actual_te': 390001, 'rom_proposed_te': None, 'stripping_ratio_proposed': None, 'stripping_ratio_actual': None, 'ob_generated_m3': None, 'recovery_pct': None, 'source_report': 'A, B', 'source_table_ref': 'Report A & B, past production'},
        {'year': '2013-14', 'rom_actual_te': 364994, 'rom_proposed_te': None, 'stripping_ratio_proposed': None, 'stripping_ratio_actual': None, 'ob_generated_m3': None, 'recovery_pct': None, 'source_report': 'A, B', 'source_table_ref': 'Report A & B, past production'},
        {'year': '2014-15', 'rom_actual_te': 337197, 'rom_proposed_te': None, 'stripping_ratio_proposed': None, 'stripping_ratio_actual': None, 'ob_generated_m3': None, 'recovery_pct': None, 'source_report': 'A, B', 'source_table_ref': 'Report A & B, past production'},
        {'year': '2015-16', 'rom_actual_te': 252580, 'rom_proposed_te': 350000, 'stripping_ratio_proposed': '1:6 (Lease 46.25)', 'stripping_ratio_actual': '1:8', 'ob_generated_m3': 4134490, 'recovery_pct': '89% (bed)', 'source_report': 'A', 'source_table_ref': 'Report B 5-yr table & Report A', 'reconciliation_note': '3b_vs_5yr_table_discrepancy: 281215 vs 252580 — likely ROM-vs-dispatch definitional difference', 'rom_gross_reported_te': 281215},
        {'year': '2016-17', 'rom_actual_te': 252664, 'rom_proposed_te': None, 'stripping_ratio_proposed': None, 'stripping_ratio_actual': None, 'ob_generated_m3': None, 'recovery_pct': None, 'source_report': 'B', 'source_table_ref': 'Report B, 5-yr table'},
        {'year': '2017-18', 'rom_actual_te': 305762, 'rom_proposed_te': 384000, 'stripping_ratio_proposed': '1:11', 'stripping_ratio_actual': '1:11', 'ob_generated_m3': 3467782, 'recovery_pct': '80%', 'source_report': 'B', 'source_table_ref': 'Report B, current year actuals'}
    ]
    gt_df = pd.DataFrame(gt_data)
    
    gt_path = os.path.join(out_dir, 'mcdr_ground_truth.csv')
    gt_df.to_csv(gt_path, index=False)
    print(f"Saved Ground Truth to {gt_path}")
    
    # Reserves table
    reserves_data = [
        {'as_of_date': '01/04/2016', 'unfc_code': '(aggregate, not UNFC-split)', 'tonnage': 4022653, 'source_report': 'A', 'source_table_ref': 'Report A, Reserves'},
        {'as_of_date': '01/04/2018', 'unfc_code': '111', 'tonnage': 3473539, 'source_report': 'B', 'source_table_ref': 'Report B, UNFC table'},
        {'as_of_date': '01/04/2018', 'unfc_code': '122', 'tonnage': 290938, 'source_report': 'B', 'source_table_ref': 'Report B, UNFC table'},
        {'as_of_date': '01/04/2018', 'unfc_code': '211', 'tonnage': 519531, 'source_report': 'B', 'source_table_ref': 'Report B, UNFC table'},
        {'as_of_date': '01/04/2018', 'unfc_code': '221', 'tonnage': 1648107, 'source_report': 'B', 'source_table_ref': 'Report B, UNFC table'},
        {'as_of_date': '01/04/2018', 'unfc_code': '222', 'tonnage': 2253539, 'source_report': 'B', 'source_table_ref': 'Report B, UNFC table'},
        {'as_of_date': '01/04/2018', 'unfc_code': '332', 'tonnage': 2267133, 'source_report': 'B', 'source_table_ref': 'Report B, UNFC table'},
        {'as_of_date': '01/04/2018', 'unfc_code': '333', 'tonnage': 122063, 'source_report': 'B', 'source_table_ref': 'Report B, UNFC table'}
    ]
    reserves_df = pd.DataFrame(reserves_data)
    
    reserves_path = os.path.join(out_dir, 'mcdr_reserves.csv')
    reserves_df.to_csv(reserves_path, index=False)
    print(f"Saved Reserves to {reserves_path}")

if __name__ == '__main__':
    create_mcdr_datasets()
