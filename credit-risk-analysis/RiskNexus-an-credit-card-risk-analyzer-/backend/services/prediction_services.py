import pickle
import joblib
from sklearn.ensemble import RandomForestRegressor
import pandas as pd
import numpy as np
import os

# Global model variable
model = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../saved_model/credit_risk_model.pkl')

def load_model():
    global model
    if model is None:
        try:
            if os.path.exists(MODEL_PATH) and os.path.getsize(MODEL_PATH) > 0:
                try:
                    model = joblib.load(MODEL_PATH)
                    print(f"Model loaded from {MODEL_PATH}")
                except Exception:
                    with open(MODEL_PATH, 'rb') as f:
                        model = pickle.load(f)
                    print(f"Model loaded from {MODEL_PATH}")
            else:
                train_default_model()
        except Exception as e:
            model = None
            print("Model load failed; using heuristic scoring")

def train_default_model():
    global model
    n = 800
    rng = np.random.RandomState(42)
    data = {
        'age': rng.randint(18, 70, size=n),
        'income': rng.randint(20000, 200000, size=n).astype(float),
        'debt': rng.randint(0, 150000, size=n).astype(float),
        'creditCardUtilization': rng.randint(0, 100, size=n).astype(float),
        'openCreditLines': rng.randint(1, 12, size=n),
        'creditHistoryLength': rng.randint(1, 30, size=n).astype(float)
    }
    df = pd.DataFrame(data)
    dti = df['debt'] / np.clip(df['income'], 1, None)
    score = np.full(n, 300.0)
    score += np.where(dti < 0.1, 150, np.where(dti < 0.3, 120, np.where(dti < 0.5, 80, 40)))
    util = df['creditCardUtilization']
    score += np.where(util < 10, 150, np.where(util < 30, 120, np.where(util < 50, 80, np.where(util < 70, 40, 10))))
    hist = df['creditHistoryLength']
    score += np.where(hist > 10, 80, np.where(hist > 5, 60, np.where(hist > 2, 40, 20)))
    lines = df['openCreditLines']
    score += np.where(lines >= 10, 60, np.where(lines >= 5, 50, np.where(lines >= 2, 30, 10)))
    age = df['age']
    score += np.where(age > 50, 60, np.where(age > 35, 45, np.where(age > 25, 30, 15)))
    score = np.clip(score + rng.normal(0, 5, size=n), 300, 850)
    X = df[['age','income','debt','creditCardUtilization','openCreditLines','creditHistoryLength']]
    y = score
    reg = RandomForestRegressor(n_estimators=80, random_state=42)
    reg.fit(X, y)
    os.makedirs(os.path.dirname(os.path.join(os.path.dirname(__file__), '../saved_model')), exist_ok=True)
    joblib.dump(reg, MODEL_PATH)
    model = reg

# Load model on module import (or lazy load)
load_model()

def calculate_credit_score(data):
    """
    Calculate credit score using ML model if available, otherwise fallback to heuristics.
    Input data expected:
    - age (int)
    - income (float)
    - debt (float)
    - creditCardUtilization (float, 0-100)
    - openCreditLines (int)
    - creditHistoryLength (float, years)
    """
    
    # Extract inputs with defaults
    age = data.get('age', 30)
    income = data.get('income', 50000)
    debt = data.get('debt', 10000)
    utilization = data.get('creditCardUtilization', 30)
    lines = data.get('openCreditLines', 3)
    history = data.get('creditHistoryLength', 5)
    
    final_score = 0
    used_model = False

    # Try ML prediction
    if model:
        try:
            # Prepare input features matching training data
            # Order matters! Construct DataFrame to align with feature names if possible
            input_dict = {
                'age': [age],
                'income': [income],
                'debt': [debt],
                'creditCardUtilization': [utilization],
                'openCreditLines': [lines],
                'creditHistoryLength': [history]
            }
            
            input_df = pd.DataFrame(input_dict)
            
            # Align columns if model has feature names
            if hasattr(model, 'feature_names_in_'):
                input_df = input_df[model.feature_names_in_]
            
            prediction = model.predict(input_df)[0]
            final_score = int(prediction)
            used_model = True
            
        except Exception as e:
            print(f"Prediction error using ML model: {e}. Falling back to heuristics.")
            used_model = False

    if not used_model:
        # FALLBACK: Base heuristic score
        score = 300
        
        # 1. Payment History (Simulated by Debt-to-Income Ratio)
        dti = debt / income if income > 0 else 1.0
        if dti < 0.1: score += 150
        elif dti < 0.3: score += 120
        elif dti < 0.5: score += 80
        else: score += 40
            
        # 2. Credit Utilization (30% of score impact)
        if utilization < 10: score += 150
        elif utilization < 30: score += 120
        elif utilization < 50: score += 80
        elif utilization < 70: score += 40
        else: score += 10
            
        # 3. Credit History Length (15% of score impact)
        if history > 10: score += 80
        elif history > 5: score += 60
        elif history > 2: score += 40
        else: score += 20
            
        # 4. Credit Mix (Open Lines)
        if lines >= 10: score += 60
        elif lines >= 5: score += 50
        elif lines >= 2: score += 30
        else: score += 10
        
        # 5. Age Factor (Stability proxy)
        if age > 50: score += 60
        elif age > 35: score += 45
        elif age > 25: score += 30
        else: score += 15
        
        final_score = int(score)
    
    # Cap score between 300 and 850
    final_score = min(max(final_score, 300), 850)
    
    # Generate summary
    # Calculate derived stats for summary generation
    dti_val = debt / income if income > 0 else 1.0
    summary = generate_summary(final_score, utilization, dti_val, history)

    return {
        'creditScore': final_score,
        'summary': summary,
        'modelUsed': used_model
    }

