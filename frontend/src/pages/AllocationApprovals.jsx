import { useState } from 'react';
import useLoad from '../hooks/useLoad';
import { getPendingAllocations, approveAllocation, rejectAllocation } from '../api/services';
import { errorMessage } from '../api/client';
import { toList } from '../utils/format';
import { normalizeAllocation } from '../utils/normalize';
import PageHeader from '../components/PageHeader';
import AdminTabs from '../components/AdminTabs';
import LoadState from '../components/LoadState';
import AllocationCard from '../components/AllocationCard';
import Button from '../components/Button';
import Alert from '../components/Alert';
import ReasonModal from '../components/ReasonModal';

export default function AllocationApprovals() {
  const { data, loading, error, reload } = useLoad(getPendingAllocations, [], { interval: 5000 });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [rejecting, setRejecting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const allocations = toList(data, 'allocations').map(normalizeAllocation);

  async function approve(id) {
    setBusyId(id);
    try {
      await approveAllocation(id);
      setMessage({ type: 'success', text: 'Allocation approved.' });
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    }
    setBusyId(null);
  }

  async function reject(reason) {
    await rejectAllocation(rejecting, reason);
    setRejecting(null);
    setMessage({ type: 'success', text: 'Allocation rejected.' });
    reload();
  }

  return (
    <div className="container page">
      <PageHeader title="Allocation approvals" subtitle="Approve how campaign money will be used." />
      <AdminTabs />
      {message.text && <Alert type={message.type}>{message.text}</Alert>}
      <LoadState loading={loading} error={error} label="Loading allocations">
        {allocations.length === 0 ? (
          <div className="empty">No allocations are waiting for approval.</div>
        ) : (
          <div className="grid">
            {allocations.map((a) => (
              <AllocationCard key={a.id} allocation={a} showCampaign>
                <Button size="sm" loading={busyId === a.id} onClick={() => approve(a.id)}>
                  Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => setRejecting(a.id)}>
                  Reject
                </Button>
              </AllocationCard>
            ))}
          </div>
        )}
      </LoadState>
      {rejecting && <ReasonModal title="Reject allocation" onConfirm={reject} onClose={() => setRejecting(null)} />}
    </div>
  );
}
