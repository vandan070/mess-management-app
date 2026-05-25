import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const INITIAL_MOCK_STUDENTS = [
  { id: 'S1001', name: 'Alice Smith', status: 'Paid', expiry: '2026-06-10' },
  { id: 'S1002', name: 'Bob Jones', status: 'Pending', expiry: '2026-05-25' },
  { id: 'S1003', name: 'Charlie Brown', status: 'Paid', expiry: '2026-06-15' },
  { id: 'S1004', name: 'Diana Prince', status: 'Overdue', expiry: '2026-05-20' },
  { id: 'S1005', name: 'Evan Davis', status: 'Paid', expiry: '2026-06-30' },
];

const INITIAL_MOCK_MEALS = [
  { id: 1, studentId: 'S1001', name: 'Alice Smith', time: '08:15 AM', type: 'Breakfast' },
  { id: 2, studentId: 'S1003', name: 'Charlie Brown', time: '08:20 AM', type: 'Breakfast' },
  { id: 3, studentId: 'S1005', name: 'Evan Davis', time: '08:45 AM', type: 'Breakfast' },
  { id: 4, studentId: 'S1001', name: 'Alice Smith', time: '01:10 PM', type: 'Lunch' },
  { id: 5, studentId: 'S1002', name: 'Bob Jones', time: '01:30 PM', type: 'Lunch' },
];

