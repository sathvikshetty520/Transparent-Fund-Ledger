 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../services/auth.service';

export default function Login() {
  const [email, setEmail] = useState('donor1@demo.com');
  const [password, setPassword] = useState('Password@123');
  const [role, setRole] = useState('CONTRIBUTOR');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password, role });
      login(res.user, res.token);
      navigate('/campaigns');
    } catch (err) {
      alert('Login failed. Please check your details.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Role (Demo Selection)</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="CONTRIBUTOR">CONTRIBUTOR (Donor)</option>
            <option value="ORGANIZER">ORGANIZER (Campaign Creator)</option>
            <option value="ADMIN">ADMIN (Approver)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button type="submit" style={{ padding: '0.6rem', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sign In
        </button>
      </form>
    </div>
  );
}