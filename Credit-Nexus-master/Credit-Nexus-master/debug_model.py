
import joblib
import xgboost as xgb
import numpy as np
import pandas as pd
import sys

try:
    print("Loading grade model...")
    model = joblib.load('Model/xgb_grade_model.pkl')
    print("Model loaded.")
    
    # Create dummy data with 26 features (as seen in num_feature=26)
    # We need to know the feature order or just provide a random array
    
    # From preprocessing_pipeline.py, grade_model_features has 26 items:
    # 'dti', 'annual_inc', 'loan_amnt', 'revol_util', 'delinq_2yrs',
    # 'inq_last_6mths', 'open_acc', 'pub_rec', 'bc_util', 'revol_bal',
    # 'total_acc', 'verification_status', 'term', 'mo_sin_old_rev_tl_op',
    # 'num_actv_bc_tl', 'percent_bc_gt_75',
    # 'home_ownership_grp_MORTGAGE', 'home_ownership_grp_OWN',
    # 'home_ownership_grp_RENT', 'purpose_grp_car', 'purpose_grp_credit_card',
    # 'purpose_grp_debt_consolidation', 'purpose_grp_home_improvement',
    # 'purpose_grp_house', 'purpose_grp_major_purchase',
    # 'purpose_grp_small_business'
    
    input_data = np.random.rand(1, 26).astype(np.float32)
    
    print("Attempting prediction...")
    try:
        # Try setting cpu like in the app
        if hasattr(model, 'set_params'):
            print("Setting device to cpu...")
            model.set_params(device='cpu')
            
        pred = model.predict(input_data)
        print(f"Prediction: {pred}")
    except Exception as e:
        print(f"Prediction failed: {e}")
        import traceback
        traceback.print_exc()

except Exception as e:
    print(f"Error: {e}")
