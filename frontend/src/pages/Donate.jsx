import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useLoad from '../hooks/useLoad';
import { getCampaign } from '../api/services';
import { toObject } from '../utils/format';
import { normalizeCampaign, normalizeDonation } from '../utils/normalize';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import FundProgress from '../components/FundProgress';
import DonationForm from '../components/DonationForm';

export default function Donate() {
  const { campaignId } = useParams();
  const [donation, setDonation] = useState(null);
  const { data, loading, error } = useLoad(() => getCampaign(campaignId), [campaignId]);
  const campaign = data ? normalizeCampaign(toObject(data, 'campaign')) : null;

  return (
    <div className="container page narrow">
      <LoadState loading={loading} error={error} label="Loading campaign">
        {campaign && (
          <>
            <PageHeader title="Donate" subtitle={campaign.title} />
            {donation ? (
              <Card>
                <Alert type="success">Thank you. Your donation has been recorded.</Alert>
                <div className="stack">
                  {donation.id && <Button to={`/donations/${donation.id}/receipt`}>View receipt</Button>}
                  <Button to="/my-donations" variant="secondary">
                    My donations
                  </Button>
                  <Button to={`/campaigns/${campaign.id}`} variant="ghost">
                    Back to campaign
                  </Button>
                </div>
              </Card>
            ) : (
              <Card>
                <FundProgress goal={campaign.goal} collected={campaign.collected} />
                <hr className="divider" />
                <DonationForm campaignId={campaign.id} onSuccess={(result) => setDonation(normalizeDonation(toObject(result, 'donation')))} />
              </Card>
            )}
          </>
        )}
      </LoadState>
    </div>
  );
}
