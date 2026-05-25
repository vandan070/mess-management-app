import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { ToastProvider } from './context/ToastContext';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/loop.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>
      <div className="app-content">
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </div>
    </ToastProvider>
  );
}

export default App;
