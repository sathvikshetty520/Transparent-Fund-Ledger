import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Campaigns from './pages/Campaigns';
import Login from './pages/Login';
import Register from './pages/Register';
import SubmitExpense from './pages/SubmitExpense';
import AuditExplorer from './pages/AuditExplorer';
import ExpenseVerification from './pages/admin/ExpenseVerification';
import ProtectedRoute from './components/ProtectedRoute';

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Link to="/" style={{ fontWeight: 'bold' }}>Fund Ledger</Link>
      <Link to="/campaigns">Campaigns</Link>
      <Link to="/ledger">Public Ledger</Link>
      
      {user?.role === 'ORGANIZER' && (
        <Link to="/submit-expense">Submit Expense</Link>
      )}

      {user?.role === 'ADMIN' && (
        <Link to="/admin/verify-expenses">Expense Verification</Link>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span>Welcome, <strong>{user.name || user.email}</strong> ({user.role})</span>
            <button onClick={logout} style={{ padding: '0.3rem 0.6rem', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
        <div style={{ padding: '1.5rem' }}>
          <Routes>
            <Route path="/" element={<h2>Welcome to Transparent Fund Ledger</h2>} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/ledger" element={<AuditExplorer />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/submit-expense"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <SubmitExpense />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/verify-expenses"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ExpenseVerification />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}