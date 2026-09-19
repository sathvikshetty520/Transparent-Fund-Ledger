import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../api/services';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import CampaignForm from '../components/CampaignForm';

export default function CreateCampaign() {
  const navigate = useNavigate();

  async function save(values) {
    await createCampaign(values);
    navigate('/organizer/campaigns');
  }

  return (
    <div className="container page narrow">
      <PageHeader title="Create campaign" subtitle="It starts as a draft. Submit it for approval when you are ready." />
      <Card>
        <CampaignForm submitLabel="Save draft" onSave={save} />
      </Card>
    </div>
  );
}
