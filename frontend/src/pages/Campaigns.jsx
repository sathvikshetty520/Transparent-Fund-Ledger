import { useState } from 'react';
import useCampaigns from '../hooks/useCampaigns';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import CampaignCard from '../components/CampaignCard';

export default function Campaigns() {
  const { campaigns, loading, error } = useCampaigns({ interval: 8000 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const categories = [...new Set(campaigns.map((c) => c.category))];
  const shown = campaigns.filter(
    (c) =>
      (!category || c.category === category) &&
      (c.title + ' ' + c.description).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container page">
      <PageHeader title="Campaigns" subtitle="Pick a cause and see exactly where the money goes." />

      <div className="filters">
        <div className="field">
          <label htmlFor="search">Search</label>
          <input id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title or keyword" />
        </div>
        <div className="field">
          <label htmlFor="cat">Category</label>
          <select id="cat" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <LoadState loading={loading} error={error} label="Loading campaigns">
        {shown.length === 0 ? (
          <div className="empty">No campaigns match your search.</div>
        ) : (
          <div className="grid">
            {shown.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </LoadState>
    </div>
  );
}
