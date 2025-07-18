import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [role, setRole] = useState('student');  // default is student
  const [password, setPassword] = useState('');
  const [collegeId, setCollegeId] = useState(''); // only for student
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (role === 'admin') {
      if (password === 'admin123') {
        navigate('/admin');
      } else {
        setMessage('❌ Invalid admin password!');
      }
    } else if (role === 'student') {
      if (!collegeId.trim()) {
        setMessage('⚠️ Please enter College ID.');
        return;
      }
      // ✅ Hardcode check: ID must be 'MDL22CS' and password must be 'student123'
      if (collegeId === 'MDL22CS' && password === 'student123') {
        navigate('/student');
      } else {
        setMessage('❌ Invalid College ID or password!');
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#e6ffe6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '350px', backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
        <h4 className="mb-3 text-center">🍛 Login</h4>

        <div className="mb-2">
          <label className="form-label">Select Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="form-control">
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role === 'student' && (
          <div className="mb-2">
            <label className="form-label">College ID</label>
            <input 
              type="text"
              value={collegeId}
              onChange={e => setCollegeId(e.target.value)}
              className="form-control"
              required
            />
          </div>
        )}

        <div className="mb-2">
          <label className="form-label">Password</label>
          <input 
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <button type="submit" className="btn btn-success w-100">Login</button>
        {message && <p className="text-center mt-2" style={{ color: 'red' }}>{message}</p>}
      </form>
    </div>
  );
}
