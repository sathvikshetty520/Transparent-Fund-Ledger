 
import { useState } from 'react';
import { motion } from 'motion/react';

export default function DonateForm() {
  const [amount, setAmount] = useState('50');
  const presets = ['10', '25', '50', '100'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        maxWidth: '450px',
        margin: '0 auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
        Make a Direct Contribution
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        All contributions are directly logged onto the public audit ledger.
      </p>

      {/* Preset Amounts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {presets.map((preset) => (
          <motion.button
            key={preset}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAmount(preset)}
            style={{
              padding: '0.6rem',
              borderRadius: '8px',
              border: amount === preset ? '2px solid #0284c7' : '1px solid #cbd5e1',
              backgroundColor: amount === preset ? '#f0f9ff' : '#ffffff',
              color: amount === preset ? '#0284c7' : '#334155',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ${preset}
          </motion.button>
        ))}
      </div>

      {/* Custom Amount Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>
          Custom Amount ($)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter custom amount"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '1rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        style={{
          width: '100%',
          padding: '0.85rem',
          borderRadius: '8px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontWeight: '600',
          fontSize: '1rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
        }}
      >
        Confirm Donation
      </motion.button>
    </motion.div>
  );
}