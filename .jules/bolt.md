## 2025-09-24 - XGBoost Inference Optimization via Direct NumPy DMatrix
**Learning:** Creating a single-row pandas DataFrame to construct an `xgb.DMatrix` introduces significant overhead (~2.7ms vs ~0.4ms) due to pandas schema/type checking and series allocation. Passing a 2D float32 NumPy array directly with `feature_names` produces identical XGBoost predictions ~6x faster.
**Action:** When doing single-sample inference with XGBoost, use direct NumPy array inputs for `xgb.DMatrix` rather than pandas DataFrames.
