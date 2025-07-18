import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Hardcoded credentials
    if (adminId === 'chandrettan' && password === 'secret123') {
      navigate('/admin');
    } else {
      setError('Invalid admin ID or password');
    }
  };

  return (
    <div style={{ backgroundColor: '#e6ffe6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ backgroundColor: '#006400', color: 'white', padding: '10px 20px', textAlign: 'center' }}>
        Admin Login
      </header>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '350px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '2px solid #FFD700' }}>
          <input
            value={adminId}
            onChange={e => setAdminId(e.target.value)}
            placeholder="Admin ID"
            required
            className="form-control mb-2"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="form-control mb-2"
          />
          <button type="submit" className="btn btn-success w-100">Login</button>
          {error && <p className="mt-2 text-danger text-center">{error}</p>}
        </form>
      </div>

      <footer style={{ backgroundColor: '#006400', color: 'white', textAlign: 'center', padding: '8px' }}>
        Cooked with love ❤️
      </footer>
    </div>
  );
}
