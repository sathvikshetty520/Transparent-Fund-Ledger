import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import useLoad from '../hooks/useLoad';
import { getCampaignAllocations } from '../api/services';
import { toList } from '../utils/format';
import { normalizeAllocation } from '../utils/normalize';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import AllocationCard from '../components/AllocationCard';
import ExpenseForm from '../components/ExpenseForm';

export default function SubmitExpense() {
  const { allocationId } = useParams();
  const [params] = useSearchParams();
  const campaignId = params.get('campaign');
  const [done, setDone] = useState(false);

  // Show which allocation this expense belongs to (needs ?campaign=ID in the link)
  const { data } = useLoad(() => (campaignId ? getCampaignAllocations(campaignId) : null), [campaignId]);
  const allocation = toList(data, 'allocations').map(normalizeAllocation).find((a) => a.id === allocationId);
  const back = campaignId ? `/campaigns/${campaignId}` : '/organizer/campaigns';

  return (
    <div className="container page narrow">
      <PageHeader title="Submit expense" subtitle="Upload the receipt. An admin will verify it." />
      {allocation && <AllocationCard allocation={allocation} />}
      <Card className="mt">
        {done ? (
          <>
            <Alert type="success">Expense submitted. It will appear as pending until an admin verifies it.</Alert>
            <Button to={back}>Back to campaign</Button>
          </>
        ) : (
          <>
            <ExpenseForm allocationId={allocationId} onSuccess={() => setDone(true)} />
            <p className="muted small">
              <Link to={back}>Cancel</Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