const INITIAL_STUDENT_ROSTER = [
  { name: 'Alice Smith', id: 'S1001', joinDate: '2025-08-15', lastPayment: '2026-05-10', daysLeft: 15, status: 'Paid' },
  { name: 'Bob Jones', id: 'S1002', joinDate: '2026-01-10', lastPayment: '2026-04-25', daysLeft: -1, status: 'Pending' },
  { name: 'Charlie Brown', id: 'S1003', joinDate: '2025-09-01', lastPayment: '2026-05-15', daysLeft: 20, status: 'Paid' },
  { name: 'Diana Prince', id: 'S1004', joinDate: '2026-02-14', lastPayment: '2026-04-20', daysLeft: -6, status: 'Overdue' },
  { name: 'Evan Davis', id: 'S1005', joinDate: '2025-11-20', lastPayment: '2026-05-30', daysLeft: 35, status: 'Paid' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  
  // Navigation State
  const [activeView, setActiveView] = useState('hub');
  
  // Data States
  const [students, setStudents] = useState(INITIAL_MOCK_STUDENTS);
  const [meals, setMeals] = useState(INITIAL_MOCK_MEALS);

  // Ledger Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Attendance Search
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceSearchBy, setAttendanceSearchBy] = useState('Student ID');

  // Student Log (Roster) State
  const [roster, setRoster] = useState(INITIAL_STUDENT_ROSTER);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterStatusFilter, setRosterStatusFilter] = useState('All');

  // Add Student State
  const [newStudent, setNewStudent] = useState({
    id: '', expiry: '', status: 'Pending'
  });

  // Change Password State
  const [passwords, setPasswords] = useState({ current: '', new: '' });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filterMeals = (mealList, search, searchBy) => {
    return mealList.filter(meal => {
      const field = searchBy === 'Name' ? meal.name : meal.studentId;
      return field.toLowerCase().includes(search.toLowerCase());
    });
  };

  const filteredAttendance = filterMeals(meals, attendanceSearch, attendanceSearchBy);
  
  const filteredRoster = roster.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(rosterSearch.toLowerCase()) || 
                          student.id.toLowerCase().includes(rosterSearch.toLowerCase());
    const matchesStatus = rosterStatusFilter === 'All' || student.status === rosterStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadCSV = () => {
    const headers = 'Student ID,Name,Time,Meal Type\n';
    const rows = meals.map(meal => `${meal.studentId},${meal.name},${meal.time},${meal.type}`).join('\n');
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'attendance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report downloaded successfully!');
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!newStudent.id || !newStudent.expiry) return;

    setStudents([...students, {
      id: newStudent.id,
      name: 'New Student',
      status: newStudent.status,
      expiry: newStudent.expiry
    }]);

    setNewStudent({ id: '', expiry: '', status: 'Pending' });
    showToast('Student added successfully!');
    setActiveView('Payments');
  };

  const handleStatusChange = (studentId, newStatus) => {
    console.log(`[API MOCK] Updating student ${studentId} payment status to: ${newStatus}`);
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
    showToast(`Status updated to ${newStatus}`);
  };

  const handleAddMeal = (studentId, name = 'Unknown User') => {
    const newMeal = {
      id: Date.now(),
      studentId: studentId,
      name: name,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      type: 'Manual Entry'
    };
    setMeals([...meals, newMeal]);
    showToast('Meal added manually');
  };

  const handleRemoveMeal = (mealId) => {
    setMeals(meals.filter(m => m.id !== mealId));
    showToast('Meal removed manually');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.new) return;
    showToast('Admin password updated successfully');
    setPasswords({ current: '', new: '' });
  };

  const renderBackButton = () => (
    <button className="btn-secondary back-btn" onClick={() => setActiveView('hub')}>
      &larr; Back to Hub
    </button>
  );

  const renderHub = () => (
    <div className="hub-grid">
      <button className="glass-panel hub-card" onClick={() => setActiveView('Attendance')}>
        <h3>Attendance</h3>
        <p>Download logs & daily check-ins</p>
      </button>
      <button className="glass-panel hub-card" onClick={() => setActiveView('Payments')}>
        <h3>Payments</h3>
        <p>Manage interactive ledger</p>
      </button>
      <button className="glass-panel hub-card" onClick={() => setActiveView('ChangeAdminPass')}>
        <h3>Change Admin Pass</h3>
        <p>Update security settings</p>
      </button>
      <button className="glass-panel hub-card" onClick={() => setActiveView('AddStudent')}>
        <h3>Add Student</h3>
        <p>Register new accounts</p>
      </button>
      <button className="glass-panel hub-card" onClick={() => setActiveView('DeleteStudent')}>
        <h3>Delete Student</h3>
        <p>Remove user records</p>
      </button>
      <button className="glass-panel hub-card" onClick={() => setActiveView('StudentLog')}>
        <h3>Student Log</h3>
        <p>View detailed histories</p>
      </button>
    </div>
  );

  const renderPayments = () => (
    <section className="glass-panel admin-section fade-in">
      {renderBackButton()}
      <div className="section-header" style={{ marginTop: '24px' }}>
        <h2 className="section-title">Interactive Payment Ledger</h2>
        <div className="header-actions">
          <select 
            className="input-field select-field"
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
          <input 
            type="text" 
            placeholder="Search by Student ID..." 
            className="input-field search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Payment Status</th>
              <th>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>
                    <select 
                      className={`status-badge status-select status-${student.status.toLowerCase()}`}
                      value={student.status}
                      onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </td>
                  <td>{student.expiry}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderAttendance = () => (
    <section className="glass-panel admin-section fade-in">
      {renderBackButton()}
      <div style={{ marginTop: '24px' }}>
        <h2 className="section-title">Attendance & Daily Operations</h2>
        
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px', marginTop: '16px' }}>
          <div className="glass-panel" style={{ padding: '24px', flex: 1, minWidth: '250px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Total Checked In Today</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{meals.length}</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px', flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Download a complete CSV backup of today's logged meals and check-ins.</p>
            <button className="btn-primary backup-btn" style={{ width: '100%' }} onClick={handleDownloadCSV}>
              Download Daily Report (.csv)
            </button>
          </div>
        </div>

        <div className="section-header">
          <h3 className="section-title" style={{ fontSize: '1.25rem' }}>Today's Check-ins</h3>
          <div className="header-actions">
            <select 
              className="input-field select-field" 
              style={{ width: '150px' }}
              value={attendanceSearchBy}
              onChange={(e) => setAttendanceSearchBy(e.target.value)}
            >
              <option value="Student ID">Student ID</option>
              <option value="Name">Name</option>
            </select>
            <input 
              type="text" 
              placeholder={`Search by ${attendanceSearchBy}...`}
              className="input-field search-bar"
              value={attendanceSearch}
              onChange={(e) => setAttendanceSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Student ID</th>
                <th>Time Claimed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((meal) => (
                  <tr key={meal.id}>
                    <td>{meal.name}</td>
                    <td>{meal.studentId}</td>
                    <td>{meal.time}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleAddMeal(meal.studentId, meal.name)}>
                          + Add Meal
                        </button>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleRemoveMeal(meal.id)}>
                          - Remove Meal
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">No check-ins found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const renderAddStudent = () => (
    <section className="glass-panel admin-section fade-in">
      {renderBackButton()}
      <div style={{ marginTop: '24px', maxWidth: '500px' }}>
        <h2 className="section-title">Add New Student</h2>
        <form onSubmit={handleSaveStudent} className="modal-form" style={{ marginTop: '24px' }}>
          <div className="input-group">
            <label>Student ID</label>
            <input 
              type="text" 
              className="input-field" 
              required
              placeholder="e.g. S1006"
              value={newStudent.id}
              onChange={(e) => setNewStudent({...newStudent, id: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Expiry Date</label>
            <input 
              type="date" 
              className="input-field" 
              required
              value={newStudent.expiry}
              onChange={(e) => setNewStudent({...newStudent, expiry: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Payment Status</label>
            <select 
              className="input-field select-field"
              value={newStudent.status}
              onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div style={{ marginTop: '24px' }}>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>
              Save Student
            </button>
          </div>
        </form>
      </div>
    </section>
  );

  const renderStudentLog = () => (
    <section className="glass-panel admin-section fade-in">
      {renderBackButton()}
      <div style={{ marginTop: '24px' }}>
        <h2 className="section-title">Student Log (Master Roster)</h2>
        <p className="section-desc">View and manage all registered students.</p>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px', marginTop: '16px' }}>
          <div className="glass-panel" style={{ padding: '24px', flex: 1, minWidth: '250px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Total Registered Students</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{filteredRoster.length}</p>
          </div>
        </div>

        <div className="section-header">
          <h3 className="section-title" style={{ fontSize: '1.25rem' }}>Roster Data</h3>
          <div className="header-actions">
            <select 
              className="input-field select-field" 
              style={{ width: '150px' }}
              value={rosterStatusFilter}
              onChange={(e) => setRosterStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            <input 
              type="text" 
              placeholder="Search by ID or Name..."
              className="input-field search-bar"
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Student ID</th>
                <th>Joining Date</th>
                <th>Last Payment</th>
                <th>Days Left</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoster.length > 0 ? (
                filteredRoster.map((student, index) => (
                  <tr key={index}>
                    <td>{student.name}</td>
                    <td>{student.id}</td>
                    <td>{student.joinDate}</td>
                    <td>{student.lastPayment}</td>
                    <td>{student.daysLeft}</td>
                    <td>
                      <span className={`status-badge status-${student.status.toLowerCase()}`} style={{ padding: '4px 12px', display: 'inline-block' }}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const renderChangeAdminPass = () => (
    <section className="glass-panel admin-section fade-in">
      {renderBackButton()}
      <div style={{ marginTop: '24px', maxWidth: '500px' }}>
        <h2 className="section-title">Change Admin Password</h2>
        <p className="section-desc">Update your security credentials.</p>
        
        <form onSubmit={handleChangePassword} className="modal-form" style={{ marginTop: '24px' }}>
          <div className="input-group">
            <label>Current Password</label>
            <input 
              type="password" 
              className="input-field" 
              required
              placeholder="Enter current password"
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input 
              type="password" 
              className="input-field" 
              required
              placeholder="Enter new password"
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
            />
          </div>
          <div style={{ marginTop: '24px' }}>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </section>
  );

  const renderPlaceholder = (title) => (
    <section className="glass-panel admin-section fade-in">
      {renderBackButton()}
      <div style={{ marginTop: '24px' }}>
        <h2 className="section-title">{title}</h2>
        <p className="section-desc">This feature is currently under development.</p>
      </div>
    </section>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'Payments': return renderPayments();
      case 'Attendance': return renderAttendance();
      case 'AddStudent': return renderAddStudent();
      case 'StudentLog': return renderStudentLog();
      case 'ChangeAdminPass': return renderChangeAdminPass();
      case 'DeleteStudent': return renderPlaceholder('Delete Student');
      default: return renderHub();
    }
  };

  return (
    <div className="admin-container">
      <header className="dashboard-header">
        <div>
          <h1 className="welcome-title">Admin Dashboard</h1>
          <p className="welcome-subtitle">
            {activeView === 'hub' ? 'Central Management Hub' : `Managing ${activeView}`}
          </p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          Logout
        </button>
      </header>

      {renderActiveView()}
    </div>
  );
};

export default AdminDashboard;
