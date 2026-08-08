
import joblib
import xgboost as xgb
import json
import os

try:
    print("Loading grade model...")
    model = joblib.load('Model/xgb_grade_model.pkl')
    booster = model.get_booster()
    
    # Save to JSON
    print("Saving booster to JSON...")
    booster.save_model('temp_model.json')
    
    # Read JSON
    with open('temp_model.json', 'r') as f:
        model_json = json.load(f)
    
    print("Model JSON keys:", model_json.keys())
    
    if 'learner' in model_json:
        learner = model_json['learner']
        print("Learner keys:", learner.keys())
        
        if 'learner_model_param' in learner:
            print("learner_model_param:", learner['learner_model_param'])
            
        if 'objective' in learner:
            print("objective:", learner['objective'])
            
    # Check if we can find where '7' comes from
    # Maybe it's in the objective parameters?
    
except Exception as e:
    print(f"Error: {e}")
