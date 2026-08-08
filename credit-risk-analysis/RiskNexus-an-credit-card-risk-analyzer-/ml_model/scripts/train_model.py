
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import pickle
import os
import time

# Define model path
MODEL_DIR = r'../../backend/saved_model'
MODEL_PATH = os.path.join(MODEL_DIR, 'credit_risk_model.pkl')

# Create directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)

print("Generating synthetic data...")

n_samples = 5000
np.random.seed(42)

data = {
    'age': np.random.randint(18, 80, n_samples),
    'income': np.random.normal(60000, 20000, n_samples),
    'debt': np.random.normal(15000, 10000, n_samples),
    'creditCardUtilization': np.random.uniform(0, 100, n_samples),
    'openCreditLines': np.random.randint(0, 20, n_samples),
    'creditHistoryLength': np.random.uniform(0, 30, n_samples)
}

df = pd.DataFrame(data)
df['income'] = df['income'].apply(lambda x: max(x, 10000))
df['debt'] = df['debt'].apply(lambda x: max(x, 0))

def calculate_synthetic_score(row):
    score = 600
    score += (row['income'] / 1000) * 0.5
    score -= (row['debt'] / 1000) * 2
    if row['creditCardUtilization'] < 30: score += 50
    elif row['creditCardUtilization'] > 70: score -= 50
    else: score -= (row['creditCardUtilization'] - 30) * 2
    score += row['creditHistoryLength'] * 3
    if row['age'] < 25: score -= 20
    else: score += (row['age'] - 25) * 0.5
    if row['openCreditLines'] < 2: score -= 20
    elif row['openCreditLines'] > 15: score -= 10
    else: score += 10
    score += np.random.normal(0, 15)
    return min(max(int(score), 300), 850)

df['target_score'] = df.apply(calculate_synthetic_score, axis=1)

print("Training model...")
X = df.drop('target_score', axis=1)
y = df['target_score']

# Train simple Random Forest
rf = RandomForestRegressor(n_estimators=100, random_state=42)
rf.fit(X, y)

print(f"Model score (R2): {rf.score(X, y):.4f}")

# Save model
print(f"Saving model to {MODEL_PATH}...")
if os.path.exists(MODEL_PATH):
    os.remove(MODEL_PATH)

with open(MODEL_PATH, 'wb') as f:
    pickle.dump(rf, f, protocol=4)
    f.flush()
    os.fsync(f.fileno())

time.sleep(1)

# Verify loading
if os.path.exists(MODEL_PATH):
    size = os.path.getsize(MODEL_PATH)
    print(f"File size: {size} bytes")
    if size == 0:
        print("ERROR: File is empty!")
else:
    print("ERROR: File does not exist!")

try:
    with open(MODEL_PATH, 'rb') as f:
        loaded = pickle.load(f)
    print("Verification load successful.")
    print(f"Expected features: {loaded.n_features_in_}")
except Exception as e:
    print(f"Verification FAILED: {e}")
