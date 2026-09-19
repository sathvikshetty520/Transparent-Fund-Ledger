import { useState } from 'react';
import useLoad from '../hooks/useLoad';
import { getMyCampaigns, submitCampaign } from '../api/services';
import { toList } from '../utils/format';
import { normalizeCampaign } from '../utils/normalize';
import { errorMessage } from '../api/client';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import CampaignCard from '../components/CampaignCard';
import Button from '../components/Button';
import Alert from '../components/Alert';

const isEditable = (status) => /DRAFT|REJECT/i.test(status);
const isLive = (status) => !/DRAFT|PEND|SUBMIT|REJECT|CLOSED|COMPLETE/i.test(status);

export default function MyCampaigns() {
  const { data, loading, error, reload } = useLoad(getMyCampaigns);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [busyId, setBusyId] = useState(null);

  const mine = toList(data, 'campaigns').map(normalizeCampaign);

  async function submitForApproval(id) {
    setBusyId(id);
    try {
      await submitCampaign(id);
      setMessage({ type: 'success', text: 'Campaign sent to the admin for approval.' });
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    }
    setBusyId(null);
  }

  return (
    <div className="container page">
      <PageHeader title="My campaigns" subtitle="Create, edit and submit your campaigns for approval.">
        <Button to="/organizer/campaigns/new">New campaign</Button>
      </PageHeader>

      {message.text && <Alert type={message.type}>{message.text}</Alert>}

      <LoadState loading={loading} error={error} label="Loading your campaigns">
        {mine.length === 0 ? (
          <div className="empty">
            You have no campaigns yet. <br />
            <Button to="/organizer/campaigns/new" variant="secondary" className="mt">
              Create your first campaign
            </Button>
          </div>
        ) : (
          <div className="grid">
            {mine.map((c) => (
              <CampaignCard key={c.id} campaign={c}>
                {isEditable(c.status) && (
                  <>
                    <Button to={`/organizer/campaigns/${c.id}/edit`} variant="secondary" size="sm">
                      Edit
                    </Button>
                    <Button size="sm" loading={busyId === c.id} onClick={() => submitForApproval(c.id)}>
                      Submit for approval
                    </Button>
                  </>
                )}
                {isLive(c.status) && (
                  <Button to={`/organizer/campaigns/${c.id}/allocate`} size="sm">
                    Propose allocation
                  </Button>
                )}
              </CampaignCard>
            ))}
          </div>
        )}
      </LoadState>
    </div>
  );
}
