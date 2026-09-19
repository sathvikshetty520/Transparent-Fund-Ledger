import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'motion/react';

// Import existing audit and campaign components
import LedgerTable from './components/audit/LedgerTable';
import ChainVisualizer from './components/audit/ChainVisualizer';
import DonateForm from './components/donation/DonateForm';
import ExpenseForm from './components/expense/ExpenseForm';
import FundFlowChart from './components/charts/FundFlowChart';

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <Link to="/" style={{ fontSize: '1.25rem', fontWeight: '700', color: '#38bdf8', textDecoration: 'none', marginRight: '2rem' }}>
        💎 FundLedger
      </Link>
      <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: '500' }}>Ledger</Link>
        <Link to="/donate" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>Donate</Link>
        <Link to="/expense" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>Log Expense</Link>
        <Link to="/charts" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>Analytics</Link>
      </div>
    </motion.nav>
  );

}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc' }}>
        <Navbar />
        <main style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={
              <>
                <ChainVisualizer />
                <LedgerTable />
              </>
            } />
            <Route path="/ledger" element={
              <>
                <ChainVisualizer />
                <LedgerTable />
              </>
            } />
            <Route path="/donate" element={<DonateForm />} />
            <Route path="/expense" element={<ExpenseForm />} />
            <Route path="/charts" element={<FundFlowChart />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}