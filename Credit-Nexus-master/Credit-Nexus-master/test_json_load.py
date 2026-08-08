
import xgboost as xgb
import numpy as np
import json
import joblib

try:
    print("Loading model from JSON...")
    # Initialize a new booster and load model
    booster = xgb.Booster()
    booster.load_model('temp_model.json')
    print("Model loaded from JSON.")
    
    # Create dummy data
    input_data = np.random.rand(1, 26).astype(np.float32)
    dtest = xgb.DMatrix(input_data)
    
    print("Attempting prediction with booster...")
    pred = booster.predict(dtest)
    print(f"Prediction result: {pred}")
    
    # Also try to wrap it in XGBClassifier to mimic app usage
    print("Wrapping in XGBClassifier...")
    clf = xgb.XGBClassifier()
    # Load attributes from the original pickle to preserve other params if needed
    # But for now, just load the booster
    clf._Booster = booster
    # We need to set n_classes_ and classes_ for sklearn wrapper to work
    clf.n_classes_ = 4
    clf.classes_ = np.array([0, 1, 2, 3])
    clf.objective = 'multi:softmax'
    
    # Try predict with classifier
    # Note: XGBClassifier.predict expects X, not DMatrix, and uses inplace_predict usually
    print("Attempting prediction with XGBClassifier wrapper...")
    pred_clf = clf.predict(input_data)
    print(f"Classifier prediction: {pred_clf}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
