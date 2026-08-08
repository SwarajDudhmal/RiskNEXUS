import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './BankApplicationForm.css';

const BankApplicationForm = ({ initialData, isViewOnly, onClose }) => {
  const [activeTier, setActiveTier] = useState('tier1');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', app_number: '', 
    dti: '', annual_inc: '', loan_amnt: '', revol_util: '', delinq_2yrs: '0',
    inq_last_6mths: '0', open_acc: '', public_records: '0', Bankcard_utilization_ratio : '', revol_bal: '',
    earliest_cr_len: '', total_acc: '', home_ownership: 'RENT',
    verification_status: 'Not Verified', purpose: 'debt_consolidation',
    term: '36 months', mo_sin_old_rev_tl_op: '', num_actv_bc_tl: '', percent_bc_gt_75: ''
  });

  // Tiers defined directly from your "Features which are best" document
  const tiers = {
    tier1: {
      label: "Tier 1: Critical (10/10 Impact)",
      fields: ['name', 'app_number', 'dti', 'annual_inc', 'loan_amnt', 'revol_util', 'delinq_2yrs']
    },
    tier2: {
      label: "Tier 2: High Importance (7-8/10)",
      fields: ['inq_last_6mths', 'open_acc', 'public_records', 'Bankcard_utilization_ratio', 'revol_bal', 'earliest_cr_len', 'total_acc']
    },
    tier3: {
      label: "Tier 3: Performance (6/10)",
      fields: ['home_ownership', 'verification_status', 'purpose', 'term', 'mo_sin_old_rev_tl_op', 'num_actv_bc_tl', 'percent_bc_gt_75']
    }
  };

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "applications"), {
        ...formData,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) { console.error("Firebase Error:", err); }
    setLoading(false);
  };

  // Logic: Show All for submission, but Filter by Tier for viewing
  const fieldsToShow = isViewOnly ? tiers[activeTier].fields : Object.keys(formData);

  return (
    <div className="dark-modal-overlay">
      <div className="dark-form-card">
        <button className="close-x" onClick={onClose}>&times;</button>
        
        <div className="form-header">
          <h2>{isViewOnly ? "Application Analysis" : "New Loan Submission"}</h2>
          <p className="subtitle">{isViewOnly ? "Reviewing applicant risk profile" : "Enter customer financial data"}</p>
          
          {isViewOnly && (
            <div className="tier-nav">
              <label>ANALYZE BY PRIORITY:</label>
              <select className="tier-dropdown" onChange={(e) => setActiveTier(e.target.value)}>
                <option value="tier1">Tier 1: Critical Features</option>
                <option value="tier2">Tier 2: High Importance</option>
                <option value="tier3">Tier 3: Performance Features</option>
              </select>
            </div>
          )}
        </div>

        <div className="scroll-area">
          <div className="fields-grid">
  {fieldsToShow.map((key) => (
    <div className="input-group" key={key}>
      <label>{key.replace(/_/g, ' ').toUpperCase()}</label>
      
      {/* VERIFICATION STATUS DROPDOWN */}
      {key === 'verification_status' ? (
        <select
          name="verification_status"
          value={formData.verification_status}
          onChange={handleChange}
          disabled={isViewOnly}
          className="dark-input-select"
        >
          <option value="Not Verified">Not Verified</option>
          <option value="Verified">Verified</option>
          <option value="Pending">Pending</option>
        </select>
      ) : key === 'purpose' ? (
        /* PURPOSE COMBO-BOX (Dropdown + Text Input) */
        <div className="combo-container">
          <input
            name="purpose"
            list="purpose-options"
            value={formData.purpose}
            onChange={handleChange}
            disabled={isViewOnly}
            placeholder="Select or type..."
            className="dark-input-combo"
          />
          <datalist id="purpose-options">
            <option value="debt_consolidation" />
            <option value="home_loan" />
            <option value="car_loan" />
            <option value="credit_card" />
            <option value="medical" />
            <option value="major_purchase" />
          </datalist>
        </div>
      ) : key === 'home_ownership' ? (
        /* HOME OWNERSHIP DROPDOWN */
        <select
          name="home_ownership"
          value={formData.home_ownership}
          onChange={handleChange}
          disabled={isViewOnly}
          className="dark-input-select"
        >
          <option value="RENT">Rented</option>
          <option value="OWN">Owned</option>
          <option value="MORTGAGE">Mortgage</option>
          <option value="OTHER">Other</option>
        </select>
      ) : (
        /* STANDARD INPUT FOR OTHER FIELDS */
        <input
          name={key}
          value={formData[key]}
          onChange={handleChange}
          disabled={isViewOnly}
          placeholder={`Enter ${key}`}
          autoComplete="off"
          type={key === 'earliest_cr_line' ? 'date' : 'text'}
        />
      )}
    </div>
  ))}
</div>
        </div>

        {!isViewOnly && (
          <div className="form-footer">
            <button onClick={handleSubmit} className="submit-btn-dark" disabled={loading}>
              {loading ? "SAVING TO CLOUD..." : "SUBMIT APPLICATION"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



export default BankApplicationForm;