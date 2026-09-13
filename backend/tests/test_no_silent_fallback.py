import os
import sys
import unittest

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# We'll mock the registry's load method to simulate a missing file
from app.services.model_registry import model_registry

class TestNoSilentFallback(unittest.TestCase):
    def test_tirodi_no_silent_fallback(self):
        # Temporarily clear the tirodi model
        original_tirodi = model_registry.model2_xgb_tirodi
        model_registry.model2_xgb_tirodi = None
        
        try:
            from app.services.whatif_service import simulate_whatif
            # Call simulate_whatif for Tirodi
            with self.assertRaises(ValueError) as context:
                simulate_whatif(mine_id="tirodi", equipment_pct=80, blasting_delay_days=1, rainfall_mm=10)
                
            # Assert that the error explicitly mentions Tirodi missing, and not just returning DB predictions
            self.assertIn("Model 2 for Tirodi is missing or failed to load. No silent fallback permitted.", str(context.exception))
            print("SUCCESS: Explicit error raised. No silent fallback occurred.")
        finally:
            # Restore
            model_registry.model2_xgb_tirodi = original_tirodi

if __name__ == '__main__':
    unittest.main()
