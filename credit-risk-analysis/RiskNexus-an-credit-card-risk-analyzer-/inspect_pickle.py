
import pickle
import sys
import os
import sklearn
import pandas as pd
import numpy as np

model_path = r'backend/saved_model/credit_risk_model.pkl'

print(f"Loading model from {model_path}...")

try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    print(f"Model loaded successfully. Type: {type(model)}")
    
    if hasattr(model, 'n_features_in_'):
        print(f"Number of features: {model.n_features_in_}")
    
    if hasattr(model, 'feature_names_in_'):
        print(f"Feature names: {model.feature_names_in_}")
    
    if hasattr(model, 'get_params'):
        print(f"Parameters: {model.get_params()}")
        
except Exception as e:
    print(f"Error loading model: {e}")
