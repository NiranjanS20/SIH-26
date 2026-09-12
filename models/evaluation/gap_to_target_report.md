# Gap-to-Target Inverse-Lookup Engine (Feature 5 Extension)

## Objective
Provide an operational lookup engine that finds feasible combinations of input parameters to close a predicted production shortfall, utilizing the existing trained XGBoost production forecaster (`model2_xgb.json`) as the forward evaluation function.

## Grid Search Constraints
- **Grid Size:** 21 x 21 (441 combinations). This density was chosen to provide smooth operational targets while remaining fast enough for sub-second inference inside the FastAPI layer.
- **Variables Swept:**
  1. `equipment_uptime_pct`: Swept from the *current day's value* up to 1.0 (100%).
  2. `blasting_delay_hrs`: Swept from the *current day's value* down to 0.
- **Excluded Variables:** `plant_availability` is deliberately excluded because it is not an input feature the XGBoost model was trained on. Adding a third dimension to the search that the model ignores would yield identical predictions and provide no operational value.

## Ranking Logic
To ensure the recommended actions are the easiest to implement operationally, all feasible combinations (where predicted production $\ge$ target production) are ranked using **normalized Euclidean distance** from the current state:
- Distance for Uptime: $\frac{\text{Candidate Uptime} - \text{Current Uptime}}{1.0 - \text{Current Uptime}}$
- Distance for Delay: $\frac{\text{Current Delay} - \text{Candidate Delay}}{\text{Current Delay}}$

The combinations with the smallest total change score are presented as the top options.

## Performance
- **Latency:** Evaluating 441 rows in XGBoost using a batch pandas DataFrame takes $<100$ ms on standard CPU hardware.

## Worked Example Output
*If shortfall is detected on a High-Risk Day:*
`Option 1: Increase uptime to 92.5% and reduce blasting delay to 1.5 hrs (Forecast: 1045.2t) | Option 2: Increase uptime to 95.0% and reduce blasting delay to 2.0 hrs (Forecast: 1048.1t) | Option 3: Increase uptime to 90.0% and reduce blasting delay to 0.5 hrs (Forecast: 1050.5t)`

*If no feasible action can reach the target (e.g., severe monsoon penalty):*
`Max effort (Uptime: 100.0%, Delay: 0.0h) yields 850.5t (still short by 125.0t)`
