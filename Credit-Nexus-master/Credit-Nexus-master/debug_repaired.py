
import joblib
import xgboost as xgb
import numpy as np
import pandas as pd
import json
import os

def debug_repaired():
    print("Debugging repaired model...")
    pickle_path = 'Model/xgb_grade_model.pkl'
    
    try:
        model = joblib.load(pickle_path)
        print(f"Model loaded: {type(model)}")
        
        # Simulate what the app does
        print("Setting params device='cpu'...")
        if hasattr(model, 'set_params'):
            model.set_params(device='cpu')
            
        # Check booster config again after set_params
        booster = model.get_booster()
        config = json.loads(booster.save_config())
        print(f"Booster num_class: {config.get('learner', {}).get('learner_model_param', {}).get('num_class')}")
        
        # Try prediction
        input_data = np.random.rand(1, 26).astype(np.float32)
        print("Attempting prediction...")
        pred = model.predict(input_data)
        print(f"Prediction: {pred}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_repaired()
