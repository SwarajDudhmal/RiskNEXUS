import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler

class CreditRiskPreprocessor:
    """
    Preprocessing pipeline for credit risk analysis
    Handles all transformations needed for model prediction
    """
    
    def __init__(self, scaler):
        """
        Initialize preprocessor with fitted scaler
        
        Args:
            scaler: Fitted StandardScaler object
        """
        self.scaler = scaler
        
        # Define mappings from the notebook
        self.grade_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 3, 'F': 3, 'G': 3}
        self.term_map = {'36 months': 0, '60 months': 1}
        self.verification_map = {'Not Verified': 0, 'Verified': 1, 'Source Verified': 2}
        
        # Define main purposes for purpose grouping
        self.main_purposes = [
            'debt_consolidation', 'credit_card', 'house', 'car',
            'home_improvement', 'small_business', 'major_purchase'
        ]
        
        # Define numeric columns that need scaling
        self.numeric_cols = [
            'dti', 'annual_inc', 'loan_amnt', 'revol_util', 'delinq_2yrs',
            'inq_last_6mths', 'open_acc', 'pub_rec', 'bc_util', 'revol_bal',
            'total_acc', 'mo_sin_old_rev_tl_op', 'num_actv_bc_tl', 'percent_bc_gt_75'
        ]
        
        # Define expected feature order for models
        # Default model features (without grade)
        self.default_model_features = [
            'dti', 'annual_inc', 'loan_amnt', 'revol_util', 'delinq_2yrs',
            'inq_last_6mths', 'open_acc', 'pub_rec', 'bc_util', 'revol_bal',
            'total_acc', 'verification_status', 'term', 'mo_sin_old_rev_tl_op',
            'num_actv_bc_tl', 'percent_bc_gt_75',
            'home_ownership_grp_MORTGAGE', 'home_ownership_grp_OWN',
            'home_ownership_grp_RENT', 'purpose_grp_car', 'purpose_grp_credit_card',
            'purpose_grp_debt_consolidation', 'purpose_grp_home_improvement',
            'purpose_grp_house', 'purpose_grp_major_purchase',
            'purpose_grp_small_business'
        ]
        
        # Grade model features (without grade and default_flag)
        self.grade_model_features = [
            'dti', 'annual_inc', 'loan_amnt', 'revol_util', 'delinq_2yrs',
            'inq_last_6mths', 'open_acc', 'pub_rec', 'bc_util', 'revol_bal',
            'total_acc', 'verification_status', 'term', 'mo_sin_old_rev_tl_op',
            'num_actv_bc_tl', 'percent_bc_gt_75',
            'home_ownership_grp_MORTGAGE', 'home_ownership_grp_OWN',
            'home_ownership_grp_RENT', 'purpose_grp_car', 'purpose_grp_credit_card',
            'purpose_grp_debt_consolidation', 'purpose_grp_home_improvement',
            'purpose_grp_house', 'purpose_grp_major_purchase',
            'purpose_grp_small_business'
        ]
    
    def preprocess_user_data(self, user_data, feature_list=None):
        """
        Main preprocessing function that handles all transformations
        
        Args:
            user_data (dict): Dictionary containing user input
            feature_list (list): List of features to include in final output
            
        Returns:
            pd.DataFrame: Preprocessed data ready for model
        """
        # Create DataFrame from user input
        df = pd.DataFrame([user_data])
        
        # Apply transformations
        df = self._map_categorical_features(df)
        df = self._create_dummy_variables(df)
        df = self._scale_numeric_features(df)
        
        # Use default model features if none specified
        if feature_list is None:
            feature_list = self.default_model_features
            
        df = self._ensure_feature_order(df, feature_list)
        
        return df
    
    def _map_categorical_features(self, df):
        """Apply categorical mappings"""
        df = df.copy()
        
        # Map grade
        df['grade'] = df['grade'].map(self.grade_map).astype('int64')
        
        # Map term
        df['term'] = df['term'].map(self.term_map).astype('int64')
        
        # Map verification status
        df['verification_status'] = df['verification_status'].map(self.verification_map).astype('int64')
        
        return df
    
    def _create_dummy_variables(self, df):
        """Create dummy variables for categorical features"""
        df = df.copy()
        
        # Process home ownership
        df['home_ownership'] = df['home_ownership'].str.upper().replace({'NONE': 'OTHER', 'ANY': 'OTHER'})
        keep_home = ['MORTGAGE', 'RENT', 'OWN']
        df['home_ownership_grp'] = df['home_ownership'].where(
            df['home_ownership'].isin(keep_home), 'OTHER'
        )
        
        # Create home ownership dummies
        for ownership in ['MORTGAGE', 'OWN', 'RENT']:
            df[f'home_ownership_grp_{ownership}'] = (df['home_ownership_grp'] == ownership).astype(int)
        
        # Process purpose
        df['purpose_grp'] = df['purpose'].where(
            df['purpose'].isin(self.main_purposes), 'OTHER'
        )
        
        # Create purpose dummies (excluding 'OTHER' as it's the reference category)
        for purpose in self.main_purposes:
            df[f'purpose_grp_{purpose}'] = (df['purpose_grp'] == purpose).astype(int)
        
        # Drop original categorical columns
        df = df.drop(['home_ownership', 'home_ownership_grp', 'purpose', 'purpose_grp'], axis=1)
        
        return df
    
    def _scale_numeric_features(self, df):
        """Scale numeric features using the fitted scaler"""
        df = df.copy()
        
        # Scale numeric columns
        numeric_data = df[self.numeric_cols]
        scaled_data = self.scaler.transform(numeric_data)
        df[self.numeric_cols] = scaled_data
        
        return df
    
    def _ensure_feature_order(self, df, feature_list):
        """Ensure features are in the correct order for model prediction"""
        # Add missing columns with default values (0)
        for col in feature_list:
            if col not in df.columns:
                df[col] = 0
        
        # Select and reorder columns
        df = df[feature_list]
        
        return df
    
    def preprocess_for_default_prediction(self, user_data):
        """
        Preprocess data specifically for default prediction
        Uses features without 'grade' and 'default_flag'
        """
        processed_df = self.preprocess_user_data(user_data, self.default_model_features)
        return processed_df
    
    def preprocess_for_grade_prediction(self, user_data):
        """
        Preprocess data specifically for grade prediction
        Uses features without 'default_flag' and 'grade'
        """
        processed_df = self.preprocess_user_data(user_data, self.grade_model_features)
        return processed_df
    
    def get_feature_names(self, model_type="default"):
        """Return the list of feature names in the correct order"""
        if model_type == "default":
            return self.default_model_features.copy()
        elif model_type == "grade":
            return self.grade_model_features.copy()
        else:
            return self.default_model_features.copy()
    
    def validate_user_input(self, user_data):
        """
        Validate user input data
        
        Args:
            user_data (dict): User input dictionary
            
        Returns:
            tuple: (is_valid, error_message)
        """
        required_fields = [
            'annual_inc', 'loan_amnt', 'dti', 'revol_util', 'revol_bal',
            'bc_util', 'open_acc', 'total_acc', 'num_actv_bc_tl',
            'percent_bc_gt_75', 'home_ownership', 'verification_status',
            'delinq_2yrs', 'inq_last_6mths', 'pub_rec', 'mo_sin_old_rev_tl_op',
            'term', 'purpose', 'grade'
        ]
        
        # Check for missing required fields
        missing_fields = [field for field in required_fields if field not in user_data]
        if missing_fields:
            return False, f"Missing required fields: {', '.join(missing_fields)}"
        
        # Check for valid ranges
        validations = [
            ('annual_inc', lambda x: x >= 0, "Annual income must be non-negative"),
            ('loan_amnt', lambda x: x > 0, "Loan amount must be positive"),
            ('dti', lambda x: 0 <= x <= 100, "DTI must be between 0 and 100"),
            ('revol_util', lambda x: 0 <= x <= 100, "Revolving utilization must be between 0 and 100"),
            ('bc_util', lambda x: 0 <= x <= 100, "Bank card utilization must be between 0 and 100"),
        ]
        
        for field, validation_func, error_msg in validations:
            if not validation_func(user_data[field]):
                return False, error_msg
        
        return True, "Valid input"


