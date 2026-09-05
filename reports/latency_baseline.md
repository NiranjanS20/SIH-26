# Latency Baseline Metrics

| Method | Endpoint | Latency (ms) | Notes |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/health` | 12.7ms | Basic fastAPI router overhead |
| GET | `/api/v1/mines/dongri-buzurg/workspace` | 15.7ms | Aggregates precomputed in-memory state |
| GET | `/api/v1/mines/dongri-buzurg/prospectivity` | 1.8ms | |
| GET | `/api/v1/mines/dongri-buzurg/forecasting` | 3.1ms | |
| GET | `/api/v1/mines/dongri-buzurg/shortfall` | 1.5ms | |
| GET | `/api/v1/mines/dongri-buzurg/cause-analysis` | 3.1ms | Reads from eager-loaded SHAP models |
| GET | `/api/v1/mines/dongri-buzurg/corrective-action` | 1.5ms | |

**Conclusion:** All endpoint response times are well under 20ms. In-memory data loading and eager model loading have successfully eliminated latency spikes.
