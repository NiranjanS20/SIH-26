import pandas as pd
import numpy as np

# NEW: Geotechnical stress inputs for Kandri
geotechnical_stress_inputs = {
    '-500L': {
        'depth_m': 206,
        'max_horizontal_stress_mpa': 14.1,
        'vertical_stress_mpa': 5.56,
        'equipment_stress_factor': 1.0,
        'bolt_installation_hours_per_shift': 2.5,
    },
    '-600L': {
        'depth_m': 236,
        'max_horizontal_stress_mpa': 15.64,  # MAX
        'vertical_stress_mpa': 6.37,
        'equipment_stress_factor': 1.15,  # 15% higher stress
        'bolt_installation_hours_per_shift': 3.5,
    },
    '-700L_future': {
        'depth_m': 300,
        'max_horizontal_stress_mpa': 18.2,  # Extrapolated
        'vertical_stress_mpa': 8.1,
        'equipment_stress_factor': 1.35,  # 35% higher stress
        'bolt_installation_hours_per_shift': 4.0,  # Max practical
        'status': 'Not yet active; requires equipment upgrade'
    }
}

if __name__ == "__main__":
    print("Kandri Model 2 (Production with Geotech Stress) initialized.")
    for level, stress in geotechnical_stress_inputs.items():
        print(f"Level {level}: Stress Factor = {stress.get('equipment_stress_factor', 'N/A')}")
