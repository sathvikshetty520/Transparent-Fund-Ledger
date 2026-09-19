import { useSearchParams } from 'react-router-dom';
import useLoad from '../hooks/useLoad';
import useCampaigns from '../hooks/useCampaigns';
import { getSummary, getCampaignDashboard } from '../api/services';
import { toObject, summaryRows, money } from '../utils/format';
import { normalizeDashboard } from '../utils/normalize';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import Card from '../components/Card';
import FundStats from '../components/FundStats';
import BarChart from '../components/BarChart';
import CampaignPicker from '../components/CampaignPicker';
import Table from '../components/Table';
import Alert from '../components/Alert';
import { Link } from 'react-router-dom';

export default function PublicDashboard() {
  const [params, setParams] = useSearchParams();
  const summary = useLoad(getSummary);
  const { campaigns, loading: listLoading, error: listError } = useCampaigns();

  const selected = params.get('campaign') || campaigns[0]?.id;
  const dash = useLoad(() => (selected ? getCampaignDashboard(selected) : null), [selected]);
  const d = normalizeDashboard(toObject(dash.data, 'dashboard'));
  const rows = summaryRows(toObject(summary.data, 'summary'));

  return (
    <div className="container page">
      <PageHeader title="Public dashboard" subtitle="Live numbers from the whole platform and from each campaign." />

      <h2>Platform totals</h2>
      <LoadState loading={summary.loading} error={summary.error} label="Loading totals">
        {rows.length === 0 ? (
          <div className="empty">No totals yet.</div>
        ) : (
          <div className="stat-grid">
            {rows.map((r) => (
              <div className="stat" key={r.key}>
                <span className="stat-label">{r.label}</span>
                <strong className="stat-value">{r.value}</strong>
              </div>
            ))}
          </div>
        )}
      </LoadState>

      <section className="section">
        <h2>By campaign</h2>
        <LoadState loading={listLoading} error={listError} label="Loading campaigns">
          {campaigns.length === 0 ? (
            <div className="empty">No campaigns yet.</div>
          ) : (
            <>
              <CampaignPicker campaigns={campaigns} value={selected} onChange={(id) => setParams({ campaign: id })} />
              <LoadState loading={dash.loading} error={dash.error} label="Loading dashboard">
                {d && (
                  <>
                    <FundStats d={d} />
                    <Card title="Where the money stands" className="chart-card">
                      <BarChart
                        items={[
                          { label: 'Goal', value: d.goal },
                          { label: 'Donations', value: d.donations },
                          { label: 'Allocated', value: d.allocated },
                          { label: 'Utilized', value: d.utilized },
                          { label: 'Remaining', value: d.remaining },
                        ]}
                      />
                    </Card>
                  </>
                )}
              </LoadState>
            </>
          )}
        </LoadState>
      </section>

      {campaigns.length > 0 && (
        <section className="section">
          <h2>All campaigns</h2>
          <Table
            rows={campaigns}
            columns={[
              { key: 'title', label: 'Campaign', render: (c) => <Link to={`/campaigns/${c.id}`}>{c.title}</Link> },
              { key: 'goal', label: 'Goal', numeric: true, render: (c) => money(c.goal) },
              { key: 'collected', label: 'Collected', numeric: true, render: (c) => money(c.collected) },
              { key: 'pct', label: 'Funded', numeric: true, render: (c) => `${c.goal > 0 ? Math.round((c.collected / c.goal) * 100) : 0}%` },
            ]}
          />
        </section>
      )}
      {selected && dash.error && <Alert type="info">Dashboard numbers for a campaign may need you to be logged in.</Alert>}
    </div>
  );
}
