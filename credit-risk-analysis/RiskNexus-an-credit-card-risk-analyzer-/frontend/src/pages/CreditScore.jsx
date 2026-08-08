import React from "react";

const CreditScore = () => {
  const WEB_APP_URL = "http://localhost:3009/";

  return (
    <div className="page active" id="credit-score"> 
      <div className="page-header">
        <h1 className="page-title">Credit Score</h1>
        <p className="page-subtitle">Powered by integrated web module</p>
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-credit-card"></i>
          Credit Score Simulator
        </h2>
        <div className="bn-card-head-row" style={{ marginBottom: 12 }}>
          <button
            className="bn-primary-btn"
            onClick={() => window.open(WEB_APP_URL, "_blank", "noopener,noreferrer")}
          >
            Open Simulator in New Tab
          </button>
        </div>
        <div className="muted">The Credit Score Simulator will open in a new tab.</div>
      </div>
    </div>
  );
};

export default CreditScore;
