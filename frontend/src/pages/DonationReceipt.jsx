import { useParams } from 'react-router-dom';
import useLoad from '../hooks/useLoad';
import { getReceipt } from '../api/services';
import { toObject, humanize, money, dateText } from '../utils/format';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import Card from '../components/Card';
import Button from '../components/Button';
import LedgerRows from '../components/LedgerRows';

// Show one receipt field as readable text
function display(key, value) {
  if (value && typeof value === 'object') return value.title ?? value.name ?? value.email ?? null;
  if (/date|At$/i.test(key)) return dateText(value);
  if (/amount/i.test(key) && !isNaN(value)) return money(value);
  return String(value);
}

export default function DonationReceipt() {
  const { id } = useParams();
  const { data, loading, error } = useLoad(() => getReceipt(id), [id]);

  // Turn whatever the backend sends into label/value rows (skip internal fields)
  const receipt = toObject(data, 'receipt');
  const rows = Object.entries(receipt || {})
    .filter(([k, v]) => !k.startsWith('_') && k !== 'id' && k !== '__v' && v !== null && v !== '')
    .map(([k, v]) => ({ label: humanize(k), value: display(k, v) }))
    .filter((r) => r.value !== null);

  return (
    <div className="container page narrow">
      <PageHeader title="Donation receipt">
        <Button variant="secondary" className="no-print" onClick={() => window.print()}>
          Print
        </Button>
      </PageHeader>
      <LoadState loading={loading} error={error} label="Loading receipt">
        <Card className="receipt">
          <LedgerRows rows={rows} />
          <p className="muted small">Keep this receipt for your records. Anyone can check the donation in the audit explorer.</p>
        </Card>
      </LoadState>
    </div>
  );
}
