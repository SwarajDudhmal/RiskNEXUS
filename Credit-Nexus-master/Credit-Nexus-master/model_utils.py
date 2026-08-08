import joblib
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings("ignore")

# Try to import preprocessing pipeline, but don't fail if it's not available
try:
    from preprocessing_pipeline import CreditRiskPreprocessor, UserDataProcessor
    PREPROCESSING_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import preprocessing pipeline: {e}")
    PREPROCESSING_AVAILABLE = False
    CreditRiskPreprocessor = None
    UserDataProcessor = None

class ModelManager:
    """
    Manages loading and prediction with credit risk models
    """
    
    def __init__(self, model_dir="Model"):
        """
        Initialize ModelManager
        
        Args:
            model_dir (str): Directory containing model files
        """
        self.model_dir = model_dir
        self.default_model = None
        self.grade_model = None
        self.scaler = None
        self.preprocessor = None
        
        # Grade mapping for reverse lookup
        self.grade_map_reverse = {0: 'A', 1: 'B', 2: 'C', 3: 'D'}
        
        # Load models and scaler
        self.load_models()
    
    def load_models(self):
        """Load all models and create preprocessor"""
        import os
        
        # Check if model directory exists
        if not os.path.exists(self.model_dir):
            print(f"❌ Model directory '{self.model_dir}' not found")
            return False
        
        # Define model file paths
        model_files = {
            'default_model': f'{self.model_dir}/xgb_default_model.pkl',
            'grade_model': f'{self.model_dir}/xgb_grade_model.pkl',
            'scaler': f'{self.model_dir}/scaler.pkl'
        }
        
        # Check if all files exist
        missing_files = []
        for name, path in model_files.items():
            if not os.path.exists(path):
                missing_files.append(f"{name}: {path}")
        
        if missing_files:
            print(f"❌ Missing model files:")
            for file in missing_files:
                print(f"   - {file}")
            return False
        
        # Try to load each model with specific error handling
        try:
            print("🔄 Loading default model...")
            self.default_model = joblib.load(model_files['default_model'])
            # Set device to CPU to avoid CUDA issues
            if hasattr(self.default_model, 'set_params'):
                self.default_model.set_params(device='cpu')
            print("✅ Default model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading default model: {e}")
            return False
        
        try:
            print("🔄 Loading grade model...")
            self.grade_model = joblib.load(model_files['grade_model'])
            # Set device to CPU to avoid CUDA issues
            # Note: set_params causes issues with the grade model metadata (n_classes mismatch)
            # if hasattr(self.grade_model, 'set_params'):
            #     self.grade_model.set_params(device='cpu')
            print("✅ Grade model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading grade model: {e}")
            return False
        
        try:
            print("🔄 Loading scaler...")
            self.scaler = joblib.load(model_files['scaler'])
            print("✅ Scaler loaded successfully")
        except Exception as e:
            print(f"❌ Error loading scaler: {e}")
            return False
        
        # Create preprocessor
        try:
            print("🔄 Creating preprocessor...")
            if PREPROCESSING_AVAILABLE and CreditRiskPreprocessor is not None:
                self.preprocessor = CreditRiskPreprocessor(self.scaler)
                print("✅ Preprocessor created successfully")
            else:
                print("⚠️ Preprocessing pipeline not available - creating placeholder")
                self.preprocessor = None
        except Exception as e:
            print(f"❌ Error creating preprocessor: {e}")
            self.preprocessor = None
        
        print("✅ All models loaded successfully!")
        return True
    
    def predict_default_risk(self, user_data):
        """
        Predict default risk for given user data
        
        Args:
            user_data (dict): User input dictionary
            
        Returns:
            dict: Prediction results
        """
        if self.default_model is None:
            return {"error": "Default model not loaded"}
        
        if self.preprocessor is None:
            return {"error": "Preprocessor not available"}
        
        try:
            # Preprocess data
            processed_data = self.preprocessor.preprocess_for_default_prediction(user_data)
            
            # Convert to numpy array to avoid device issues
            if hasattr(processed_data, 'values'):
                processed_array = processed_data.values
            else:
                processed_array = processed_data
            
            # Ensure numpy array is in correct format
            import numpy as np
            processed_array = np.asarray(processed_array, dtype=np.float32)
            
            # Make predictions with explicit CPU usage
            try:
                # Try setting device to CPU before prediction
                original_device = getattr(self.default_model, 'device', None)
                if hasattr(self.default_model, 'set_params'):
                    self.default_model.set_params(device='cpu')
                
                prediction = self.default_model.predict(processed_array)[0]
                probabilities = self.default_model.predict_proba(processed_array)[0]
                
                # Restore original device if it was changed
                if original_device and hasattr(self.default_model, 'set_params'):
                    self.default_model.set_params(device=original_device)
                    
            except Exception as device_error:
                print(f"Device error, trying fallback: {device_error}")
                # Fallback without device specification
                prediction = self.default_model.predict(processed_array)[0]
                probabilities = self.default_model.predict_proba(processed_array)[0]
            
            # Calculate risk score
            risk_score = probabilities[1] * 100
            
            # Determine risk level
            if risk_score < 20:
                risk_level = "Very Low"
                risk_color = "green"
            elif risk_score < 40:
                risk_level = "Low"
                risk_color = "lightgreen"
            elif risk_score < 60:
                risk_level = "Moderate"
                risk_color = "orange"
            elif risk_score < 80:
                risk_level = "High"
                risk_color = "red"
            else:
                risk_level = "Very High"
                risk_color = "darkred"
            
            return {
                "prediction": int(prediction),
                "risk_score": risk_score,
                "risk_level": risk_level,
                "risk_color": risk_color,
                "probability_no_default": probabilities[0],
                "probability_default": probabilities[1],
                "recommendation": self._get_default_recommendation(risk_score)
            }
            
        except Exception as e:
            return {"error": f"Error in default prediction: {str(e)}"}
    
    def predict_credit_grade(self, user_data):
        """
        Predict credit grade for given user data
        
        Args:
            user_data (dict): User input dictionary
            
        Returns:
            dict: Prediction results
        """
        if self.grade_model is None:
            return {"error": "Grade model not loaded"}
        
        if self.preprocessor is None:
            return {"error": "Preprocessor not available"}
        
        try:
            # Preprocess data
            processed_data = self.preprocessor.preprocess_for_grade_prediction(user_data)
            
            # Convert to numpy array to avoid device issues
            if hasattr(processed_data, 'values'):
                processed_array = processed_data.values
            else:
                processed_array = processed_data
            
            # Ensure numpy array is in correct format
            import numpy as np
            processed_array = np.asarray(processed_array, dtype=np.float32)
            
            # Make predictions with explicit CPU usage
            try:
                # Try setting device to CPU before prediction
                # original_device = getattr(self.grade_model, 'device', None)
                # if hasattr(self.grade_model, 'set_params'):
                #     self.grade_model.set_params(device='cpu')
                
                prediction = self.grade_model.predict(processed_array)[0]
                probabilities = self.grade_model.predict_proba(processed_array)[0]
                
                # Restore original device if it was changed
                # if original_device and hasattr(self.grade_model, 'set_params'):
                #     self.grade_model.set_params(device=original_device)
                    
            except Exception as device_error:
                print(f"Device error, trying fallback: {device_error}")
                # Fallback without device specification
                prediction = self.grade_model.predict(processed_array)[0]
                probabilities = self.grade_model.predict_proba(processed_array)[0]
            
            # Convert numeric grade to letter
            predicted_grade = self.grade_map_reverse.get(prediction, 'D')
            
            # Calculate confidence
            confidence = max(probabilities) * 100
            
            # Create probability distribution
            grade_probabilities = {}
            for i, prob in enumerate(probabilities):
                grade_letter = self.grade_map_reverse.get(i, 'D')
                grade_probabilities[grade_letter] = prob
            
            # Determine grade quality
            grade_quality = self._get_grade_quality(predicted_grade)
            
            return {
                "predicted_grade": predicted_grade,
                "confidence": confidence,
                "grade_probabilities": grade_probabilities,
                "grade_quality": grade_quality,
                "recommendation": self._get_grade_recommendation(predicted_grade)
            }
            
        except Exception as e:
            return {"error": f"Error in grade prediction: {str(e)}"}
    
    def _get_default_recommendation(self, risk_score):
        """Get recommendation based on risk score"""
        if risk_score < 20:
            return "✅ Excellent candidate - Approve with standard terms"
        elif risk_score < 40:
            return "✅ Good candidate - Approve with standard terms"
        elif risk_score < 60:
            return "⚠️ Moderate risk - Consider with careful review"
        elif risk_score < 80:
            return "❌ High risk - Recommend rejection or higher interest rate"
        else:
            return "❌ Very high risk - Strong recommendation to reject"
    
    def _get_grade_quality(self, grade):
        """Get quality description for grade"""
        quality_map = {
            'A': {'quality': 'Excellent', 'color': 'green'},
            'B': {'quality': 'Good', 'color': 'lightgreen'},
            'C': {'quality': 'Fair', 'color': 'orange'},
            'D': {'quality': 'Poor', 'color': 'red'}
        }
        return quality_map.get(grade, {'quality': 'Poor', 'color': 'red'})
    
    def _get_grade_recommendation(self, grade):
        """Get recommendation based on predicted grade"""
        recommendations = {
            'A': "💰 Prime borrower - Offer best rates and terms",
            'B': "👍 Near-prime borrower - Offer competitive rates",
            'C': "⚠️ Subprime borrower - Higher rates may be appropriate",
            'D': "❌ High-risk borrower - Consider rejection or very high rates"
        }
        return recommendations.get(grade, "❌ High-risk borrower - Consider rejection")
    
    def batch_predict(self, user_data_list):
        """
        Make predictions for multiple users
        
        Args:
            user_data_list (list): List of user data dictionaries
            
        Returns:
            list: List of prediction results
        """
        results = []
        for user_data in user_data_list:
            default_result = self.predict_default_risk(user_data)
            grade_result = self.predict_credit_grade(user_data)
            
            results.append({
                "default_prediction": default_result,
                "grade_prediction": grade_result
            })
        
        return results
    
    def model_info(self):
        """Get information about loaded models"""
        info = {}
        info["default_model_loaded"] = self.default_model is not None
        info["grade_model_loaded"] = self.grade_model is not None
        info["scaler_loaded"] = self.scaler is not None
        info["preprocessor_available"] = self.preprocessor is not None
        
        if self.default_model is not None:
            info["default_model_type"] = type(self.default_model).__name__
        
        if self.grade_model is not None:
            info["grade_model_type"] = type(self.grade_model).__name__
            
        return info


