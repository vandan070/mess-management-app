import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  
  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Navigation State
  const [activeView, setActiveView] = useState('hub');
  
  // Data States
  const [students, setStudents] = useState([]);
  const [meals, setMeals] = useState([]);
  const [historyDays, setHistoryDays] = useState(0);

  // Ledger Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Attendance Search
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceSearchBy, setAttendanceSearchBy] = useState('Student ID');

  // Student Log (Roster) State
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterStatusFilter, setRosterStatusFilter] = useState('All');

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) {
      showToast('Unauthorized. Please login as Admin.');
      navigate('/');
      return;
    }
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [historyDays]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/students`);
      const mappedStudents = response.data.map(s => ({
        id: s.studentId,
        name: s.name,
        status: s.paymentStatus,
        expiry: s.subscriptionEndDate ? new Date(s.subscriptionEndDate).toLocaleDateString() : 'N/A',
        mobileNumber: s.mobileNumber || 'N/A',
        // Mock derived fields for roster
        joinDate: new Date(s.createdAt || Date.now()).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
        daysLeft: Math.ceil((new Date(s.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)) || 0
      }));
      setStudents(mappedStudents);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/students/attendance/history?days=${historyDays}`);
      setMeals(response.data);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    }
  };

  // Add Student State
  const [newStudent, setNewStudent] = useState({
    name: '', id: '', mobileNumber: '', expiry: '', status: 'Pending'
  });

  // Change Password State
  const [passwords, setPasswords] = useState({ adminId: '', current: '', new: '', mobile: '' });

  // Delete Student State
  const [deleteStudentId, setDeleteStudentId] = useState('');

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
  
  const filteredRoster = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(rosterSearch.toLowerCase()) || 
                          student.id.toLowerCase().includes(rosterSearch.toLowerCase());
    const matchesStatus = rosterStatusFilter === 'All' || student.status === rosterStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadCSV = () => {
    const todayStr = new Date().toLocaleDateString();
    const todaysMeals = meals.filter(meal => {
       const mDate = meal.date ? new Date(meal.date).toLocaleDateString() : todayStr;
       return mDate === todayStr;
    });
    
    if (todaysMeals.length === 0) {
      showToast('No check-ins found for today to download.');
      return;
    }

    const headers = 'Student ID,Name,Time,Meal Type,Date\n';
    const rows = todaysMeals.map(meal => {
      const mDate = meal.date ? new Date(meal.date).toLocaleDateString() : todayStr;
      return `${meal.studentId},${meal.name},${meal.time},${meal.type},${mDate}`;
    }).join('\n');
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_today_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded today's attendance (${todaysMeals.length} records)!`);
  };

  const handleDownloadCSVForDate = (dateStr, dateMeals) => {
    if (!dateMeals || dateMeals.length === 0) {
      showToast(`No check-ins found for ${dateStr} to download.`);
      return;
    }

    const headers = 'Student ID,Name,Time,Meal Type,Date\n';
    const rows = dateMeals.map(meal => {
      const mDate = meal.date ? new Date(meal.date).toLocaleDateString() : dateStr;
      return `${meal.studentId},${meal.name},${meal.time},${meal.type},${mDate}`;
    }).join('\n');
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const safeDate = dateStr.replace(/\//g, '-');
    link.setAttribute('download', `attendance_${safeDate}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded attendance for ${dateStr === new Date().toLocaleDateString() ? 'Today' : dateStr} (${dateMeals.length} records)!`);
  };

  const groupMealsByDate = (mealsToGroup) => {
    const grouped = {};
    mealsToGroup.forEach(meal => {
      const dateStr = meal.date ? new Date(meal.date).toLocaleDateString() : new Date().toLocaleDateString();
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(meal);
    });
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({ date, meals: grouped[date] }));
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.id || !newStudent.mobileNumber || !newStudent.expiry) {
      showToast('Please fill all required fields');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/students/add`, {
        name: newStudent.name,
        studentId: newStudent.id,
        mobileNumber: newStudent.mobileNumber,
        subscriptionEndDate: newStudent.expiry,
        paymentStatus: newStudent.status
      });

      fetchStudents();

      setNewStudent({ name: '', id: '', mobileNumber: '', expiry: '', status: 'Pending' });
      showToast('Student added successfully!');
      setActiveView('Payments');
    } catch (error) {
      console.error('Error adding student:', error);
      showToast('Failed to add student. Ensure ID is unique.');
    }
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.adminId || !passwords.current || !passwords.new) {
      showToast('Please fill required fields');
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/api/admin/password`, {
        adminId: passwords.adminId,
        currentPassword: passwords.current,
        newPassword: passwords.new,
        mobileNumber: passwords.mobile || undefined
      });
      showToast(response.data.message);
      setPasswords({ adminId: '', current: '', new: '', mobile: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      showToast(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleDeleteStudent = async (e) => {
    e.preventDefault();
    if (!deleteStudentId.trim()) {
      showToast('Please enter a Student ID');
      return;
    }

    const isConfirmed = window.confirm(`Are you absolutely sure you want to permanently delete Student ${deleteStudentId.toUpperCase()}? This action cannot be undone.`);
    
    if (isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/students/${deleteStudentId.trim()}`);
        showToast(`Student ${deleteStudentId.toUpperCase()} has been deleted.`);
        setDeleteStudentId('');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Failed to delete student. They may not exist.');
      }
    }
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
            <option value="Partially Paid">Partially Paid</option>
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
                      className={`status-badge status-select status-${student.status.toLowerCase().replace(' ', '-')}`}
                      value={student.status}
                      onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Partially Paid">Partially Paid</option>
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
          <h3 className="section-title" style={{ fontSize: '1.25rem' }}>Attendance History</h3>
          <div className="header-actions">
            <select
              className="input-field select-field"
              style={{ width: '150px', backgroundColor: 'var(--primary-color)', color: 'white' }}
              value={historyDays}
              onChange={(e) => setHistoryDays(Number(e.target.value))}
            >
              <option value={0}>Today</option>
              <option value={10}>Past 10 Days</option>
            </select>
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
                groupMealsByDate(filteredAttendance).map((group) => (
                  <React.Fragment key={group.date}>
                    <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      <td colSpan="4" style={{ textAlign: 'left', padding: '12px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{group.date === new Date().toLocaleDateString() ? 'Today' : group.date}</span>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 12px', fontSize: '0.8rem', backgroundColor: 'var(--bg-card)' }} 
                            onClick={() => handleDownloadCSVForDate(group.date, group.meals)}
                          >
                            &#x2B07; Download CSV
                          </button>
                        </div>
                      </td>
                    </tr>
                    {group.meals.map((meal) => (
                      <tr key={meal.id || meal._id}>
                        <td>{meal.name}</td>
                        <td>{meal.studentId}</td>
                        <td>{meal.time}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleAddMeal(meal.studentId, meal.name)}>
                              + Add Meal
                            </button>
                            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleRemoveMeal(meal.id || meal._id)}>
                              - Remove Meal
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
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
            <label>Student Name</label>
            <input 
              type="text" 
              className="input-field" 
              required
              placeholder="Enter your name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Student ID</label>
            <input 
              type="text" 
              className="input-field" 
              required
              placeholder="Enter id"
              value={newStudent.id}
              onChange={(e) => setNewStudent({...newStudent, id: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Mobile Number</label>
            <input 
              type="text" 
              className="input-field" 
              required
              placeholder="Enter mobile no"
              value={newStudent.mobileNumber}
              onChange={(e) => setNewStudent({...newStudent, mobileNumber: e.target.value})}
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
              <option value="Partially Paid">Partially Paid</option>
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
              <option value="Partially Paid">Partially Paid</option>
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
                <th>Mobile Number</th>
                <th>Joining Date & Time</th>
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
                    <td>{student.mobileNumber}</td>
                    <td>{student.joinDate}</td>
                    <td>{student.daysLeft}</td>
                    <td>
                      <span className={`status-badge status-${student.status.toLowerCase().replace(' ', '-')}`} style={{ padding: '4px 12px', display: 'inline-block' }}>
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
            <label>Admin ID</label>
            <input 
              type="text" 
              className="input-field" 
              required
              placeholder="Enter Admin ID"
              value={passwords.adminId}
              onChange={(e) => setPasswords({...passwords, adminId: e.target.value})}
            />
          </div>
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
          <div className="input-group">
            <label>Update Mobile Number (Optional) Else old one is used for verification</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter new 10-digit number"
              value={passwords.mobile}
              onChange={(e) => setPasswords({...passwords, mobile: e.target.value})}
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

  const renderDeleteStudent = () => (
    <section className="glass-panel admin-section fade-in">
      {renderBackButton()}
      <div style={{ marginTop: '24px', maxWidth: '500px' }}>
        <h2 className="section-title" style={{ color: '#ef4444' }}>Delete Student</h2>
        <p className="section-desc">Permanently remove a student from the database.</p>
        
        <form onSubmit={handleDeleteStudent} className="modal-form" style={{ marginTop: '24px' }}>
          <div className="input-group">
            <label>Student ID to Delete</label>
            <input 
              type="text" 
              className="input-field" 
              required
              placeholder="Enter Student ID"
              value={deleteStudentId}
              onChange={(e) => setDeleteStudentId(e.target.value)}
            />
          </div>
          <div style={{ marginTop: '24px' }}>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 32px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: '#ef4444' }}>
              Delete Student
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
      case 'DeleteStudent': return renderDeleteStudent();
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
        <button className="btn-secondary" onClick={() => {
          localStorage.removeItem('adminId');
          navigate('/');
        }}>
          Logout
        </button>
      </header>

      {renderActiveView()}
    </div>
  );
};

export default AdminDashboard;
