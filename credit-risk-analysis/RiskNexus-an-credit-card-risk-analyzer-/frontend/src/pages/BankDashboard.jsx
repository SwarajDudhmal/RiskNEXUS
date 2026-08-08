import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  FileText,
  Shield,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  Settings,
  Bell,
  User,
  LogOut,
  Eye,
  Target,
  Activity,
  CreditCard,
  Building
} from 'lucide-react';
import './BankDashboard.css';
import './BankApplicationForm';
import './Application'
import Application from './Application';

const BankDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  const portfolioData = {
    totalCustomers: 15847,
    totalLoans: 42350000,
    defaultRate: 2.3,
    riskScore: 7.2,
    newApplications: 234,
    approvalRate: 67.8
  };

  const riskDistribution = [
    { category: 'Low Risk', count: 8450, percentage: 53.3, color: '#22c55e' },
    { category: 'Medium Risk', count: 5890, percentage: 37.2, color: '#f59e0b' },
    { category: 'High Risk', count: 1507, percentage: 9.5, color: '#ef4444' }
  ];

  const recentApplications = [
    { id: 1, name: 'Ramesh Jadhav', amount: 250000, riskScore: 740, status: 'pending', type: 'Home Loan', date: '2024-09-20' },
    { id: 2, name: 'Hritik Chen', amount: 35000, riskScore: 680, status: 'approved', type: 'Car Loan', date: '2024-09-20' },
    { id: 3, name: 'David Gade', amount: 15000, riskScore: 620, status: 'review', type: 'Personal Loan', date: '2024-09-19' },
    { id: 4, name: 'Shaikh Wilson', amount: 450000, riskScore: 580, status: 'rejected', type: 'Home Loan', date: '2024-09-19' }
  ];

  const alerts = [
    { id: 1, type: 'high-risk', message: 'Portfolio risk threshold exceeded in Region 3', time: '2 hours ago' },
    { id: 2, type: 'model', message: 'Credit model accuracy dropped below 85%', time: '5 hours ago' },
    { id: 3, type: 'compliance', message: 'Monthly regulatory report due in 2 days', time: '1 day ago' }
  ];

 
  const Sidebar = () => (
    <aside className="bn-sidebar">
      <div className="bn-sidebar-top">
        <div className="bn-brand">
          <div className="bn-brand-icon"><Building size={18} /></div>
          <div>
            <div className="bn-brand-title">SBI</div>
            <div className="bn-brand-sub">Risk Management</div>
          </div>
        </div>
      </div>

      <nav className="bn-nav">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'portfolio', label: 'Portfolio', icon: PieChart },
          { id: 'applications', label: 'Applications', icon: FileText },
          { id: 'risk-analysis', label: 'Risk Analysis', icon: Shield },
          { id: 'alm-ftp', label: 'ALM & FTP', icon: Activity },
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'reports', label: 'Reports', icon: TrendingUp },
          // { id: 'models', label: 'ML Models', icon: Target }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'risk-analysis') {
                window.open("http://localhost:8505/?embedded=1", "_blank", "noopener,noreferrer");
              } else if (item.id === 'alm-ftp') {
                window.open("http://localhost:3000/", "_blank", "noopener,noreferrer");
              } else {
                setActiveTab(item.id);
              }
            }}
            className={`bn-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.icon className="bn-icon" size={18} />
            <span className="bn-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="bn-sidebar-bottom">
        <button className="bn-footer-btn">
          <Settings size={16} />
          <span>Settings</span>
        </button>
        <button className="bn-footer-btn logout">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  /* Metric card — same props & behavior, styled via CSS */
  const MetricCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <div className="bn-card metric">
      <div className="bn-card-head">
        <div className={`bn-card-icon ${color}`}><Icon size={16} /></div>
        {change && <div className={`bn-pill ${changeType === 'positive' ? 'positive' : 'negative'}`}>{changeType === 'positive' ? '+' : ''}{change}</div>}
      </div>
      <div className="bn-card-body">
        <div className="bn-value">{value}</div>
        <div className="bn-title">{title}</div>
      </div>
    </div>
  );

  /* RiskGauge reused, only styles differ */
  const RiskGauge = ({ score, maxScore = 10 }) => {
    const percentage = (score / maxScore) * 100;
    let color = '#22c55e';
    if (score >= 7) color = '#ef4444';
    else if (score >= 4) color = '#f59e0b';
    
    return (
      <div className="bn-gauge">
        <svg viewBox="0 0 100 100" className="bn-gauge-svg">
          <circle cx="50" cy="50" r="40" stroke="#2b3746" strokeWidth="8" fill="transparent" />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${percentage * 2.51} 251`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="bn-gauge-center">
          <div className="bn-gauge-score">{score}</div>
          <div className="bn-gauge-label">Risk</div>
        </div>
      </div>
    );
  };

  /* Overview tab (keeps same layout & data) */
  const OverviewTab = () => (
    <div className="bn-content">
       <div className="bn-content-header">
        {/* <h2 className="bn-section-title">Portfolio Overview</h2> */}
        {/* <div className="bn-timeframe">
          {['7d','30d','90d','1y'].map(p => (
            <button
              key={p}
              onClick={() => setSelectedTimeframe(p)}
              className={`bn-tf ${selectedTimeframe === p ? 'active' : ''}`}
            >{p}</button>
          ))}
        </div> */}
      </div> 

      <div className="bn-grid metrics">
        <MetricCard title="Total Customers" value={portfolioData.totalCustomers.toLocaleString()} change="12%" changeType="positive" icon={Users} color="blue" />
        <MetricCard title="Total Loans" value={`$${(portfolioData.totalLoans / 1000000).toFixed(1)}M`} change="8.3%" changeType="positive" icon={DollarSign} color="green" />
        <MetricCard title="Default Rate" value={`${portfolioData.defaultRate}%`} change="0.3%" changeType="negative" icon={AlertTriangle} color="red" />
        <MetricCard title="Approval Rate" value={`${portfolioData.approvalRate}%`} change="4.2%" changeType="positive" icon={CheckCircle} color="indigo" />
      </div>

      <div className="bn-grid halves">
        <div className="bn-card">
          <div className="bn-card-head-row">
            <div className="bn-section-title-sm">Risk Distribution</div>
          </div>
          <div className="bn-risk-list">
            {riskDistribution.map(r => (
              <div key={r.category} className="bn-risk-row">
                <div className="bn-risk-left">
                  <span className="bn-risk-dot" style={{background:r.color}} />
                  <span>{r.category}</span>
                </div>
                <div className="bn-risk-right">
                  <div className="bn-risk-count">{r.count.toLocaleString()}</div>
                  <div className="bn-risk-pct">{r.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bn-card center">
          <div className="bn-section-title-sm">Portfolio Health</div>
          <div className="bn-gauge-wrap"><RiskGauge score={portfolioData.riskScore} /></div>
          <div className="bn-center-text">
            <div className="bn-subtle">Overall Risk Score</div>
            <div className="bn-strong">{portfolioData.riskScore}/10</div>
            <div className="bn-warning">Medium Risk</div>
          </div>
        </div>
      </div>

      <div className="bn-grid halves">
        <div className="bn-card">
          <div className="bn-card-head-row">
            <div className="bn-section-title-sm">Recent Applications</div>
            <button className="bn-link">View All</button>
          </div>
          <div className="bn-list">
            {recentApplications.map(app => (
              <div key={app.id} className="bn-list-row">
                <div>
                  <div className="bn-name">{app.name}</div>
                  <div className="bn-subsmall">${app.amount.toLocaleString()} • {app.type}</div>
                  <div className="bn-subtiny">Score: {app.riskScore}</div>
                </div>
                <div className="bn-right-col">
                  <div className={`bn-status ${app.status}`}>{app.status}</div>
                  <div className="bn-subtiny">{app.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bn-card">
          <div className="bn-card-head-row">
            <div className="bn-section-title-sm">System Alerts</div>
            <div className="bn-pill red">{alerts.length} Active</div>
          </div>
          <div className="bn-list">
            {alerts.map(alert => (
              <div key={alert.id} className="bn-alert-row">
                <div className={`bn-alert-dot ${alert.type}`} />
                <div className="bn-alert-body">
                  <div className="bn-name">{alert.message}</div>
                  <div className="bn-subtiny">{alert.time}</div>
                </div>
                <button className="bn-icon-btn"><XCircle size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bn-card">
        <div className="bn-card-head-row">
          <div className="bn-section-title-sm">Portfolio Performance</div>
          <div className="bn-btn-group">
            <button className="bn-small-btn active">Default Rate</button>
            <button className="bn-small-btn">Loan Volume</button>
            <button className="bn-small-btn">Risk Score</button>
          </div>
        </div>
        <div className="bn-chart-placeholder">
          <Activity size={36} />
          <div className="bn-subsmall">Performance Chart — interactive chart goes here</div>
        </div>
      </div>
    </div>
  );

  /* Applications tab */
  // const ApplicationsTab = () => (
  //   <div className="bn-content">
  //     <div className="bn-content-header">
  //       <h2 className="bn-section-title">Loan Applications</h2>
  //       <button 
  //         className="bn-primary-btn" 
  //         onClick={() => setIsFormOpen(true)} 
  //       > New Application
  //       </button> 
  //     </div>

  //     {isFormOpen && (
  //       <div className="modal-overlay">
  //         <div className="modal-content">
  //           {/* Close button inside the modal area */}
  //           <button className="close-btn" onClick={() => setIsFormOpen(false)}>×</button>
            
  //           <BankApplicationForm />
  //         </div>
  //       </div>
  //     )}

  //     <div className="bn-table-card">
  //       <table className="bn-table">
  //         <thead>
  //           <tr>
  //             <th>Applicant</th><th>Loan Type</th><th>Amount</th><th>Risk Score</th><th>Status</th><th>Date</th><th>Actions</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {recentApplications.map(app => (
  //             <tr key={app.id}>
  //               <td className="bn-td-app">
  //                 <div className="bn-avatar"><User size={14} /></div>
  //                 <div>{app.name}</div>
  //               </td>
  //               <td>{app.type}</td>
  //               <td>₹{app.amount.toLocaleString()}</td>
  //               <td className={`score ${app.riskScore >= 700 ? 'g' : app.riskScore >= 600 ? 'y' : 'r'}`}>{app.riskScore}</td>
  //               <td><div className={`bn-status-pill ${app.status}`}>{app.status}</div></td>
  //               <td className="muted">{app.date}</td>
  //               <td className="bn-actions-col">
  //                 <button className="icon-btn"><Eye size={16} /></button>
  //                 <button className="icon-btn"><CheckCircle size={16} /></button>
  //                 <button className="icon-btn"><XCircle size={16} /></button>
  //               </td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     </div>
  //   </div>
  // );
      <Application/>
  /* Main render — same routes & content as before */
  return (
    <div className="bn-root">
      <Sidebar />
      <main className="bn-main">
        <div className="bn-topbar">
          <div>
            <h1 className="bn-page-title">Risk Management Dashboard</h1>
            <div className="bn-sub">Monitor and manage your credit portfolio</div>
          </div>
          <div className="bn-top-actions">
            <button className="icon-btn notif"><Bell size={18} /><span className="dot" /></button>
            <div className="bn-avatar-circle">SBI</div>
          </div>
        </div>

        <div className="bn-page-body">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'applications' && <Application />}
          {activeTab === 'portfolio' && (
            <div className="bn-card">
              <h2 className="bn-section-title">Portfolio Management</h2>
              <div className="muted">Detailed portfolio analysis and management tools would go here...</div>
            </div>
          )}
          {activeTab === 'risk-analysis' && (
            <div className="bn-card">
              <h2 className="bn-section-title">Risk Analysis</h2>
              <div className="bn-card-head-row" style={{ marginBottom: 12 }}>
                <button
                  className="bn-primary-btn"
                  onClick={() => window.open("http://localhost:8503/?embedded=1", "_blank", "noopener,noreferrer")}
                >
                  Open in New Tab
                </button>
              </div>
              <div className="muted">Predictor opens in a new tab. No inline frame shown.</div>
            </div>
          )}
          {activeTab === 'customers' && (
            <div className="bn-card">
              <h2 className="bn-section-title">Customer Management</h2>
              <div className="muted">Customer database and relationship management tools would go here...</div>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="bn-card">
              <h2 className="bn-section-title">Reports & Analytics</h2>
              <div className="muted">Comprehensive reporting and business intelligence tools would go here...</div>
            </div>
          )}
          {activeTab === 'models' && (
            <div className="bn-card">
              <h2 className="bn-section-title">ML Model Management</h2>
              <div className="muted">Machine learning model monitoring and management interface would go here...</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BankDashboard;
