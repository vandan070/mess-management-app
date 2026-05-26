import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import './Login.css';

const Login = () => {
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('Student');
  
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryStage, setRecoveryStage] = useState(1);
  const [securityMobile, setSecurityMobile] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [recoveryAdminId, setRecoveryAdminId] = useState('');

  const navigate = useNavigate();
  const showToast = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!studentId || (role === 'Admin' && !pin)) {
      showToast("Please fill in all required fields.");
      return;
    }

    if (role === 'Admin') {
      try {
        const response = await axios.post(`${API_URL}/api/admin/login`, {
          adminId: studentId,
          password: pin
        });
        showToast(response.data.message);
        localStorage.setItem('adminId', response.data.adminId);
        navigate('/admin');
      } catch (err) {
        showToast(err.response?.data?.message || 'Login failed');
      }
    } else {
      showToast(`Welcome back, Student!`);
      localStorage.setItem('studentId', studentId);
      localStorage.setItem('name', studentId);
      navigate('/student');
    }
  };

  const handleVerifyMobile = async (e) => {
    e.preventDefault();
    if (securityMobile.length >= 10) {
      try {
        const response = await axios.post(`${API_URL}/api/admin/verify-mobile`, {
          mobileNumber: securityMobile
        });
        setRecoveryAdminId(response.data.adminId);
        setRecoveryStage(2);
        showToast('Mobile verified. Enter new PIN.');
      } catch (err) {
        showToast(err.response?.data?.message || 'Verification failed. Mobile not found.');
      }
    } else {
      showToast('Please enter a valid 10-digit mobile number.');
    }
  };

  const handleResetPin = async (e) => {
    e.preventDefault();
    if (newPin === confirmPin && newPin.length > 0) {
      try {
        const response = await axios.post(`${API_URL}/api/admin/reset-pin`, {
          adminId: recoveryAdminId,
          newPassword: newPin
        });
        showToast(response.data.message);
        setIsRecoveryMode(false);
        setRecoveryStage(1);
        setSecurityMobile('');
        setNewPin('');
        setConfirmPin('');
        setRecoveryAdminId('');
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to reset PIN.');
      }
    } else {
      showToast('PINs do not match or are empty!');
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
