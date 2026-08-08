# RiskNEXUS 🏦📊
> **Unified Banking Intelligence & Credit Risk Ecosystem**

RiskNEXUS is a next-generation financial intelligence suite designed to bridge consumer credit assessment with institutional-grade banking risk management. Combining **Machine Learning (XGBoost)**, **Generative AI (Google Gemini Pro)**, and **Institutional Risk Modeling (ALM & FTP)**, RiskNEXUS delivers real-time risk assessment, stress testing, and intelligent credit optimization.

---

## 🌟 Key Modules & Capabilities

### 1. 🤖 Predictive Machine Learning Credit Engine (`credit-risk-analysis`)
- **Default Probability Modeling**: Uses **XGBoost** trained on historical credit data to evaluate loan applicants in real-time.
- **Multi-Class Credit Grading**: Classifies applicants into risk brackets with high precision and recall.
- **Explainable AI (XAI)**: Provides feature attribution and explainability for regulatory auditability and compliance.
- **Flask REST API**: Low-latency backend serving model predictions (`credit_risk_model.pkl`).

### 2. 🏦 Institutional Risk & ALM/FTP Suite (`riskguard-alm-ftp-suite`)
- **Asset Liability Management (ALM)**: Interactive liquidity gap analysis, interest rate sensitivity modeling, and duration gap stress testing.
- **Funds Transfer Pricing (FTP)**: Matched-maturity yield curve calculations, cost-of-funds allocation, and Net Interest Margin (NIM) optimization.
- **GenAI Executive Insights**: Powered by **Google Gemini 2.0 Flash / GenAI SDK** for automated scenario analysis and financial reporting.

### 3. 💡 Consumer Credit Simulator & Web Portal (`web`)
- **Interactive Credit Simulator**: Real-time score projection based on financial behaviors (credit utilization, payment history, debt ratio).
- **GenAI Advisory**: Genkit-integrated flows for personalized credit improvement recommendations.
- **Modern Dashboard**: Built with **Next.js**, **React 19**, **Tailwind CSS**, and **Lucide React**.

---

## 🏗️ Repository Architecture

```directory
RiskNEXUS/
├── credit-risk-analysis/       # Core ML pipelines & React/Flask credit risk application
│   └── RiskNexus-an-credit-card-risk-analyzer-/
│       ├── backend/            # Flask API & saved XGBoost models (.pkl)
│       ├── frontend/           # React single-page application for applicant evaluation
│       └── ml_model/           # Jupyter notebooks, feature engineering & training scripts
│
├── riskguard-alm-ftp-suite/    # Institutional ALM & FTP analytics dashboard
│   ├── src/                    # Vite + React + TypeScript suite with Recharts & Framer Motion
│   └── package.json
│
├── web/                        # Consumer Credit Portal & GenAI Financial Simulator
│   ├── src/                    # Next.js App Router with Google GenAI flows
│   └── package.json
│
├── Credit-Nexus-master/        # Python ML analysis & notebooks repository
├── credit-nexus-details.txt    # Project specifications summary
└── README.md                   # System documentation
```

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Machine Learning & AI** | Python 3.9+, XGBoost, Scikit-Learn, Pandas, NumPy, Google Gemini Pro (`@google/genai`), Genkit |
| **Backend Services** | Flask, RESTful APIs, Pickle Model Serialization |
| **Institutional Frontend** | React 19, TypeScript, Vite, Recharts, Lucide Icons, Framer Motion |
| **Consumer Portal** | Next.js 16+, React 19, Tailwind CSS, TypeScript |
| **Deployment & Tools** | Git, NPM, Python venv |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18.0 or higher
- **Python** 3.9 or higher
- **Git**

---

### 1️⃣ Setting Up the Machine Learning & Risk Backend
```bash
cd credit-risk-analysis/RiskNexus-an-credit-card-risk-analyzer-/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install requirements & start Flask API
pip install -r requirements.txt
python app.py
```
*API server will run at `http://localhost:5000`.*

---

### 2️⃣ Setting Up the Institutional ALM & FTP Suite (`riskguard-alm-ftp-suite`)
```bash
cd riskguard-alm-ftp-suite

# Install dependencies
npm install

# Configure Environment Variables (Optional for Gemini GenAI feature)
# Create a .env file with:
# VITE_GEMINI_API_KEY=your_gemini_api_key

# Start Development Server
npm run dev
```
*Access the ALM/FTP Risk Suite at `http://localhost:3000`.*

---

### 3️⃣ Setting Up the Consumer Credit Portal (`web`)
```bash
cd web

# Install dependencies
npm install

# Start Next.js Development Server
npm run dev
```
*Access the Web Application at `http://localhost:3000`.*

---

## 📈 Machine Learning Workflow

1. **Data Preprocessing**: Handling missing values, outlier treatment, and feature scaling (`ml_model/scripts/data_cleaner.py`).
2. **Feature Engineering**: Deriving credit score indicators, debt-to-income metrics, and payment delinquency trends.
3. **Model Training & Evaluation**: Training XGBoost classifier (`ml_model/scripts/train_model.py`) and evaluating performance using Precision-Recall curves, ROC-AUC, and Confusion Matrices.
4. **Model Deployment**: Exporting trained binary artifacts to `backend/saved_model/credit_risk_model.pkl`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open a pull request or submit an issue on GitHub.

---

## 📄 License

This project is licensed under the **Apache License 2.0**.
