 import { motion } from 'motion/react';

export default function CampaignCard({ campaign, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      style={{
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        cursor: 'pointer'
      }}
    >
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
        {campaign?.title || 'Sample Fund Campaign'}
      </h3>
      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
        {campaign?.description || 'Transparent public ledger tracking for community funds.'}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', color: '#0284c7' }}>
          ${campaign?.raised || '5,000'} / ${campaign?.target || '10,000'}
        </span>
        <button style={{
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer'
        }}>
          View Details
        </button>
      </div>
    </motion.div>
  );
}
