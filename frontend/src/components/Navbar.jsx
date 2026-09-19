 import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="navbar"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '0.05em' }}>
        💎 Transparent Fund Ledger
      </div>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/campaigns" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Campaigns</Link>
        <Link to="/ledger" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Audit Ledger</Link>
        <Link to="/admin" style={{ color: '#38bdf8', textDecoration: 'none' }}>Admin Verification</Link>
      </div>
    </motion.nav>
  );
}
