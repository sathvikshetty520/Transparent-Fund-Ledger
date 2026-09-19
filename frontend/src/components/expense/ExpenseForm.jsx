import { motion } from 'motion/react';

export default function ExpenseForm() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        maxWidth: '500px',
        margin: '0 auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.25rem' }}>
        Log Expense Verification
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>
            Category
          </label>
          <input
            type="text"
            placeholder="e.g. Medical Supplies"
            style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>
            Amount ($)
          </label>
          <input
            type="number"
            placeholder="0.00"
            style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        style={{
          width: '100%',
          padding: '0.8rem',
          borderRadius: '8px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Submit to On-Chain Audit
      </motion.button>
    </motion.div>
  );
}