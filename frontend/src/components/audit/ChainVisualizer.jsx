import { motion } from 'motion/react';

const blocks = [
  { blockNumber: '#10482', hash: '0x8f...3a21', txCount: 14, timestamp: '2 mins ago' },
  { blockNumber: '#10483', hash: '0x4b...9e10', txCount: 8, timestamp: '1 min ago' },
  { blockNumber: '#10484', hash: '0x1c...7d82', txCount: 22, timestamp: 'Just now' },
];

export default function ChainVisualizer() {
  return (
    <div style={{ padding: '1.5rem 0' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#f8fafc' }}>
        🔗 Live Blockchain Verification Stream
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflowX: 'auto', padding: '0.5rem 0' }}>
        {blocks.map((block, index) => (
          <div key={block.blockNumber} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Block Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              whileHover={{ scale: 1.05, borderColor: '#38bdf8', boxShadow: '0 0 15px rgba(56, 189, 248, 0.25)' }}
              style={{
                minWidth: '220px',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{block.blockNumber}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{block.timestamp}</span>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                {block.hash}
              </p>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#1e293b', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#38bdf8', fontWeight: '500' }}>
                {block.txCount} Verified Txs
              </span>
            </motion.div>

            {/* Connecting Chain Line (Animated Pulse) */}
            {index < blocks.length - 1 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '40px' }}
                transition={{ duration: 0.3, delay: index * 0.15 + 0.2 }}
                style={{
                  height: '4px',
                  backgroundColor: '#38bdf8',
                  borderRadius: '2px',
                  boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)'
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}