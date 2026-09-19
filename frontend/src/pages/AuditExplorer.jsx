import { motion } from 'motion/react';

export default function AuditExplorer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}
    >
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Audit Explorer</h1>
        <p style={{ color: '#64748b' }}>Real-time verified expenditure on chain</p>
      </header>

      {/* Animated Card Grid */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {[1, 2, 3].map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#fff',
            }}
          >
            <h3>Transaction #{item}</h3>
            <span style={{ fontSize: '0.875rem', color: '#10b981' }}>● Verified</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}