def create_sample_user_data(profile="moderate"):
    """Create sample user data for testing with different risk profiles"""
    
    if profile == "good":
        # Low risk, high income, good credit profile
        return {
            'annual_inc': 85000.0,
            'loan_amnt': 15000.0,
            'dti': 8.5,
            'revol_util': 25.0,
            'revol_bal': 3000.0,
            'bc_util': 20.0,
            'open_acc': 12,
            'total_acc': 18,
            'num_actv_bc_tl': 4,
            'percent_bc_gt_75': 0.0,
            'home_ownership': 'MORTGAGE',
            'verification_status': 'Verified',
            'delinq_2yrs': 0,
            'inq_last_6mths': 0,
            'pub_rec': 0,
            'mo_sin_old_rev_tl_op': 180,
            'term': '36 months',
            'purpose': 'home_improvement',
            'grade': 'A'
        }
    
    elif profile == "bad":
        # High risk, lower income, poor credit profile
        return {
            'annual_inc': 28000.0,
            'loan_amnt': 18000.0,
            'dti': 35.8,
            'revol_util': 85.0,
            'revol_bal': 15000.0,
            'bc_util': 90.0,
            'open_acc': 15,
            'total_acc': 22,
            'num_actv_bc_tl': 8,
            'percent_bc_gt_75': 75.0,
            'home_ownership': 'RENT',
            'verification_status': 'Not Verified',
            'delinq_2yrs': 3,
            'inq_last_6mths': 6,
            'pub_rec': 1,
            'mo_sin_old_rev_tl_op': 36,
            'term': '60 months',
            'purpose': 'debt_consolidation',
            'grade': 'E'
        }
    
    else:  # moderate profile (default)
        # Medium risk, average profile
        return {
            'annual_inc': 50000.0,
            'loan_amnt': 12000.0,
            'dti': 18.5,
            'revol_util': 55.0,
            'revol_bal': 8000.0,
            'bc_util': 60.0,
            'open_acc': 10,
            'total_acc': 16,
            'num_actv_bc_tl': 3,
            'percent_bc_gt_75': 10.0,
            'home_ownership': 'MORTGAGE',
            'verification_status': 'Verified',
            'delinq_2yrs': 1,
            'inq_last_6mths': 2,
            'pub_rec': 0,
            'mo_sin_old_rev_tl_op': 120,
            'term': '36 months',
            'purpose': 'credit_card',
            'grade': 'C'
        }


if __name__ == "__main__":
    # Test the model manager
    print("Testing ModelManager...")
    
    # Initialize model manager
    model_manager = ModelManager()
    
    # Check model info
    print("\nModel Info:")
    info = model_manager.model_info()
    for key, value in info.items():
        print(f"  {key}: {value}")
    
    # Test with sample data
    print("\nTesting with sample data...")
    sample_data = create_sample_user_data()
    
    # Test default prediction
    default_result = model_manager.predict_default_risk(sample_data)
    print(f"\nDefault Prediction: {default_result}")
    
    # Test grade prediction
    grade_result = model_manager.predict_credit_grade(sample_data)
    print(f"\nGrade Prediction: {grade_result}")