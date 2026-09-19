import useLoad from '../hooks/useLoad';
import useCampaigns from '../hooks/useCampaigns';
import { getSummary } from '../api/services';
import { toObject, summaryRows } from '../utils/format';
import Button from '../components/Button';
import CampaignCard from '../components/CampaignCard';
import LedgerRows from '../components/LedgerRows';
import Spinner from '../components/Spinner';

const STEPS = [
  { title: 'Donate', text: 'Contributors give to an approved campaign and get a receipt.' },
  { title: 'Allocate', text: 'Organizers propose how the money will be used. Admins approve.' },
  { title: 'Spend', text: 'Every expense is uploaded with its receipt.' },
  { title: 'Verify', text: 'Admins check the receipt, and anyone can audit the result.' },
];

export default function Home() {
  const summary = useLoad(getSummary, [], { interval: 8000 });
  const { campaigns, loading: campaignsLoading } = useCampaigns({ interval: 8000 });
  const rows = summaryRows(toObject(summary.data, 'summary'));
  const featured = campaigns.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Every rupee, on the record.</h1>
            <p className="lead">
              Donate to a campaign, see how the money is allocated, and check each expense against its receipt. Nothing is hidden.
            </p>
            <div className="hero-actions">
              <Button to="/campaigns">Browse campaigns</Button>
              <Button to="/verify" variant="secondary">
                Verify the ledger
              </Button>
            </div>
          </div>

          <div className="ledger-panel">
            <h2>Platform ledger</h2>
            {summary.loading && <Spinner label="Loading totals" />}
            {summary.error && <p className="note-error">{summary.error}</p>}
            {!summary.loading && !summary.error && <LedgerRows rows={rows} />}
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>How your money moves</h2>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Latest campaigns</h2>
          <Button to="/campaigns" variant="ghost">
            See all
          </Button>
        </div>
        {campaignsLoading ? (
          <Spinner label="Loading campaigns" />
        ) : featured.length === 0 ? (
          <div className="empty">No campaigns are live yet.</div>
        ) : (
          <div className="grid">
            {featured.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