def generate_summary(score, utilization, dti, history):
    reasons = []

    if score >= 740:
        sentiment = "Excellent work!"
    elif score >= 670:
        sentiment = "Good job."
    else:
        sentiment = "There is room for improvement."

    if utilization > 30:
        reasons.append(f"High credit utilization ({utilization}%) is negatively impacting your score.")
    else:
        reasons.append("Your low credit utilization is helping your score.")

    if dti > 0.4:
        reasons.append("Your debt-to-income ratio is high, suggesting financial strain.")

    if history < 5:
        reasons.append("A relatively short credit history limits your score potential.")

    return f"{sentiment} { ' '.join(reasons) }"

def predict_impact(action, details, current_score):
    """
    Predict the impact of a financial action on the credit score.
    Returns:
    - scoreImpact (int): The change in score (positive or negative)
    - explanation (str): A brief explanation
    """
    impact = 0
    explanation = ""

    # Heuristic rules for impact prediction
    if action == 'Miss a payment':
        days = 30 # default
        if 'Days Delayed' in details:
            try:
                days_str = details.split('Days Delayed: ')[1].split('days')[0]
                days = int(days_str)
            except:
                pass
        
        if days <= 30:
            impact = -30
            explanation = "Missing a payment by 30 days can drop your score significantly."
        elif days <= 60:
            impact = -60
            explanation = "A 60-day delinquency is a serious negative mark."
        else:
            impact = -90
            explanation = "Serious delinquency (90+ days) causes major score damage."

    elif action == 'Default on loan':
        impact = -150
        explanation = "Defaulting on a loan is one of the most damaging actions to your credit score."

    elif action == 'Pay off loan':
        impact = 20
        explanation = "Paying off a loan reduces your debt load and improves your mix, boosting your score."

    elif action == 'Close credit card':
        impact = -15
        explanation = "Closing a card reduces your total available credit, increasing utilization."

    elif action == 'Change card utilization':
        new_util = 30
        if 'New Utilization' in details:
             try:
                util_str = details.split('New Utilization: ')[1].split('%')[0]
                new_util = int(util_str)
             except:
                pass
        
        # Assume current is ~30 for baseline comparison if not tracked perfectly
        if new_util < 10:
            impact = 25
            explanation = "lowering utilization to under 10% is excellent for your score."
        elif new_util < 30:
            impact = 10
            explanation = "Keeping utilization under 30% is good practice."
        elif new_util > 70:
            impact = -40
            explanation = "High utilization (>70%) signals risk to lenders."
        elif new_util > 50:
            impact = -20
            explanation = "Utilization above 50% can start to hurt your score."
        else:
             impact = 0
             explanation = "This change has a neutral impact."

    elif action == 'Take new home loan':
        impact = -5
        explanation = "A hard inquiry for a mortgage causes a small, temporary dip."

    elif action == 'Open new credit card':
        impact = -5
        explanation = "Opening a new card requires a hard inquiry, slightly lowering your score initially."

    elif action == 'Take new car loan':
        impact = -5
        explanation = "Applying for an auto loan results in a hard inquiry."

    elif action == 'Enquire for new loan':
        impact = -5
        explanation = "Hard inquiries typically lower your score by a few points."

    else:
        impact = 0
        explanation = "Action impact analysis not available."

    return {
        'scoreImpact': impact,
        'explanation': explanation
    }

def get_recommendations(data):
    """
    Generate personalized recommendations based on credit data.
    """
    recommendations = []
    
    utilization = data.get('creditCardUtilization', 30)
    history = data.get('creditHistoryLength', 5)
    lines = data.get('openCreditLines', 3)
    debt = data.get('debt', 10000)
    income = data.get('income', 50000)
    
    dti = debt / income if income > 0 else 0

    if utilization > 30:
        recommendations.append("Pay down credit card balances to get utilization under 30%.")
    if utilization > 10:
        recommendations.append("Aim for a utilization rate below 10% for the best score impact.")
    
    if history < 5:
        recommendations.append("Keep your oldest accounts open to lengthen your credit history.")
    
    if lines < 3:
        recommendations.append("Consider opening a secured credit card to build a thicker credit file.")
        
    if dti > 0.4:
        recommendations.append("Focus on paying off high-interest debt to lower your Debt-to-Income ratio.")

    if not recommendations:
        recommendations.append("Continue making all payments on time.")
        recommendations.append("Monitor your credit report regularly for errors.")

    return {
        'recommendations': recommendations
    }
