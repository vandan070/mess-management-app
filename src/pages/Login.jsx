import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Login.css';

const Login = () => {
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('Student');
  
  // Recovery Mode State
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryStage, setRecoveryStage] = useState(1);
  const [securityMobile, setSecurityMobile] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const navigate = useNavigate();
  const showToast = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Mock validation
    if (!studentId || (role === 'Admin' && !pin)) {
      alert("Please fill in all required fields.");
      return;
    }

    showToast(`Welcome back, ${role}!`);

    // Mock redirect
    if (role === 'Student') {
      localStorage.setItem('studentId', studentId);
      localStorage.setItem('name', studentId);
      navigate('/student');
    } else {
      navigate('/admin');
    }
  };

  const handleVerifyMobile = (e) => {
    e.preventDefault();
    if (securityMobile.length >= 10) {
      setRecoveryStage(2);
      showToast('Mobile verified. Enter new PIN.');
    } else {
      showToast('Please enter a valid 10-digit mobile number.');
    }
  };

  const handleResetPin = (e) => {
    e.preventDefault();
    if (newPin === confirmPin && newPin.length > 0) {
      showToast('Admin PIN reset successfully');
      setIsRecoveryMode(false);
      setRecoveryStage(1);
      setSecurityMobile('');
      setNewPin('');
      setConfirmPin('');
    } else {
      showToast('PINs do not match!');
    }
  };

  if (isRecoveryMode) {
    return (
      <div className="login-container">
        <div className="glass-panel login-card">
          <h2 className="login-title">Password Recovery</h2>
          <p className="login-subtitle">Reset your Admin PIN</p>
          
          {recoveryStage === 1 ? (
            <form onSubmit={handleVerifyMobile} className="login-form">
              <div className="input-group">
                <label>Security Mobile Number</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Enter security mob no"
                  value={securityMobile}
                  onChange={(e) => setSecurityMobile(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>Verify</button>
              <button type="button" className="btn-secondary" onClick={() => setIsRecoveryMode(false)} style={{ marginTop: '12px' }}>Cancel</button>
            </form>
          ) : (
            <form onSubmit={handleResetPin} className="login-form">
              <div className="input-group">
                <label>New PIN</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Enter new PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Confirm New PIN</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Confirm new PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>Reset PIN</button>
              <button type="button" className="btn-secondary" onClick={() => setIsRecoveryMode(false)} style={{ marginTop: '12px' }}>Cancel</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="glass-panel login-card">
        <h2 className="login-title">Mess Management</h2>
        <p className="login-subtitle">Sign in to your account</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="role-toggle">
            <button 
              type="button" 
              className={`toggle-btn ${role === 'Student' ? 'active' : ''}`}
              onClick={() => { setRole('Student'); setPin(''); }}
            >
              Student
            </button>
            <button 
              type="button" 
              className={`toggle-btn ${role === 'Admin' ? 'active' : ''}`}
              onClick={() => setRole('Admin')}
            >
              Admin
            </button>
          </div>

          <div className="input-group">
            <label htmlFor="studentId">{role === 'Student' ? 'Student ID' : 'Admin ID'}</label>
            <input 
              type="text" 
              id="studentId" 
              className="input-field" 
              placeholder={`Enter ${role} ID`}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          {role === 'Admin' && (
            <div className="input-group">
              <label htmlFor="pin">PIN</label>
              <input 
                type="password" 
                id="pin" 
                className="input-field" 
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <span 
                  style={{ color: 'var(--primary-color)', fontSize: '0.875rem', cursor: 'pointer', opacity: 0.8 }}
                  onClick={() => setIsRecoveryMode(true)}
                  onMouseOver={(e) => e.target.style.opacity = 1}
                  onMouseOut={(e) => e.target.style.opacity = 0.8}
                >
                  Forgot PIN?
                </span>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
