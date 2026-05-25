import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');

    if (!studentId) {
      navigate('/');
      return;
    }

    const fetchStudentData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/students/${studentId}`);
        console.log('Backend Response:', response.data);
        
        // Handle potential nesting if the backend wraps the document in a 'student' property
        const dataToSet = response.data.student ? response.data.student : response.data;
        setStudentData(dataToSet);
      } catch (error) {
        console.error('Fetch error:', error);
        showToast('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  const calculateDaysLeft = (endDateString) => {
    if (!endDateString) return 0;
    const end = new Date(endDateString);
    const now = new Date();
    const diffTime = end - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleClaimMeal = () => {
    setIsClaiming(true);
    // Simulate API call delay
    setTimeout(() => {
      // Mock API Response
      const mockResponse = {
        success: true,
        warning: 'Warning: Subscription expires soon.'
      };

      setIsClaiming(false);
      setHasClaimed(true);
      
      let countdown = 5;
      
      const updateToastMessage = (timeLeft) => {
        const baseMsg = mockResponse.warning 
          ? `⚠️ ${mockResponse.warning} - ` 
          : 'Meal claimed! ';
        showToast(`${baseMsg}Redirecting in ${timeLeft}...`, 1500);
      };

      updateToastMessage(countdown);

      const intervalId = setInterval(() => {
        countdown -= 1;
        if (countdown <= 0) {
          clearInterval(intervalId);
          navigate('/');
        } else {
          updateToastMessage(countdown);
        }
      }, 1000);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Loading dashboard...</h2>
      </div>
    );
  }

  const daysLeft = calculateDaysLeft(studentData?.subscriptionEndDate);
  const formattedDate = formatDate(studentData?.subscriptionEndDate);

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header">
        <div>
          <h1 className="welcome-title">Welcome back, {studentData?.name}!</h1>
          <p className="welcome-subtitle">Here is your mess overview for today.</p>
        </div>
        <button className="btn-secondary" onClick={() => {
          localStorage.removeItem('studentId');
          localStorage.removeItem('name');
          navigate('/');
        }}>
          Logout
        </button>
      </header>

      <div className="dashboard-grid">
        <div className="glass-panel dashboard-card">
          <h3 className="card-title">Active Subscription Status</h3>
          <div className="subscription-details">
            <div className="status-item">
              <span className="status-label">Remaining Days</span>
              <span className={`status-value ${daysLeft > 0 ? 'highlight' : ''}`}>{daysLeft} Days</span>
            </div>
            <div className="status-item">
              <span className="status-label">Next Renewal Date</span>
              <span className="status-value">{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel dashboard-card claim-card">
          <h3 className="card-title">Today's Meal</h3>
          <p className="claim-desc">Claim your meal to notify the kitchen.</p>
          
          <button 
            className={`btn-primary btn-large ${hasClaimed ? 'btn-success' : ''}`}
            onClick={handleClaimMeal}
            disabled={isClaiming || hasClaimed}
          >
            {isClaiming ? 'Processing...' : hasClaimed ? 'Meal Claimed! ✓' : 'Claim Meal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
