# Credit Nexus - Credit Risk Analysis Streamlit App

A comprehensive credit risk analysis application built with Streamlit that predicts loan default probability and credit grades using machine learning models.

## 🚀 Features

-   **Default Risk Prediction**: Predict probability of loan default
-   **Credit Grade Prediction**: Assign credit grades (A-D) to loan applicants
-   **Interactive Web Interface**: User-friendly Streamlit dashboard
-   **Real-time Processing**: Instant predictions with preprocessing pipeline
-   **Comprehensive Analysis**: Risk assessment with recommendations

## 📋 Requirements

-   Python 3.8+
-   Required packages (install via requirements.txt)
-   Pre-trained models (xgb_default_model.pkl, xgb_grade_model.pkl)
-   Scaler (scaler.pkl)

## 🛠️ Installation`​`

1.  **Clone or download** this repository
2.  **Install dependencies**:
    
    ```bash
    pip install -r requirements.txt
    ```
    
3.  **Ensure model files** are in the `Model/` directory:
    -   `xgb_default_model.pkl`
    -   `xgb_grade_model.pkl`
    -   `scaler.pkl`

## 🧪 Testing

Before running the app, test if everything works correctly:

```bash
python test_app.py
```

This will verify:

-   Model loading
-   Preprocessing pipeline
-   Prediction functionality
-   Data validation

## 🚀 Running the App

### Option 1: Using Streamlit directly

```bash
streamlit run streamlit_app.py
```

### Option 2: Using the launch script

```bash
python launch.py
```

The app will open in your default browser at `http://localhost:8501`

## 📊 Usage

### Input Features

The app accepts the following input parameters:

**Financial Information:**

-   Annual Income
-   Loan Amount
-   Debt-to-Income Ratio
-   Revolving Utilization Rate
-   Revolving Balance
-   Bank Card Utilization
-   Open Accounts
-   Total Accounts
-   Active Bank Card Accounts
-   Percentage of Bank Cards >75% Utilization

**Personal & Credit History:**

-   Home Ownership (MORTGAGE, RENT, OWN, OTHER)
-   Verification Status (Not Verified, Verified, Source Verified)
-   Delinquencies in Past 2 Years
-   Inquiries in Past 6 Months
-   Public Records
-   Months Since Oldest Revolving Account

**Loan Details:**

-   Loan Term (36 or 60 months)
-   Loan Purpose
-   Initial Credit Grade (optional)

### Predictions

1.  **Default Risk Prediction**:
    
    -   Click "🚨 Predict Default Risk"
    -   View risk score, level, and recommendation
    -   See probability distribution
2.  **Credit Grade Prediction**:
    
    -   Click "🎯 Predict Credit Grade"
    -   View predicted grade (A-D)
    -   See confidence score and grade probabilities
    -   Get lending recommendations

## 🏗️ Architecture

### Files Structure

```
├── streamlit_app.py          # Main Streamlit application├── model_utils.py            # Model management and predictions├── preprocessing_pipeline.py # Data preprocessing classes├── test_app.py              # Test suite├── launch.py                # Launch script├── requirements.txt         # Python dependencies├── README.md               # This file└── Model/                  # Model files directory    ├── xgb_default_model.pkl    ├── xgb_grade_model.pkl    └── scaler.pkl
```

### Classes

**ModelManager**: Handles model loading and predictions

-   `predict_default_risk()`: Predicts loan default probability
-   `predict_credit_grade()`: Predicts credit grade
-   `batch_predict()`: Batch predictions for multiple users

**CreditRiskPreprocessor**: Handles data preprocessing

-   Feature scaling and normalization
-   Categorical variable encoding
-   Data validation

**UserDataProcessor**: Manages user input data

-   Data validation and storage
-   Export functions for model input
-   Data summary generation

## 🔧 Customization

### Adding New Features

1.  Update the preprocessing pipeline in `preprocessing_pipeline.py`
2.  Modify the Streamlit interface in `streamlit_app.py`
3.  Update the feature list in the preprocessor

### Model Updates

1.  Replace model files in the `Model/` directory
2.  Update the scaler if preprocessing changes
3.  Test with `python test_app.py`

## 📝 Model Information

The application uses XGBoost classifiers trained on lending club data:

-   **Default Model**: Binary classification (default/no default)
-   **Grade Model**: Multi-class classification (grades A-D)
-   **Preprocessing**: StandardScaler for numeric features, one-hot encoding for categorical

### Feature Engineering

-   Grade mapping: A=0, B=1, C=2, D=3 (E,F,G mapped to 3)
-   Term mapping: 36 months=0, 60 months=1
-   Verification mapping: Not Verified=0, Verified=1, Source Verified=2
-   One-hot encoding for home ownership and loan purpose

## 🚨 Troubleshooting

### Common Issues

1.  **Models not loading**:
    
    -   Check if model files exist in `Model/` directory
    -   Verify file permissions
    -   Run `python test_app.py` to diagnose
2.  **Preprocessing errors**:
    
    -   Ensure all required input fields are provided
    -   Check data types and ranges
    -   Verify scaler compatibility
3.  **Streamlit issues**:
    
    -   Update Streamlit: `pip install --upgrade streamlit`
    -   Clear cache: Delete `.streamlit` folder
    -   Check port availability (default: 8501)

### Error Messages

-   "Models not loaded properly": Check model files in Model/ directory
-   "Error in prediction": Check input data validation
-   "Preprocessing error": Verify feature compatibility

## 📈 Performance

-   **Prediction Time**: < 1 second per prediction
-   **Memory Usage**: ~500MB with loaded models
-   **Scalability**: Single-user interface (can be extended for multi-user)

## 🤝 Contributing

1.  Fork the repository
2.  Create a feature branch
3.  Make changes and test thoroughly
4.  Submit a pull request

## 📄 License

This project is for educational and research purposes. Please ensure compliance with your organization's policies when using with real financial data.

## 👥 Support

For issues and questions:

1.  Run the test suite: `python test_app.py`
2.  Check the troubleshooting section
3.  Review error messages and logs

---

**Built with ❤️ using Streamlit, XGBoost, and scikit-learn**