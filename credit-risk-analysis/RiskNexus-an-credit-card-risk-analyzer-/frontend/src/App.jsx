import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import CustomerDashboard from './pages/CustomerDashboard';
import BankDashboard from './pages/BankDashboard';
import CreditScore from './pages/CreditScore';
import BankApplicationForm from './pages/BankApplicationForm';
function App() {
  return (
    <Router>
      <Routes>
        {/* The login page will be the default route */}
        <Route path="/login" element={<AuthPage />} />

        {/* Define routes for the dashboards */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/customer-dashboard/credit-score" element={<CreditScore />} />
        <Route path="/bank-dashboard" element={<BankDashboard />} />
        
        {/* Add a default route to redirect to the login page */}
        <Route path="*" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;