class UserDataProcessor:
    """
    Class to handle user input data and prepare it for model predictions
    Stores user data and provides methods for model processing
    """
    
    def __init__(self, preprocessor):
        """
        Initialize with a preprocessor instance
        
        Args:
            preprocessor: CreditRiskPreprocessor instance
        """
        self.preprocessor = preprocessor
        self.user_data = {}
        self.processed_data = None
        self.validation_status = (False, "No data provided")
    
    def set_user_data(self, user_data_dict):
        """
        Set user data from dictionary
        
        Args:
            user_data_dict (dict): Dictionary containing user input
        """
        self.user_data = user_data_dict.copy()
        self.validation_status = self.preprocessor.validate_user_input(self.user_data)
        
        if self.validation_status[0]:  # If valid
            self.processed_data = self.preprocessor.preprocess_user_data(self.user_data)
    
    def get_data_for_default_prediction(self):
        """
        Get processed data for default prediction
        
        Returns:
            pd.DataFrame or None: Processed data or None if invalid
        """
        if not self.validation_status[0]:
            return None
        
        return self.preprocessor.preprocess_for_default_prediction(self.user_data)
    
    def get_data_for_grade_prediction(self):
        """
        Get processed data for grade prediction
        
        Returns:
            pd.DataFrame or None: Processed data or None if invalid
        """
        if not self.validation_status[0]:
            return None
        
        return self.preprocessor.preprocess_for_grade_prediction(self.user_data)
    
    def is_valid(self):
        """Check if current user data is valid"""
        return self.validation_status[0]
    
    def get_validation_error(self):
        """Get validation error message"""
        return self.validation_status[1]
    
    def get_user_data_summary(self):
        """Get a summary of the user data"""
        if not self.user_data:
            return "No data provided"
        
        summary = "User Data Summary:\n"
        summary += f"- Annual Income: ${self.user_data.get('annual_inc', 0):,.2f}\n"
        summary += f"- Loan Amount: ${self.user_data.get('loan_amnt', 0):,.2f}\n"
        summary += f"- DTI Ratio: {self.user_data.get('dti', 0):.2f}\n"
        summary += f"- Credit Grade: {self.user_data.get('grade', 'N/A')}\n"
        summary += f"- Home Ownership: {self.user_data.get('home_ownership', 'N/A')}\n"
        summary += f"- Loan Purpose: {self.user_data.get('purpose', 'N/A')}\n"
        
        return summary
    
    def export_to_list(self):
        """
        Export processed data as a list for model prediction
        
        Returns:
            list: Processed data as list or None if invalid
        """
        if not self.validation_status[0] or self.processed_data is None:
            return None
        
        return self.processed_data.iloc[0].tolist()
    
    def export_to_dict(self):
        """
        Export processed data as a dictionary
        
        Returns:
            dict: Processed data as dictionary or None if invalid
        """
        if not self.validation_status[0] or self.processed_data is None:
            return None
        
        return self.processed_data.iloc[0].to_dict()