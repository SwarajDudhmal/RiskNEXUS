
import joblib
import xgboost as xgb
import json
import os

try:
    with open('temp_model.json', 'r') as f:
        model_json = json.load(f)
    
    if 'learner' in model_json:
        learner = model_json['learner']
        if 'gradient_booster' in learner:
            gb = learner['gradient_booster']
            print("Gradient booster keys:", gb.keys())
            if 'gbtree_model_param' in gb:
                print("gbtree_model_param:", gb['gbtree_model_param'])
            
            # Check model object specifically
            if 'model' in gb:
                model_obj = gb['model']
                print("Model object keys:", model_obj.keys())
                if 'gbtree_model_param' in model_obj:
                     print("inner gbtree_model_param:", model_obj['gbtree_model_param'])
                
                # Check trees
                if 'trees' in model_obj:
                    print(f"Number of trees: {len(model_obj['trees'])}")
                    # Inspect first tree
                    if len(model_obj['trees']) > 0:
                        print("First tree keys:", model_obj['trees'][0].keys())

except Exception as e:
    print(f"Error: {e}")
