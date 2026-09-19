import { Link } from 'react-router-dom';
import useLoad from '../hooks/useLoad';
import { getSummary, getPendingCampaigns, getPendingAllocations, getPendingExpenses } from '../api/services';
import { toList, toObject, summaryRows } from '../utils/format';
import PageHeader from '../components/PageHeader';
import AdminTabs from '../components/AdminTabs';
import LoadState from '../components/LoadState';
import Card from '../components/Card';

export default function AdminDashboard() {
  const summary = useLoad(getSummary);
  const pendingCampaigns = useLoad(getPendingCampaigns);
  const allocations = useLoad(getPendingAllocations);
  const expenses = useLoad(getPendingExpenses);

  const queues = [
    { to: '/admin/campaigns', label: 'Campaigns waiting', count: toList(pendingCampaigns.data, 'campaigns').length },
    { to: '/admin/allocations', label: 'Allocations waiting', count: toList(allocations.data, 'allocations').length },
    { to: '/admin/expenses', label: 'Expenses waiting', count: toList(expenses.data, 'expenses').length },
  ];
  const rows = summaryRows(toObject(summary.data, 'summary'));

  return (
    <div className="container page">
      <PageHeader title="Admin" subtitle="Review what organizers submit." />
      <AdminTabs />

      <div className="grid">
        {queues.map((q) => (
          <Card key={q.to} className="queue">
            <span className="stat-label">{q.label}</span>
            <strong className="queue-count">{q.count}</strong>
            <Link to={q.to}>Open queue</Link>
          </Card>
        ))}
      </div>

      <section className="section">
        <h2>Platform totals</h2>
        <LoadState loading={summary.loading} error={summary.error} label="Loading totals">
          <div className="stat-grid">
            {rows.map((r) => (
              <div className="stat" key={r.key}>
                <span className="stat-label">{r.label}</span>
                <strong className="stat-value">{r.value}</strong>
              </div>
            ))}
          </div>
        </LoadState>
      </section>
    </div>
  );
}
