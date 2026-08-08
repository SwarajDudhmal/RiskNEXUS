# RiskNexus-an-credit-card-risk-analyzer-

The system evaluates loan applicants in real-time using a machine learning model, stores decisions for auditing, and provides explainability for regulatory compliance.

### Project Workflow

1.  **Data Collection and Preprocessing:**
    *   **Raw Data:** Initial data is sourced from `ml_model/data/raw/loan_data.csv`.
    *   **Data Cleaning:** The `ml_model/scripts/data_cleaner.py` script is used to handle missing values, correct data types, and remove inconsistencies.
    *   **Preprocessing:** The `ml_model/data/processed/Preprocessing.ipynb` notebook is used for scaling, encoding categorical variables, and preparing the data for modeling.
    *   **Feature Engineering:** New features are created and selected in `ml_model/notebooks/feature_engineering.ipynb` to improve model performance.

2.  **Credit Score Modeling:**
    *   **Credit Score Analysis:** The `ml_model/notebooks/credit-score.ipynb` notebook is used to analyze credit scoring data and develop a credit score model.
    *   **Personalized Recommendations:** The `frontend/src/components/credit-score/PersonalizedRecommendations.jsx` component provides users with tailored advice based on their credit score.

3.  **Model Training and Evaluation:**
    *   **Model Training:** The `ml_model/scripts/train_model.py` script trains the machine learning model on the preprocessed data.
    *   **Evaluation:** The model's performance is evaluated in `ml_model/notebooks/modelTraining_and_evaluation.ipynb` using metrics like accuracy, precision, and recall.
    *   **Saved Model:** The trained model is saved as `credit_risk_model.pkl` in the `backend/saved_model/` directory.

4.  **Backend Development:**
    *   **API and Routing:** A Flask API (defined in `backend/app.py`) serves the model, with routes specified in `backend/api/routes.py`.
    *   **Prediction Service:** The `backend/services/prediction_services.py` service loads the trained model and makes real-time predictions.
    *   **Middleware:** `backend/api/middleware.py` is used to handle request/response logging and other cross-cutting concerns.

5.  **Frontend Development:**
    *   **UI Components:** The user interface is built with React, with components for authentication (`frontend/src/components/auth/`), credit score display (`frontend/src/components/credit-score/`), and data visualization (`frontend/src/components/dashboard/`).
    *   **Application Logic:** The main application logic resides in `frontend/src/App.jsx`, which integrates all the components and pages.
    *   **State Management:** `frontend/src/contexts/AuthContext.js` manages user authentication state across the application.

6.  **Integration and Deployment:**
    *   **Full-Stack Integration:** The React frontend is connected to the Flask backend to create a seamless user experience.
    *   **Deployment:** The application is deployed, allowing users to get credit risk predictions and credit score analysis.

