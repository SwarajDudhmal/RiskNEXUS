import streamlit as st
import pandas as pd
import numpy as np
from model_utils import ModelManager, create_sample_user_data
import warnings
warnings.filterwarnings("ignore")

# Page config
st.set_page_config(
    page_title="Credit Nexus - Risk Analysis",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load model manager
@st.cache_resource
def load_model_manager():
    """Load the model manager with all models"""
    return ModelManager()

# Initialize model manager
model_manager = load_model_manager()

# Title and description
st.title("💳 Credit Nexus - Risk Analysis Dashboard")
st.markdown("---")

# Create two columns for layout
col1, col2 = st.columns([2, 1])

with col1:
    st.header("📊 Applicant Information")
    
    # Create tabs for better organization
    tab1, tab2, tab3 = st.tabs(["📈 Financial Info", "🏠 Personal Info", "📋 Loan Details"])
    
    with tab1:
        st.subheader("Financial Information")
        
        # Financial inputs
        col_fin1, col_fin2 = st.columns(2)
        
        with col_fin1:
            annual_inc = st.number_input(
                "Annual Income ($)", 
                min_value=0.0, 
                max_value=10000000.0, 
                value=st.session_state.get('annual_inc', 50000.0),
                step=1000.0,
                help="Total annual income of the applicant"
            )
            
            loan_amnt = st.number_input(
                "Loan Amount ($)", 
                min_value=0.0, 
                max_value=100000.0, 
                value=st.session_state.get('loan_amnt', 10000.0),
                step=500.0,
                help="The total amount of the loan"
            )
            
            dti = st.number_input(
                "Debt-to-Income Ratio", 
                min_value=0.0, 
                max_value=100.0, 
                value=st.session_state.get('dti', 10.0),
                step=0.1,
                help="Monthly debt payments divided by monthly income"
            )
            
            revol_util = st.number_input(
                "Revolving Utilization Rate (%)", 
                min_value=0.0, 
                max_value=100.0, 
                value=st.session_state.get('revol_util', 50.0),
                step=1.0,
                help="Amount of credit used relative to available credit"
            )
            
            revol_bal = st.number_input(
                "Revolving Balance ($)", 
                min_value=0.0, 
                max_value=1000000.0, 
                value=5000.0,
                step=100.0,
                help="Total revolving credit balance"
            )
        
        with col_fin2:
            bc_util = st.number_input(
                "Bank Card Utilization (%)", 
                min_value=0.0, 
                max_value=100.0, 
                value=50.0,
                step=1.0,
                help="Bank card utilization rate"
            )
            
            open_acc = st.number_input(
                "Open Accounts", 
                min_value=0, 
                max_value=50, 
                value=8,
                step=1,
                help="Number of open credit accounts"
            )
            
            total_acc = st.number_input(
                "Total Accounts", 
                min_value=0, 
                max_value=100, 
                value=15,
                step=1,
                help="Total number of credit accounts"
            )
            
            num_actv_bc_tl = st.number_input(
                "Active Bank Card Accounts", 
                min_value=0, 
                max_value=20, 
                value=3,
                step=1,
                help="Number of currently active bank card accounts"
            )
            
            percent_bc_gt_75 = st.number_input(
                "Bank Cards >75% Utilization (%)", 
                min_value=0.0, 
                max_value=100.0, 
                value=0.0,
                step=1.0,
                help="Percentage of bank cards with >75% utilization"
            )
    
    with tab2:
        st.subheader("Personal & Credit History")
        
        col_pers1, col_pers2 = st.columns(2)
        
        with col_pers1:
            # Home ownership
            home_ownership_options = ["MORTGAGE", "RENT", "OWN", "OTHER"]
            home_ownership_default = st.session_state.get('home_ownership', 'MORTGAGE')
            home_ownership_index = home_ownership_options.index(home_ownership_default) if home_ownership_default in home_ownership_options else 0
            
            home_ownership = st.selectbox(
                "Home Ownership",
                options=home_ownership_options,
                index=home_ownership_index,
                help="Current home ownership status"
            )
            
            verification_options = ["Not Verified", "Verified", "Source Verified"]
            verification_default = st.session_state.get('verification_status', 'Not Verified')
            verification_index = verification_options.index(verification_default) if verification_default in verification_options else 0
            
            verification_status = st.selectbox(
                "Verification Status",
                options=verification_options,
                index=verification_index,
                help="Income verification status"
            )
            
            delinq_2yrs = st.number_input(
                "Delinquencies (2 years)", 
                min_value=0, 
                max_value=20, 
                value=0,
                step=1,
                help="Number of 30+ days past-due incidences in past 2 years"
            )
        
        with col_pers2:
            inq_last_6mths = st.number_input(
                "Inquiries (6 months)", 
                min_value=0, 
                max_value=20, 
                value=1,
                step=1,
                help="Number of inquiries in past 6 months"
            )
            
            pub_rec = st.number_input(
                "Public Records", 
                min_value=0, 
                max_value=10, 
                value=0,
                step=1,
                help="Number of derogatory public records"
            )
            
            mo_sin_old_rev_tl_op = st.number_input(
                "Months Since Oldest Revolving Account", 
                min_value=0, 
                max_value=1000, 
                value=120,
                step=1,
                help="Months since oldest revolving account opened"
            )
    
    with tab3:
        st.subheader("Loan Details")
        
        col_loan1, col_loan2 = st.columns(2)
        
        with col_loan1:
            term_options = ["36 months", "60 months"]
            term_default = st.session_state.get('term', '36 months')
            term_index = term_options.index(term_default) if term_default in term_options else 0
            
            term = st.selectbox(
                "Loan Term",
                options=term_options,
                index=term_index,
                help="Loan repayment term"
            )
            
            purpose_options = ["debt_consolidation", "credit_card", "house", "car", 
                              "home_improvement", "small_business", "major_purchase", "OTHER"]
            purpose_default = st.session_state.get('purpose', 'debt_consolidation')
            purpose_index = purpose_options.index(purpose_default) if purpose_default in purpose_options else 0
            
            purpose = st.selectbox(
                "Loan Purpose",
                options=purpose_options,
                index=purpose_index,
                help="Purpose of the loan"
            )
        
        with col_loan2:
            grade = st.selectbox(
                "Initial Grade (Optional)",
                options=["A", "B", "C", "D", "E", "F", "G"],
                index=2,
                help="Initial credit grade (will be predicted if not specified)"
            )

with col2:
    st.header("🔮 Predictions")
    st.markdown("---")
    
    # Check if model manager is loaded
    if model_manager and model_manager.model_info().get('default_model_loaded', False):
        # Create user data dictionary
        user_data = {
            'annual_inc': annual_inc,
            'loan_amnt': loan_amnt,
            'dti': dti,
            'revol_util': revol_util,
            'revol_bal': revol_bal,
            'bc_util': bc_util,
            'open_acc': open_acc,
            'total_acc': total_acc,
            'num_actv_bc_tl': num_actv_bc_tl,
            'percent_bc_gt_75': percent_bc_gt_75,
            'home_ownership': home_ownership,
            'verification_status': verification_status,
            'delinq_2yrs': delinq_2yrs,
            'inq_last_6mths': inq_last_6mths,
            'pub_rec': pub_rec,
            'mo_sin_old_rev_tl_op': mo_sin_old_rev_tl_op,
            'term': term,
            'purpose': purpose,
            'grade': grade
        }
        
        # Default Risk Prediction Button
        if st.button("🚨 Predict Default Risk", type="primary", use_container_width=True):
            with st.spinner("Analyzing default risk..."):
                result = model_manager.predict_default_risk(user_data)
                
                if "error" in result:
                    st.error(f"Error: {result['error']}")
                else:
                    # Display results
                    st.markdown("### 📊 Default Risk Analysis")
                    
                    # Risk level display
                    if result.get('prediction', 0) == 1:
                        st.error("⚠️ HIGH RISK - Likely to Default")
                    else:
                        st.success("✅ LOW RISK - Unlikely to Default")
                    
                    # Risk metrics
                    col_risk1, col_risk2 = st.columns(2)
                    with col_risk1:
                        risk_score = result.get('risk_score', 0)
                        st.metric("Risk Score", f"{risk_score:.1f}%")
                    with col_risk2:
                        st.metric("Risk Level", result.get('risk_level', 'Unknown'))
                    
                    # Progress bar
                    st.progress(float(risk_score) / 100)
                    
                    # Probabilities
                    st.markdown("**Probability Distribution:**")
                    no_default_prob = result.get('probability_no_default', 0)
                    default_prob = result.get('probability_default', 0)
                    st.write(f"• No Default: {no_default_prob:.2%}")
                    st.write(f"• Default: {default_prob:.2%}")
                    
                    # Recommendation
                    recommendation = result.get('recommendation', 'No recommendation available')
                    if float(risk_score) < 30:
                        st.success(recommendation)
                    elif float(risk_score) < 70:
                        st.warning(recommendation)
                    else:
                        st.error(recommendation)
        
        st.markdown("---")
        
        # Grade Prediction Button
        if st.button("🎯 Predict Credit Grade", type="secondary", use_container_width=True):
            with st.spinner("Analyzing credit grade..."):
                result = model_manager.predict_credit_grade(user_data)
                
                if "error" in result:
                    st.error(f"Error: {result['error']}")
                else:
                    # Display results
                    st.markdown("### 🎯 Credit Grade Prediction")
                    
                    # Grade display
                    predicted_grade = result.get('predicted_grade', 'Unknown')
                    grade_quality = result.get('grade_quality', {})
                    
                    if isinstance(grade_quality, dict):
                        quality_text = grade_quality.get('quality', 'Unknown')
                    else:
                        quality_text = str(grade_quality)
                    
                    if quality_text == 'Excellent':
                        st.success(f"📈 {quality_text} Grade: **{predicted_grade}**")
                    elif quality_text == 'Good':
                        st.success(f"👍 {quality_text} Grade: **{predicted_grade}**")
                    elif quality_text == 'Fair':
                        st.warning(f"📊 {quality_text} Grade: **{predicted_grade}**")
                    else:
                        st.error(f"📉 {quality_text} Grade: **{predicted_grade}**")
                    
                    # Confidence score
                    confidence = result.get('confidence', 0)
                    st.metric("Prediction Confidence", f"{confidence:.1f}%")
                    
                    # Grade probabilities
                    st.markdown("**Grade Probabilities:**")
                    grade_probs = result.get('grade_probabilities', {})
                    if isinstance(grade_probs, dict) and grade_probs:
                        for grade_letter, prob in grade_probs.items():
                            st.write(f"Grade {grade_letter}: {prob:.2%}")
                    else:
                        st.write("Grade probabilities not available")
                    
                    # Recommendation
                    recommendation = result.get('recommendation', 'No recommendation available')
                    if predicted_grade in ['A', 'B']:
                        st.success(recommendation)
                    elif predicted_grade == 'C':
                        st.warning(recommendation)
                    else:
                        st.error(recommendation)
        
        # Sample data buttons
        st.markdown("---")
        st.markdown("### Sample Data Presets")
        
        col_preset1, col_preset2, col_preset3 = st.columns(3)
        
        with col_preset1:
            if st.button("✅ Good Profile", use_container_width=True, help="Low risk borrower"):
                sample_data = create_sample_user_data("good")
                for key, value in sample_data.items():
                    st.session_state[key] = value
                st.success("✅ Good profile loaded!")
                st.rerun()
        
        # with col_preset2:
        #     if st.button("⚠️ Moderate Profile", use_container_width=True, help="Medium risk borrower"):
        #         sample_data = create_sample_user_data("moderate")
        #         for key, value in sample_data.items():
        #             st.session_state[key] = value
        #         st.warning("⚠️ Moderate profile loaded!")
        #         st.rerun()
        
        with col_preset3:
            if st.button("❌ High Risk Profile", use_container_width=True, help="High risk borrower"):
                sample_data = create_sample_user_data("bad")
                for key, value in sample_data.items():
                    st.session_state[key] = value
                st.error("❌ High risk profile loaded!")
                st.rerun()
    
    else:
        st.error("❌ Models not loaded properly. Please check if model files exist in the Model directory.")
        
        # Show model status
        if model_manager:
            st.markdown("**Model Status:**")
            info = model_manager.model_info()
            for key, value in info.items():
                status = "✅" if value else "❌"
                st.write(f"{status} {key.replace('_', ' ').title()}: {value}")

# Sidebar with information
st.sidebar.title("ℹ️ About Credit Nexus")
st.sidebar.markdown("""
This application predicts:
- **Default Risk**: Probability of loan default
- **Credit Grade**: Expected credit grade (A-D)

### Model Features:
- XGBoost Classifier
- Trained on lending club data
- Real-time preprocessing
- Risk assessment

### How to use:
1. **Use presets** or fill in applicant details manually
2. Click prediction buttons
3. Review risk assessment

### 📋 Sample Presets:
- **✅ Good Profile**: Low risk, high income, excellent credit
- **⚠️ Moderate Profile**: Medium risk, average profile  
- **❌ High Risk Profile**: High risk, poor credit history
""")

st.sidebar.markdown("---")
if st.sidebar.button("🔄 Reset All Fields"):
    st.rerun()

st.sidebar.markdown("**Developed with ❤️ using Streamlit**")