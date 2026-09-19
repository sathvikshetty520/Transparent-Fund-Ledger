import { Link, useParams } from 'react-router-dom';
import useLoad from '../hooks/useLoad';
import { useAuth } from '../context/AuthContext';
import { getCampaign } from '../api/services';
import { toObject, money, dateText } from '../utils/format';
import { normalizeCampaign } from '../utils/normalize';
import { loadCampaignLedger } from '../utils/ledger';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Table from '../components/Table';
import FundProgress from '../components/FundProgress';
import FundStats from '../components/FundStats';
import AllocationCard from '../components/AllocationCard';

const canDonate = (status) => !/DRAFT|PEND|SUBMIT|REJECT|CLOSED|COMPLETE/i.test(status);
const canPropose = canDonate;
const isApproved = (status) => /APPROV|ACTIVE/i.test(status);

export default function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, loading, error } = useLoad(async () => {
    const raw = await getCampaign(id);
    const ledger = await loadCampaignLedger(id);
    return { campaign: normalizeCampaign(toObject(raw, 'campaign')), ledger };
  }, [id]);

  return (
    <div className="container page">
      <LoadState loading={loading} error={error} label="Loading campaign">
        {data && <Detail campaign={data.campaign} ledger={data.ledger} user={user} />}
      </LoadState>
    </div>
  );
}

function Detail({ campaign: c, ledger, user }) {
  const isOwner = user?.role === 'ORGANIZER' && user.id === c.organizerId;
  const { dashboard, donations, allocations, expenses } = ledger;

  return (
    <>
      <PageHeader title={c.title} subtitle={c.organizerName ? `Organized by ${c.organizerName}` : undefined}>
        <Badge tone="neutral">{c.category}</Badge>
        <Badge status={c.status} />
      </PageHeader>

      <div className="detail-grid">
        <div>
          <p className="prewrap">{c.description}</p>
          {c.rejectionReason && <p className="note-error">Rejected: {c.rejectionReason}</p>}
        </div>

        <Card>
          <FundProgress goal={dashboard?.goal || c.goal} collected={dashboard?.donations ?? c.collected} />
          <div className="stack">
            {user?.role === 'CONTRIBUTOR' && canDonate(c.status) && <Button to={`/campaigns/${c.id}/donate`}>Donate to this campaign</Button>}
            {!user && <Button to="/login" state={{ from: `/campaigns/${c.id}/donate` }}>Log in to donate</Button>}
            {isOwner && (
              <>
                <Button to={`/organizer/campaigns/${c.id}/edit`} variant="secondary">
                  Edit campaign
                </Button>
                {canPropose(c.status) && (
                  <Button to={`/organizer/campaigns/${c.id}/allocate`} variant="secondary">
                    Propose allocation
                  </Button>
                )}
              </>
            )}
            <Button to={`/audit?campaign=${c.id}`} variant="ghost">
              Open in audit explorer
            </Button>
          </div>
        </Card>
      </div>

      {dashboard && (
        <section className="section">
          <h2>Funds at a glance</h2>
          <FundStats d={dashboard} />
        </section>
      )}

      <section className="section">
        <h2>Allocations</h2>
        {!allocations || allocations.length === 0 ? (
          <div className="empty">No allocations have been proposed yet.</div>
        ) : (
          <div className="grid">
            {allocations.map((a) => (
              <AllocationCard key={a.id} allocation={a}>
                {isOwner && isApproved(a.status) && (
                  <Button to={`/organizer/allocations/${a.id}/expense?campaign=${c.id}`} size="sm">
                    Submit expense
                  </Button>
                )}
              </AllocationCard>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Expenses</h2>
        <Table
          rows={expenses || []}
          empty="No expenses have been recorded yet."
          columns={[
            { key: 'spentAt', label: 'Date', render: (e) => dateText(e.spentAt) },
            { key: 'vendor', label: 'Vendor' },
            { key: 'description', label: 'Purpose' },
            { key: 'amount', label: 'Amount', numeric: true, render: (e) => money(e.amount) },
            { key: 'status', label: 'Status', render: (e) => <Badge status={e.status} /> },
            {
              key: 'receipt',
              label: 'Receipt',
              render: (e) =>
                e.receiptUrl ? (
                  <a href={e.receiptUrl} target="_blank" rel="noreferrer">
                    View
                  </a>
                ) : (
                  '-'
                ),
            },
          ]}
        />
      </section>

      <section className="section">
        <h2>Donations</h2>
        <Table
          rows={donations || []}
          empty={donations ? 'No donations yet. Be the first.' : 'Donations are not available for your account.'}
          columns={[
            { key: 'date', label: 'Date', render: (d) => dateText(d.date) },
            { key: 'donorName', label: 'Donor', render: (d) => d.donorName || 'Anonymous' },
            { key: 'amount', label: 'Amount', numeric: true, render: (d) => money(d.amount) },
          ]}
        />
      </section>

      <p className="muted small">
        Want to double-check the numbers? <Link to={`/verify?campaign=${c.id}`}>Verify this campaign's ledger</Link>.
      </p>
    </>
  );
}
