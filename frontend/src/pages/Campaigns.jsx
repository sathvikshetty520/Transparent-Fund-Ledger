import { motion } from 'motion/react';
import CampaignCard from '../components/campaign/CampaignCard';

export default function Campaigns() {
  const campaignsList = [
    { id: 1, title: 'Clean Water Initiative', raised: '8,200', target: '10,000' },
    { id: 2, title: 'Community School Tech', raised: '4,500', target: '6,000' },
    { id: 3, title: 'Medical Equipment Fund', raised: '12,000', target: '15,000' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Active Campaigns
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {campaignsList.map((campaign, index) => (
          <CampaignCard key={campaign.id} campaign={campaign} index={index} />
        ))}
      </div>
    </motion.div>
  );
}