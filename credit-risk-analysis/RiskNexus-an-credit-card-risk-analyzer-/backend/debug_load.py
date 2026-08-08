
import os
import joblib
import sys

print(f"CWD: {os.getcwd()}")
print(f"Script: {__file__}")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_RELATIVE = 'saved_model/credit_risk_model.pkl'
MODEL_PATH = os.path.join(BASE_DIR, MODEL_RELATIVE)

print(f"Target Path: {MODEL_PATH}")
print(f"Exists: {os.path.exists(MODEL_PATH)}")

try:
    model = joblib.load(MODEL_PATH)
    print("Load Success!")
    print(f"Type: {type(model)}")
except Exception as e:
    print(f"Load Failed: {e}")
    import traceback
    traceback.print_exc()
