 import { motion } from 'motion/react';

export default function FundFlowChart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        marginBottom: '1rem'
      }}
    >
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '1rem' }}>
        🌊 Fund Flow Allocation
      </h3>
      <div style={{ height: '200px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Fund Flow Sankey / Node Chart
      </div>
    </motion.div>
  );
}
