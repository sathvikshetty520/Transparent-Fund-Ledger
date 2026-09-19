import { Link } from 'react-router-dom';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import FundProgress from './FundProgress';

// `campaign` is a normalized campaign. Extra buttons can be passed as children.
export default function CampaignCard({ campaign: c, children }) {
  return (
    <Card className="campaign-card">
      <div className="campaign-card-top">
        <Badge tone="neutral">{c.category}</Badge>
        <Badge status={c.status} />
      </div>
      <h3>
        <Link to={`/campaigns/${c.id}`}>{c.title}</Link>
      </h3>
      <p className="clamp">{c.description}</p>
      <FundProgress goal={c.goal} collected={c.collected} />
      {c.rejectionReason && <p className="note-error">Rejected: {c.rejectionReason}</p>}
      <div className="card-actions">
        <Button to={`/campaigns/${c.id}`} variant="secondary" size="sm">
          View
        </Button>
        {children}
      </div>
    </Card>
  );
}
