import { useState } from 'react';
import useLoad from '../hooks/useLoad';
import { getPendingCampaigns, approveCampaign, rejectCampaign } from '../api/services';
import { toList } from '../utils/format';
import { normalizeCampaign } from '../utils/normalize';
import { errorMessage } from '../api/client';
import PageHeader from '../components/PageHeader';
import AdminTabs from '../components/AdminTabs';
import LoadState from '../components/LoadState';
import CampaignCard from '../components/CampaignCard';
import Button from '../components/Button';
import Alert from '../components/Alert';
import ReasonModal from '../components/ReasonModal';

export default function CampaignApprovals() {
  const { data, loading, error, reload } = useLoad(getPendingCampaigns, [], { interval: 5000 });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [rejecting, setRejecting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const pending = toList(data, 'campaigns').map(normalizeCampaign);

  async function approve(id) {
    setBusyId(id);
    try {
      await approveCampaign(id);
      setMessage({ type: 'success', text: 'Campaign approved. It is now live.' });
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    }
    setBusyId(null);
  }

  async function reject(reason) {
    await rejectCampaign(rejecting, reason);
    setRejecting(null);
    setMessage({ type: 'success', text: 'Campaign rejected.' });
    reload();
  }

  return (
    <div className="container page">
      <PageHeader title="Campaign approvals" subtitle="Campaigns that organizers have submitted for review." />
      <AdminTabs />
      {message.text && <Alert type={message.type}>{message.text}</Alert>}
      <LoadState loading={loading} error={error} label="Loading campaigns">
        {pending.length === 0 ? (
          <div className="empty">No campaigns are waiting for approval.</div>
        ) : (
          <div className="grid">
            {pending.map((c) => (
              <CampaignCard key={c.id} campaign={c}>
                <Button size="sm" loading={busyId === c.id} onClick={() => approve(c.id)}>
                  Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => setRejecting(c.id)}>
                  Reject
                </Button>
              </CampaignCard>
            ))}
          </div>
        )}
      </LoadState>
      {rejecting && <ReasonModal title="Reject campaign" onConfirm={reject} onClose={() => setRejecting(null)} />}
    </div>
  );
}
