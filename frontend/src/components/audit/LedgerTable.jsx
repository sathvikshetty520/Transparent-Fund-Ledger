import { motion } from 'motion/react';

const mockTransactions = [
  { id: 'Transaction #1', category: 'Medical Supplies Allocation', amount: '$4,200', status: 'Verified', txHash: '0x8f...3a21', date: '2 hours ago' },
  { id: 'Transaction #2', category: 'Clean Water Infrastructure', amount: '$1,850', status: 'Verified', txHash: '0x4b...9e10', date: '5 hours ago' },
  { id: 'Transaction #3', category: 'Logistics & Transport', amount: '$600', status: 'Verified', txHash: '0x1c...7d82', date: '1 day ago' },
];

export default function LedgerTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mockTransactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.12 }}
            whileHover={{ y: -3, boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.08)' }}
            whileTap={{ scale: 0.99 }}
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                {tx.id}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {tx.category} • <span style={{ fontFamily: 'monospace' }}>{tx.txHash}</span>
              </p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#16a34a'
              }}>
                ● {tx.status}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                {tx.amount}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                {tx.date}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}