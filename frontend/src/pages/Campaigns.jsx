import React, { useEffect, useState } from 'react';
import { getCampaigns } from "../services/campaign.service";
import { formatCurrency } from "../utils/format";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCampaigns().then((data) => {
      setCampaigns(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading campaigns...</p>;

  return (
    <div>
      <h2>Campaigns Explorer</h2>
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {campaigns.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p><strong>Goal:</strong> {formatCurrency(item.targetAmount)} | <strong>Raised:</strong> {formatCurrency(item.raisedAmount)}</p>
            <p><small>Organizer: {item.organizer}</small></p>
          </div>
        ))}
      </div>
    </div>
  );
}