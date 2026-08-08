
import joblib
import xgboost as xgb
import numpy as np
import pandas as pd
import json
import os

def repair_model():
    print("Starting model repair (Plan B)...")
    
    # Paths
    pickle_path = 'Model/xgb_grade_model.pkl'
    json_path = 'Model/xgb_grade_model.json'
    backup_path = 'Model/xgb_grade_model_backup.pkl'
    
    # 1. Load original pickle
    print(f"Loading original model from {pickle_path}...")
    try:
        original_model = joblib.load(pickle_path)
    except Exception as e:
        print(f"Failed to load original model: {e}")
        return False

    # 2. Extract booster and save to JSON
    print("Extracting booster and saving to JSON...")
    try:
        booster = original_model.get_booster()
        booster.save_model(json_path)
        print(f"Saved JSON model to {json_path}")
    except Exception as e:
        print(f"Failed to save JSON model: {e}")
        return False
        
    # 3. Load clean booster and swap
    print("Loading clean booster and swapping...")
    try:
        # Load booster from JSON to ensure clean state
        clean_booster = xgb.Booster()
        clean_booster.load_model(json_path)
        
        # Swap the booster in the original model
        # Note: XGBoost stores booster in different places depending on version
        # Usually _Booster
        if hasattr(original_model, '_Booster'):
            original_model._Booster = clean_booster
        else:
            print("Warning: could not find _Booster attribute")
            # Try to see if there is another way, but typically it is _Booster
            # Maybe use set_params if possible? No, set_params is for hyperparameters.
            
    except Exception as e:
        print(f"Failed to swap booster: {e}")
        return False
        
    # 4. Verify prediction with dummy data
    print("Verifying prediction...")
    try:
        # Get feature names from booster
        feature_names = clean_booster.feature_names
        print(f"Model expects {len(feature_names)} features")
        
        # Create dummy dataframe
        dummy_data = pd.DataFrame(
            np.random.rand(1, len(feature_names)),
            columns=feature_names
        )
        
        # Predict
        pred = original_model.predict(dummy_data)
        proba = original_model.predict_proba(dummy_data)
        print(f"Prediction successful: {pred}, Proba shape: {proba.shape}")
        
    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False

    # 5. Backup and Overwrite
    print("Backing up and saving fixed model...")
    try:
        if os.path.exists(pickle_path):
            if os.path.exists(backup_path):
                os.remove(backup_path)
            os.rename(pickle_path, backup_path)
            print(f"Backed up original to {backup_path}")
        
        joblib.dump(original_model, pickle_path)
        print(f"Saved fixed model to {pickle_path}")
        
        # Cleanup JSON
        if os.path.exists(json_path):
            os.remove(json_path)
            
        return True
    except Exception as e:
        print(f"Failed to save fixed model: {e}")
        # Restore backup if needed
        if os.path.exists(backup_path) and not os.path.exists(pickle_path):
            os.rename(backup_path, pickle_path)
        return False

if __name__ == "__main__":
    if repair_model():
        print("\n✅ Model repaired successfully!")
    else:
        print("\n❌ Model repair failed!")
