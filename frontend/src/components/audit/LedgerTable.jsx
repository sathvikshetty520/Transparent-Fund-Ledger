 import { motion } from 'motion/react';

const mockTransactions = [
  { id: 'TX-1092', category: 'Medical Equipment', amount: '$4,200', status: 'VERIFIED', txHash: '0x8f...3a21' },
  { id: 'TX-1093', category: 'Clean Water Pumps', amount: '$1,850', status: 'VERIFIED', txHash: '0x4b...9e10' },
  { id: 'TX-1094', category: 'Logistics & Transport', amount: '$600', status: 'PENDING', txHash: '0x1c...7d82' },
  { id: 'TX-1095', category: 'School Supplies', amount: '$2,100', status: 'VERIFIED', txHash: '0x9a...2b11' },
];

export default function LedgerTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a' }}>
          🛡️ Public Audit Ledger
        </h1>
        <p style={{ color: '#64748b' }}>
          Real-time, cryptographically verified fund allocations.
        </p>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '1rem' }}>TX ID</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>On-Chain Hash</th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map((tx, index) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ backgroundColor: '#f1f5f9' }}
                style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
              >
                <td style={{ padding: '1rem', fontWeight: '600' }}>{tx.id}</td>
                <td style={{ padding: '1rem' }}>{tx.category}</td>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#0f172a' }}>{tx.amount}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: tx.status === 'VERIFIED' ? '#dcfce7' : '#fef3c7',
                    color: tx.status === 'VERIFIED' ? '#15803d' : '#b45309'
                  }}>
                    ● {tx.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#64748b' }}>{tx.txHash}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
