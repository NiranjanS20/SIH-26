# Feature 5 CatBoost Model Evaluation

## Objective
Train a CatBoost classifier to predict corrective action categories based on operational context and top SHAP causes.

## Data Limitations & Clarification
> [!WARNING]
> The synthetic dataset does not contain richer categorical fields (like `equipment_type`, `shift`, `delay_cause_category`) beyond `is_weekend` and `is_monsoon`. To remain compliant with synthetic data anchoring policies, no uncalibrated random categorical fields were artificially injected.
> 
> As a result, the categorical case for CatBoost is weaker than ideally planned. The model achieves near 1.0 accuracy because it is effectively acting as a proxy to reproduce the deterministic logic of the rule engine, rather than learning independently from a complex set of human-applied historical interventions.

## Metrics
- **Accuracy:** 1.0000
- **Precision (Macro):** 1.0000
- **Recall (Macro):** 1.0000
- **F1-Score (Macro):** 1.0000

## Confusion Matrix
Saved to `models/evaluation/feature5_confusion_matrix.csv`.

## Worked Examples
### Example 830
- **Context:** Weekend=1, Monsoon=1
- **Primary SHAP Cause:** `is_monsoon`
- **Rule Engine Expected Action:** *Increase pump capacity and adjust monthly target*
- **CatBoost Predicted Action:** *Increase pump capacity and adjust monthly target*
- **Match:** Yes

### Example 835
- **Context:** Weekend=0, Monsoon=1
- **Primary SHAP Cause:** `is_monsoon`
- **Rule Engine Expected Action:** *Increase pump capacity and adjust monthly target*
- **CatBoost Predicted Action:** *Increase pump capacity and adjust monthly target*
- **Match:** Yes

### Example 224
- **Context:** Weekend=0, Monsoon=0
- **Primary SHAP Cause:** `blasting_delay_hrs`
- **Rule Engine Expected Action:** *Review drill/blast patterns and safety clearance*
- **CatBoost Predicted Action:** *Review drill/blast patterns and safety clearance*
- **Match:** Yes

### Example 796
- **Context:** Weekend=0, Monsoon=1
- **Primary SHAP Cause:** `blasting_delay_hrs`
- **Rule Engine Expected Action:** *Review drill/blast patterns and safety clearance*
- **CatBoost Predicted Action:** *Review drill/blast patterns and safety clearance*
- **Match:** Yes

### Example 459
- **Context:** Weekend=1, Monsoon=1
- **Primary SHAP Cause:** `blasting_delay_hrs`
- **Rule Engine Expected Action:** *Review drill/blast patterns and safety clearance*
- **CatBoost Predicted Action:** *Review drill/blast patterns and safety clearance*
- **Match:** Yes

