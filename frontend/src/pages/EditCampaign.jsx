import { useNavigate, useParams } from 'react-router-dom';
import useLoad from '../hooks/useLoad';
import { getCampaign, updateCampaign } from '../api/services';
import { toObject } from '../utils/format';
import { normalizeCampaign } from '../utils/normalize';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import Card from '../components/Card';
import CampaignForm from '../components/CampaignForm';

export default function EditCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useLoad(() => getCampaign(id), [id]);
  const campaign = data ? normalizeCampaign(toObject(data, 'campaign')) : null;

  async function save(values) {
    await updateCampaign(id, values);
    navigate('/organizer/campaigns');
  }

  return (
    <div className="container page narrow">
      <PageHeader title="Edit campaign" />
      <LoadState loading={loading} error={error} label="Loading campaign">
        {campaign && (
          <Card>
            <CampaignForm initial={campaign} submitLabel="Save changes" onSave={save} />
          </Card>
        )}
      </LoadState>
    </div>
  );
}
