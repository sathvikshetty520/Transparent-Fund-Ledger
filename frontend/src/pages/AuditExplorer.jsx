import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useLoad from '../hooks/useLoad';
import useCampaigns from '../hooks/useCampaigns';
import { loadCampaignLedger } from '../utils/ledger';
import { money, dateText, shortId } from '../utils/format';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import CampaignPicker from '../components/CampaignPicker';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Alert from '../components/Alert';

const FILTERS = ['All', 'Donation', 'Allocation', 'Expense'];

export default function AuditExplorer() {
  const [params, setParams] = useSearchParams();
  const { campaigns, loading: listLoading, error: listError } = useCampaigns({ interval: 6000 });
  const [filter, setFilter] = useState('All');

  const selected = params.get('campaign') || campaigns[0]?.id;
  const ledger = useLoad(() => (selected ? loadCampaignLedger(selected) : null), [selected], { interval: 6000 });

  // Put donations, allocations and expenses into one list, newest first
  let entries = [];
  if (ledger.data) {
    const { donations, allocations, expenses } = ledger.data;
    entries = [
      ...(donations || []).map((d) => ({ id: 'd' + d.id, type: 'Donation', date: d.date, detail: d.donorName || 'Anonymous donor', amount: d.amount, status: d.status, ref: d.hash || d.id })),
      ...(allocations || []).map((a) => ({ id: 'a' + a.id, type: 'Allocation', date: a.date, detail: a.title, amount: a.amount, status: a.status, ref: a.hash || a.id })),
      ...(expenses || []).map((e) => ({ id: 'e' + e.id, type: 'Expense', date: e.spentAt, detail: [e.vendor, e.description].filter(Boolean).join(': '), amount: e.amount, status: e.status, ref: e.hash || e.id })),
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }
  const shown = entries.filter((e) => filter === 'All' || e.type === filter);

  return (
    <div className="container page">
      <PageHeader title="Audit explorer" subtitle="Every donation, allocation and expense for a campaign in one list." />

      <LoadState loading={listLoading} error={listError} label="Loading campaigns">
        {campaigns.length === 0 ? (
          <div className="empty">There are no campaigns to audit yet.</div>
        ) : (
          <>
            <div className="filters">
              <CampaignPicker campaigns={campaigns} value={selected} onChange={(id) => setParams({ campaign: id })} />
              <div className="field">
                <label htmlFor="type">Show</label>
                <select id="type" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  {FILTERS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <LoadState loading={ledger.loading} error={ledger.error} label="Loading records">
              {ledger.data?.failed.length > 0 && <Alert type="info">Could not load: {ledger.data.failed.join(', ')}. Some of these need you to be logged in.</Alert>}
              <Table
                rows={shown}
                empty="No records for this campaign yet."
                columns={[
                  { key: 'date', label: 'Date', render: (e) => dateText(e.date) },
                  { key: 'type', label: 'Type', render: (e) => <Badge tone={e.type === 'Donation' ? 'good' : e.type === 'Allocation' ? 'warn' : 'neutral'}>{e.type}</Badge> },
                  { key: 'detail', label: 'Details' },
                  { key: 'amount', label: 'Amount', numeric: true, render: (e) => money(e.amount) },
                  { key: 'status', label: 'Status', render: (e) => <Badge status={e.status} /> },
                  { key: 'ref', label: 'Reference', render: (e) => <code title={String(e.ref)}>{shortId(e.ref)}</code> },
                ]}
              />
            </LoadState>
          </>
        )}
      </LoadState>
    </div>
  );
}
