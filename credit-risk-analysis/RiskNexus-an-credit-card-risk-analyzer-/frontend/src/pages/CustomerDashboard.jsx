import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // Import Chart.js
import './CustomerDashboard.css';
import './CreditScore';
import CreditScore from './CreditScore';
import EMIScheduler from './EmiSchedular';
// Main App Component

function CustomerDashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [notification, setNotification] = useState(null); // { title, message, type }

  // Function to show a notification
  const showNotification = (title, message, type) => {
    setNotification({ title, message, type });
  };

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle all navigation clicks (sidebar and bottom nav)
  const handleNavClick = (page) => {
    setActivePage(page);
    setIsSidebarActive(false); // Close mobile sidebar on nav
  };

  // Render the correct page based on state
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'Emi':
        return <EMIScheduler />;
      case 'risk-analysis':
        return <RiskAnalysis showNotification={showNotification} />;
      case 'loans':
        return <Loans />;
      case 'credit-score':
        return <CreditScore />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activePage={activePage} 
        onNavClick={handleNavClick} 
        isActive={isSidebarActive} 
      />
      
      <main className="main-content">
        {renderPage()}
      </main>

      <BottomNav 
        activePage={activePage} 
        onNavClick={handleNavClick} 
      />
      
      <MobileMenuToggle 
        onToggle={() => setIsSidebarActive(!isSidebarActive)} 
      />
      
      {notification && (
        <Notification
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

// Sidebar Component
const Sidebar = ({ activePage, onNavClick, isActive }) => {
  const navItems = [
    { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { id: 'Emi', icon: 'fa-tachometer-alt', label: 'EMI Schedular' },
    { id: 'risk-analysis', icon: 'fa-chart-line', label: 'Risk Analysis' },
    { id: 'loans', icon: 'fa-money-bill-wave', label: 'My Loans' },
    { id: 'credit-score', icon: 'fa-credit-card', label: 'Credit Score' },
    { id: 'profile', icon: 'fa-user', label: 'Profile' },
  ];

  return (
    <nav className={`sidebar ${isActive ? 'active' : ''}`} id="sidebar">
      <div className="logo">
        <h1>Credit Nexus</h1>
        <p>Credit Risk Analysis</p>
      </div>
      <ul className="nav-menu">
        {navItems.map(item => (
          <li className="nav-item" key={item.id}>
            <a
              href="#"
              className={`nav-link ${activePage === item.id ? 'active' : ''}`}
              data-page={item.id}
              onClick={(e) => {
                e.preventDefault();
                onNavClick(item.id);
              }}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// BottomNav (Mobile) Component
const BottomNav = ({ activePage, onNavClick }) => {
  const navItems = [
    { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { id: 'risk-analysis', icon: 'fa-chart-line', label: 'Risk' },
    { id: 'loans', icon: 'fa-money-bill-wave', label: 'Loans' },
    { id: 'credit-score', icon: 'fa-credit-card', label: 'Score' },
    { id: 'profile', icon: 'fa-user', label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-list">
        {navItems.map(item => (
          <a
            href="#"
            key={item.id}
            className={`bottom-nav-item ${activePage === item.id ? 'active' : ''}`}
            data-page={item.id}
            onClick={(e) => {
              e.preventDefault();
              onNavClick(item.id);
            }}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

// MobileMenuToggle Component
const MobileMenuToggle = ({ onToggle }) => (
  <button className="mobile-menu-toggle" id="mobile-menu-toggle" onClick={onToggle}>
    <i className="fas fa-bars"></i>
  </button>
);

// Notification Component
const Notification = ({ title, message, type, onClose }) => (
  <div id="notification" className={`notification ${type}`} style={{ display: 'block' }}>
    <span className="close-notification" onClick={onClose}>&times;</span>
    <div className="notification-title" id="notification-title">{title}</div>
    <div className="notification-message" id="notification-message">{message}</div>
  </div>
);

// Dashboard Page Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('score-history');
  const scoreChartRef = useRef(null);

  // Initialize Chart.js
  useEffect(() => {
    let chartInstance = null;
    if (scoreChartRef.current) {
      const ctx = scoreChartRef.current.getContext('2d');
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            label: 'Credit Score',
            data: [720, 725, 730, 735, 742],
            backgroundColor: 'rgba(49, 130, 206, 0.2)',
            borderColor: 'rgba(49, 130, 206, 1)',
            borderWidth: 2,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 700,
              max: 800,
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: 'rgba(255, 255, 255, 0.7)' }
            },
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: 'rgba(255, 255, 255, 0.7)' }
            }
          }
        }
      });
    }
    // Cleanup on component unmount
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="page active" id="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's your credit overview.</p>
      </div>

      <div className="dashboard-grid">
        {/* Stat Cards */}
        <div className="stat-card success">
          <div className="stat-icon"><i className="fas fa-credit-card"></i></div>
          <div className="stat-value">742</div>
          <div className="stat-label">Credit Score</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon"><i className="fas fa-percentage"></i></div>
          <div className="stat-value">28%</div>
          <div className="stat-label">Credit Utilization</div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon"><i className="fas fa-money-bill-wave"></i></div>
          <div className="stat-value">₹8,50,000</div>
          <div className="stat-label">Total Credit Limit</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="stat-value">2</div>
          <div className="stat-label">Recent Inquiries</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2 className="card-title">
          <i className="fas fa-shield-alt"></i>
          Default Risk Predictor
        </h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <button
            className="btn-success"
            onClick={() => window.open("http://localhost:8503/?embedded=1", "_blank", "noopener,noreferrer")}
          >
            Open Predictor
          </button>
        </div>
      </div>
      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-chart-line"></i>
          Credit Health Overview
        </h2>

        {/* Tabs */}
        <div className="tabs">
          <div className={`tab ${activeTab === 'score-history' ? 'active' : ''}`} onClick={() => setActiveTab('score-history')}>Score History</div>
          <div className={`tab ${activeTab === 'factors' ? 'active' : ''}`} onClick={() => setActiveTab('factors')}>Factors</div>
          <div className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>Recommendations</div>
        </div>

        {/* Tab Content: Score History */}
        <div className={`tab-content ${activeTab === 'score-history' ? 'active' : ''}`} id="score-history">
          <div className="chart-container">
            <canvas ref={scoreChartRef}></canvas>
          </div>
        </div>

        {/* Tab Content: Factors */}
        <div className={`tab-content ${activeTab === 'factors' ? 'active' : ''}`} id="factors">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Impact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Payment History</td>
                  <td>High</td>
                  <td><span style={{ color: 'var(--success-color)' }}>Good</span></td>
                </tr>
                <tr>
                  <td>Credit Utilization</td>
                  <td>High</td>
                  <td><span style={{ color: 'var(--warning-color)' }}>Fair</span></td>
                </tr>
                <tr>
                  <td>Credit Age</td>
                  <td>Medium</td>
                  <td><span style={{ color: 'var(--success-color)' }}>Good</span></td>
                </tr>
                <tr>
                  <td>Credit Mix</td>
                  <td>Medium</td>
                  <td><span style={{ color: 'var(--warning-color)' }}>Fair</span></td>
                </tr>
                <tr>
                  <td>Recent Inquiries</td>
                  <td>Low</td>
                  <td><span style={{ color: 'var(--success-color)' }}>Good</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tab Content: Recommendations */}
        <div className={`tab-content ${activeTab === 'recommendations' ? 'active' : ''}`} id="recommendations">
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>Reduce Credit Utilization</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Your credit utilization is 28%, which is above the recommended 20%. Try to pay down some of your credit card balances to improve this factor.</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>Diversify Credit Types</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Consider adding an installment loan to your credit mix to show lenders you can handle different types of credit responsibly.</p>
            </div>
            <div>
              <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>Limit New Credit Applications</h3>
              <p style={{ color: 'var(--text-secondary)' }}>You've had 2 recent credit inquiries. Try to limit new applications to avoid further impacts on your score.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Risk Analysis Page Component
const RiskAnalysis = ({ showNotification }) => {
  const [formData, setFormData] = useState({
    annualIncome: '1200000',
    loanAmount: '500000',
    debtToIncome: '20',
    creditScore: '720',
    employmentYears: '5',
    loanPurpose: 'debt_consolidation'
  });

  const [defaultRisk, setDefaultRisk] = useState(null);
  const [creditGrade, setCreditGrade] = useState(null);

  const presets = {
    good: { annualIncome: 1800000, loanAmount: 500000, debtToIncome: 15, creditScore: 750, employmentYears: 8, loanPurpose: 'home_loan' },
    moderate: { annualIncome: 900000, loanAmount: 700000, debtToIncome: 30, creditScore: 680, employmentYears: 3, loanPurpose: 'personal_loan' },
    high: { annualIncome: 400000, loanAmount: 600000, debtToIncome: 36.8, creditScore: 580, employmentYears: 1, loanPurpose: 'other' }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const loadPreset = (type) => {
    setFormData(presets[type]);
    showNotification('Preset Loaded', `${type.charAt(0).toUpperCase() + type.slice(1)} risk profile has been loaded.`, 'success');
  };

  const predictDefaultRisk = () => {
    const { annualIncome, loanAmount, debtToIncome, creditScore, employmentYears } = formData;
    const [ai, la, dti, cs, ey] = [parseFloat(annualIncome), parseFloat(loanAmount), parseFloat(debtToIncome), parseFloat(creditScore), parseFloat(employmentYears)];

    let riskScore = 0;
    if (cs >= 750) riskScore -= 30;
    else if (cs >= 700) riskScore -= 20;
    else if (cs >= 650) riskScore -= 10;
    else if (cs >= 600) riskScore += 10;
    else riskScore += 30;

    if (dti < 10) riskScore -= 20;
    else if (dti < 20) riskScore -= 10;
    else if (dti < 30) riskScore += 10;
    else riskScore += 20;

    const loanToIncomeRatio = (la / ai) * 100;
    if (loanToIncomeRatio < 10) riskScore -= 15;
    else if (loanToIncomeRatio < 20) riskScore -= 5;
    else if (loanToIncomeRatio < 30) riskScore += 10;
    else riskScore += 25;

    if (ey > 5) riskScore -= 10;
    else if (ey > 2) riskScore -= 5;
    else if (ey > 0) riskScore += 5;
    else riskScore += 15;

    riskScore = Math.max(0, Math.min(100, 50 + riskScore));
    let riskLevel, message, color;

    if (riskScore < 20) {
      riskLevel = "VERY LOW RISK";
      message = "Excellent candidate - Approve with standard terms";
      color = 'var(--success-color)';
    } else if (riskScore < 40) {
      riskLevel = "LOW RISK - Unlikely to Default";
      message = "Good candidate - Approve with standard terms";
      color = 'var(--success-color)';
    } else if (riskScore < 60) {
      riskLevel = "MODERATE RISK";
      message = "Acceptable risk - Approve with standard terms";
      color = 'var(--warning-color)';
    } else if (riskScore < 80) {
      riskLevel = "HIGH RISK - Likely to Default";
      message = "Higher risk candidate - Consider higher interest rate";
      color = 'var(--danger-color)';
    } else {
      riskLevel = "VERY HIGH RISK - Very Likely to Default";
      message = "High risk candidate - Consider declining application";
      color = 'var(--danger-color)';
    }

    setDefaultRisk({ riskScore, riskLevel, message, color });
    setCreditGrade(null);
  };
  
  const predictCreditGrade = () => {
    const { annualIncome, loanAmount, debtToIncome, creditScore, employmentYears } = formData;
    const [ai, la, dti, cs, ey] = [parseFloat(annualIncome), parseFloat(loanAmount), parseFloat(debtToIncome), parseFloat(creditScore), parseFloat(employmentYears)];

    let gradeA = 0, gradeB = 0, gradeC = 0, gradeD = 0, gradeE = 0;

    if (cs >= 750) { gradeA = 70; gradeB = 20; gradeC = 7; gradeD = 2; gradeE = 1; }
    else if (cs >= 700) { gradeA = 30; gradeB = 50; gradeC = 15; gradeD = 4; gradeE = 1; }
    else if (cs >= 650) { gradeA = 10; gradeB = 30; gradeC = 40; gradeD = 15; gradeE = 5; }
    else if (cs >= 600) { gradeA = 2; gradeB = 10; gradeC = 30; gradeD = 40; gradeE = 18; }
    else { gradeA = 0; gradeB = 2; gradeC = 10; gradeD = 30; gradeE = 58; }

    const loanToIncomeRatio = (la / ai) * 100;

    if (dti > 30) { gradeA = Math.max(0, gradeA - 10); gradeB = Math.max(0, gradeB - 5); gradeC += 5; gradeD += 7; gradeE += 3; }
    if (loanToIncomeRatio > 30) { gradeA = Math.max(0, gradeA - 15); gradeB = Math.max(0, gradeB - 10); gradeC += 5; gradeD += 15; gradeE += 5; }
    if (ey < 2) { gradeA = Math.max(0, gradeA - 10); gradeB = Math.max(0, gradeB - 5); gradeC += 5; gradeD += 7; gradeE += 3; }

    const total = gradeA + gradeB + gradeC + gradeD + gradeE;
    const grades = {
      A: (gradeA / total) * 100,
      B: (gradeB / total) * 100,
      C: (gradeC / total) * 100,
      D: (gradeD / total) * 100,
      E: (gradeE / total) * 100,
    };
    
    const gradeEntries = Object.entries(grades).map(([grade, probability]) => ({ grade, probability }));
    gradeEntries.sort((a, b) => b.probability - a.probability);
    const highestGrade = gradeEntries[0];

    let message;
    if (highestGrade.grade === 'A') message = "Excellent credit grade - Prime borrower - Offer best rates";
    else if (highestGrade.grade === 'B') message = "Good credit grade - Near prime borrower - Offer competitive rates";
    else if (highestGrade.grade === 'C') message = "Average credit grade - Consider standard to slightly higher rates";
    else if (highestGrade.grade === 'D') message = "Below average credit grade - Subprime borrower - Offer higher rates";
    else message = "Poor credit grade - High risk borrower - Consider declining or very high rates";

    setCreditGrade({ grades, highestGrade, message });
    setDefaultRisk(null);
  };

  return (
    <div className="page active" id="risk-analysis">
      <div className="page-header">
        <h1 className="page-title">Risk Analysis</h1>
        <p className="page-subtitle">Analyze credit risk for new applications</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title"><i className="fas fa-user-edit"></i> Applicant Information</h2>
          
          <div className="form-group">
            <label htmlFor="annual-income">Annual Income (₹)</label>
            <div className="currency">
              <input type="number" id="annual-income" value={formData.annualIncome} onChange={handleChange} min="0" />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="loan-amount">Loan Amount (₹)</label>
            <div className="currency">
              <input type="number" id="loan-amount" value={formData.loanAmount} onChange={handleChange} min="0" />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="debt-to-income">Debt-to-Income Ratio (%)</label>
            <input type="number" id="debt-to-income" value={formData.debtToIncome} onChange={handleChange} min="0" max="100" step="0.1" />
          </div>
          
          <div className="form-group">
            <label htmlFor="credit-score">Credit Score</label>
            <input type="number" id="credit-score" value={formData.creditScore} onChange={handleChange} min="300" max="900" />
          </div>
          
          <div className="form-group">
            <label htmlFor="employment-years">Years of Employment</label>
            <input type="number" id="employment-years" value={formData.employmentYears} onChange={handleChange} min="0" />
          </div>
          
          <div className="form-group">
            <label htmlFor="loan-purpose">Loan Purpose</label>
            <select id="loan-purpose" value={formData.loanPurpose} onChange={handleChange}>
              <option value="debt_consolidation">Debt Consolidation</option>
              <option value="home_loan">Home Loan</option>
              <option value="personal_loan">Personal Loan</option>
              <option value="vehicle_loan">Vehicle Loan</option>
              <option value="education_loan">Education Loan</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <h3 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>Sample Data Presets</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
            <button className="btn-success" onClick={() => loadPreset('good')}>Good Risk Profile</button>
            <button className="btn-secondary" onClick={() => loadPreset('moderate')}>Moderate Risk Profile</button>
            <button className="btn-danger" onClick={() => loadPreset('high')}>High Risk Profile</button>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title"><i className="fas fa-chart-pie"></i> Predictions</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <button id="predict-default-btn" onClick={predictDefaultRisk}>Predict Default Risk</button>
            <button id="predict-grade-btn" onClick={predictCreditGrade} style={{ marginLeft: '10px' }}>Predict Credit Grade</button>
          </div>
          
          {/* Default Risk Prediction Result */}
          {defaultRisk && (
            <div id="default-risk-result" className="prediction-result" style={{ display: 'block' }}>
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: 'var(--text-primary)' }}>Default Risk Analysis</h3>
                <div className="risk-meter">
                  <div className="risk-meter-fill" style={{ width: `${defaultRisk.riskScore}%`, backgroundColor: defaultRisk.color }}>
                    <div className="risk-meter-label">{defaultRisk.riskScore.toFixed(1)}%</div>
                  </div>
                </div>
                <div id="risk-level" style={{ marginTop: '10px', fontWeight: 500, color: 'var(--text-primary)' }}>{defaultRisk.riskLevel}</div>
                <div id="risk-message" style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>{defaultRisk.message}</div>
              </div>
              <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>No Default</span>
                  <span>{(100 - defaultRisk.riskScore).toFixed(1)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Default</span>
                  <span>{defaultRisk.riskScore.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Credit Grade Prediction Result */}
          {creditGrade && (
            <div id="credit-grade-result" className="prediction-result" style={{ display: 'block' }}>
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: 'var(--text-primary)' }}>Credit Grade Prediction</h3>
                <div style={{ fontSize: '24px', fontWeight: 700, margin: '10px 0', color: 'var(--text-primary)' }} id="grade-score">
                  Grade {creditGrade.highestGrade.grade} ({creditGrade.highestGrade.probability.toFixed(1)}%)
                </div>
              </div>
              
              <div className="chart-container">
                <div className="bar" style={{ left: '0%', height: `${creditGrade.grades.A * 1.5}px`, backgroundColor: '#38a169' }}>
                  <span>{creditGrade.grades.A.toFixed(1)}%</span>
                  <div className="bar-label">Grade A</div>
                </div>
                <div className="bar" style={{ left: '20%', height: `${creditGrade.grades.B * 1.5}px`, backgroundColor: '#4299e1' }}>
                  <span>{creditGrade.grades.B.toFixed(1)}%</span>
                  <div className="bar-label">Grade B</div>
                </div>
                <div className="bar" style={{ left: '40%', height: `${creditGrade.grades.C * 1.5}px`, backgroundColor: '#d69e2e' }}>
                  <span>{creditGrade.grades.C.toFixed(1)}%</span>
                  <div className="bar-label">Grade C</div>
                </div>
                <div className="bar" style={{ left: '60%', height: `${creditGrade.grades.D * 1.5}px`, backgroundColor: '#dd6b20' }}>
                  <span>{creditGrade.grades.D.toFixed(1)}%</span>
                  <div className="bar-label">Grade D</div>
                </div>
                <div className="bar" style={{ left: '80%', height: `${creditGrade.grades.E * 1.5}px`, backgroundColor: '#e53e3e' }}>
                  <span>{creditGrade.grades.E.toFixed(1)}%</span>
                  <div className="bar-label">Grade E</div>
                </div>
              </div>
              
              <div id="grade-message" style={{ marginTop: '15px', color: 'var(--text-secondary)' }}>{creditGrade.message}</div>
            </div>
          )}
        </div>
        
        <div className="card">
          <h2 className="card-title"><i className="fas fa-shield-alt"></i> Default Risk Predictor</h2>
          <div style={{ position: "relative", height: "70vh", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
            <iframe
              src={"http://localhost:8502/?embedded=1"}
              title="Default Risk Predictor"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                backgroundColor: "transparent"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// My Loans Page Component
const Loans = () => (
  <div className="page active" id="loans">
    <div className="page-header">
      <h1 className="page-title">My Loans</h1>
      <p className="page-subtitle">Manage your existing loans and credit accounts</p>
    </div>
    
    <div className="card">
      <h2 className="card-title"><i className="fas fa-home"></i> Home Loan</h2>
      <div className="loan-card">
        <div className="loan-info">
          <div className="loan-type">Primary Residence Mortgage</div>
          <div className="loan-details">Interest Rate: 8.5% | Monthly Payment: ₹45,000</div>
        </div>
        <div className="loan-amount">₹85,00,000</div>
      </div>
      <div className="loan-card">
        <div className="loan-info">
          <div className="loan-type">Home Equity Line of Credit</div>
          <div className="loan-details">Interest Rate: 10.5% | Available: ₹10,00,000</div>
        </div>
        <div className="loan-amount">₹25,00,000</div>
      </div>
    </div>
    
    <div className="card">
      <h2 className="card-title"><i className="fas fa-credit-card"></i> Credit Cards</h2>
      <div className="loan-card">
        <div className="loan-info">
          <div className="loan-type">Platinum Rewards Card</div>
          <div className="loan-details">Interest Rate: 18.9% | Balance: ₹75,000</div>
        </div>
        <div className="loan-amount">₹3,50,000</div>
      </div>
      <div className="loan-card">
        <div className="loan-info">
          <div className="loan-type">Cash Back Card</div>
          <div className="loan-details">Interest Rate: 21.9% | Balance: ₹25,000</div>
        </div>
        <div className="loan-amount">₹1,75,000</div>
      </div>
    </div>
    
    <div className="card">
      <h2 className="card-title"><i className="fas fa-car"></i> Vehicle Loan</h2>
      <div className="loan-card">
        <div className="loan-info">
          <div className="loan-type">2020 Maruti Suzuki Swift</div>
          <div className="loan-details">Interest Rate: 9.5% | Monthly Payment: ₹12,500</div>
        </div>
        <div className="loan-amount">₹5,50,000</div>
      </div>
    </div>
    
    <div className="card">
      <h2 className="card-title"><i className="fas fa-graduation-cap"></i> Education Loan</h2>
      <div className="loan-card">
        <div className="loan-info">
          <div className="loan-type">Higher Education Loan</div>
          <div className="loan-details">Interest Rate: 11.5% | Monthly Payment: ₹8,500</div>
        </div>
        <div className="loan-amount">₹12,00,000</div>
      </div>
    </div>
    
    <div className="card">
      <h2 className="card-title"><i className="fas fa-briefcase"></i> Personal Loan</h2>
      <div className="loan-card">
        <div className="loan-info">
          <div className="loan-type">Emergency Personal Loan</div>
          <div className="loan-details">Interest Rate: 14.5% | Monthly Payment: ₹6,000</div>
        </div>
        <div className="loan-amount">₹3,00,000</div>
      </div>
    </div>
  </div>
);
// Profile Page Component
const Profile = () => {
  const [profileData, setProfileData] = useState({
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 98765 43210',
    address: '123, MG Road, Bangalore, Karnataka 560001',
    pan: 'ABCDE1234F',
    aadhaar: 'XXXX-XXXX-1234'
  });

  const [notifications, setNotifications] = useState({
    scoreUpdates: true,
    accountAlerts: true,
    marketingOffers: false,
    monthlyReports: true,
  });

  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handleNotificationChange = (e) => {
    const { id, checked } = e.target;
    setNotifications(prev => ({ ...prev, [id]: checked }));
  };

  return (
    <div className="page active" id="profile">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>
      
      <div className="card">
        <h2 className="card-title"><i className="fas fa-user"></i> Personal Information</h2>
        
        <div className="profile-header">
          <div className="profile-avatar"><i className="fas fa-user"></i></div>
          <div className="profile-info">
            <h2>{profileData.fullName}</h2>
            <p>Premium Member since 2019</p>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input type="text" id="fullName" value={profileData.fullName} onChange={handleProfileChange} />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={profileData.email} onChange={handleProfileChange} />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input type="tel" id="phone" value={profileData.phone} onChange={handleProfileChange} />
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea id="address" rows="3" value={profileData.address} onChange={handleProfileChange}></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="pan">PAN Card</label>
          <input type="text" id="pan" value={profileData.pan} onChange={handleProfileChange} maxLength="10" />
        </div>
        
        <div className="form-group">
          <label htmlFor="aadhaar">Aadhaar Number</label>
          <input type="text" id="aadhaar" value={profileData.aadhaar} onChange={handleProfileChange} maxLength="14" />
        </div>
        
        <button>Save Changes</button>
      </div>
      
      <div className="card">
        <h2 className="card-title"><i className="fas fa-bell"></i> Notification Settings</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" id="scoreUpdates" checked={notifications.scoreUpdates} onChange={handleNotificationChange} style={{ marginRight: '10px' }} />
            <span>Credit Score Updates</span>
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" id="accountAlerts" checked={notifications.accountAlerts} onChange={handleNotificationChange} style={{ marginRight: '10px' }} />
            <span>Account Alerts</span>
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" id="marketingOffers" checked={notifications.marketingOffers} onChange={handleNotificationChange} style={{ marginRight: '10px' }} />
            <span>Marketing Offers</span>
          </label>
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" id="monthlyReports" checked={notifications.monthlyReports} onChange={handleNotificationChange} style={{ marginRight: '10px' }} />
            <span>Monthly Reports</span>
          </label>
        </div>
      </div>
      
      <div className="card">
        <h2 className="card-title"><i className="fas fa-shield-alt"></i> Security</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>Password</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>Last changed: March 12, 2023</p>
          <button className="btn-secondary">Change Password</button>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>Two-Factor Authentication</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>Add an extra layer of security to your account</p>
          <button className="btn-secondary">Enable 2FA</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
