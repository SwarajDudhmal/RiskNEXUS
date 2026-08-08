import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { auth, db } from '../firebase/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import zxcvbn from 'zxcvbn';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import './AuthPage.css';

const AuthForm = ({
  authAction, userType, email, setEmail, password, setPassword,
  confirmPassword, setConfirmPassword, bankName, setBankName,
  licenseNumber, setLicenseNumber, passwordStrength
}) => {
  if (authAction === 'signin') {
    return (
      <>
        <label htmlFor="email">Email Address</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </>
    );
  } else { // Sign Up form
    return (
      <>
        <label htmlFor="email">Email Address</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <PasswordStrengthIndicator strength={passwordStrength} />
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        {userType === 'bank' && (
          <>
            <label htmlFor="bankName">Bank Name</label>
            <input id="bankName" type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
            <label htmlFor="licenseNumber">Banking License</label>
            <input id="licenseNumber" type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
          </>
        )}
      </>
    );
  }
};

// The main page component
const AuthPage = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [userType, setUserType] = useState('customer');
  const [authAction, setAuthAction] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bankName, setBankName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (authAction === 'signup' && password) {
      const result = zxcvbn(password);
      setPasswordStrength(result.score);
    } else {
      setPasswordStrength(0);
    }
  }, [password, authAction]);

  const createUserProfileDocument = async (user, additionalData = {}) => {
    if (!user) return;
    const userRef = doc(db, `users`, user.uid);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      const { email } = user;
      try {
        await setDoc(userRef, { email, createdAt: serverTimestamp(), ...additionalData });
      } catch (error) {
        console.error("Error creating user document", error);
        setError("Couldn't save user details. " + error.message);
      }
    }
    return userRef;
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (authAction === 'signup') {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (passwordStrength < 3) {
        setError("Password is not strong enough.");
        setLoading(false);
        return;
      }
      try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        const additionalData = { role: userType, ...(userType === 'bank' && { bankName, licenseNumber }) };
        await createUserProfileDocument(user, additionalData);
        await sendEmailVerification(user);
        alert('Registration successful! Please check your email to verify your account before logging in.');
        setAuthAction('signin'); // Switch to login tab after successful registration
      } catch (err) {
        setError(err.message);
      }
    } else { // Sign In Logic
      try {
        await signInWithEmailAndPassword(auth, email, password);
        if (userType === 'customer') {
          navigate('/customer-dashboard');
        } else {
          navigate('/bank-dashboard');
        }
      } catch (err) {
        setError(err.code === 'auth/invalid-credential' ? 'Invalid email or password.' : err.message);
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const { user } = await signInWithPopup(auth, provider);
      const additionalData = { role: userType };
      await createUserProfileDocument(user, additionalData);
      
      // ** REDIRECTION LOGIC **
      if (userType === 'customer') {
        navigate('/customer-dashboard');
      } else {
        navigate('/bank-dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container-new">
      <div className="auth-card-new">
        <div className="auth-header">
          <h1>RiskNexus</h1>
          <p>Advanced Credit Risk Analysis Platform</p>
        </div>
        <div className="user-type-selector">
          <button onClick={() => setUserType('customer')} className={userType === 'customer' ? 'active' : ''}>Customer</button>
          <button onClick={() => setUserType('bank')} className={userType === 'bank' ? 'active' : ''}>Bank</button>
        </div>
        <div className="action-tabs">
          <button onClick={() => setAuthAction('signin')} className={authAction === 'signin' ? 'active' : ''}>Sign In</button>
          <button onClick={() => setAuthAction('signup')} className={authAction === 'signup' ? 'active' : ''}>Sign Up</button>
        </div>
        <form className="auth-form" onSubmit={handleAuthAction}>
          <AuthForm
            authAction={authAction} userType={userType} email={email}
            setEmail={setEmail} password={password} setPassword={setPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            bankName={bankName} setBankName={setBankName}
            licenseNumber={licenseNumber} setLicenseNumber={setLicenseNumber}
            passwordStrength={passwordStrength}
          />
          {error && <p className="error-message" style={{ textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
          <button type="submit" className="main-action-btn" disabled={loading}>
            {loading ? 'Processing...' : (authAction === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        <div className="divider-new"><span>or</span></div>
        <button className="google-btn-new" onClick={handleGoogleSignIn} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default AuthPage;