import { Link } from 'react-router-dom';
import useLoad from '../hooks/useLoad';
import { getMyDonations } from '../api/services';
import { toList, money, dateText } from '../utils/format';
import { normalizeDonation } from '../utils/normalize';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function MyDonations() {
  const { data, loading, error } = useLoad(getMyDonations, [], { interval: 6000 });
  const donations = toList(data, 'donations').map(normalizeDonation);
  const total = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="container page">
      <PageHeader title="My donations" subtitle={donations.length ? `You have given ${money(total)} in total.` : undefined}>
        <Button to="/campaigns" variant="secondary">
          Find a campaign
        </Button>
      </PageHeader>
      <LoadState loading={loading} error={error} label="Loading your donations">
        <Table
          rows={donations}
          empty="You have not donated yet."
          columns={[
            { key: 'date', label: 'Date', render: (d) => dateText(d.date) },
            {
              key: 'campaign',
              label: 'Campaign',
              render: (d) => (d.campaignId ? <Link to={`/campaigns/${d.campaignId}`}>{d.campaignTitle || 'View campaign'}</Link> : d.campaignTitle || '-'),
            },
            { key: 'amount', label: 'Amount', numeric: true, render: (d) => money(d.amount) },
            { key: 'status', label: 'Status', render: (d) => <Badge status={d.status} /> },
            { key: 'receipt', label: '', render: (d) => <Link to={`/donations/${d.id}/receipt`}>Receipt</Link> },
          ]}
        />
      </LoadState>
    </div>
  );
}
