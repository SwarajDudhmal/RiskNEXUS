import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import './Application.css';
import BankApplicationForm from './BankApplicationForm';

const Application = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(data);
    });
    return () => unsubscribe();
  }, []);

  const handleView = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  return (
    <div className="bank-app-container">
      <div className="bn-card">
        <div className="bn-card-head-row">
          <div className="bn-section-title-sm">Tier-1: Critical Risk Assessment</div>
          <button className="bn-primary-btn" onClick={() => { setSelectedApp(null); setShowModal(true); }}>
            + New Application
          </button>
        </div>

        <div className="table-wrapper">
          <table className="tier-table">
            <thead>
              <tr>
                <th>APPLICANT</th>
                <th>DTI </th>
                <th>ANNUAL INC </th>
                <th>LOAN AMNT </th>
                <th>REVOL UTIL </th>
                <th>DELINQ (2Y) </th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="name-cell">
                      <span className="main-name">{app.name}</span>
                      <span className="sub-id">#{app.app_number}</span>
                    </div>
                  </td>
                  <td>{app.dti}%</td>
                  <td>${Number(app.annual_inc).toLocaleString()}</td>
                  <td>${Number(app.loan_amnt).toLocaleString()}</td>
                  <td>{app.revol_util}%</td>
                  <td>{app.delinq_2yrs}</td>
                  <td><span className={`status-pill ${app.status}`}>{app.status}</span></td>
                  <td>
                    <button className="eye-btn" onClick={() => handleView(app)}>👁️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <BankApplicationForm 
          initialData={selectedApp} 
          isViewOnly={!!selectedApp} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
};

export default Application;