import Card from './Card';
import Badge from './Badge';
import { money, dateText } from '../utils/format';

// `allocation` is a normalized allocation. Action buttons can be passed as children.
export default function AllocationCard({ allocation: a, showCampaign = false, children }) {
  return (
    <Card className="allocation-card">
      <div className="allocation-head">
        <h3>{a.title}</h3>
        <Badge status={a.status} />
      </div>
      {showCampaign && a.campaignTitle && <p className="muted small">Campaign: {a.campaignTitle}</p>}
      {a.description && <p>{a.description}</p>}
      <div className="allocation-amount">
        <strong>{money(a.amount)}</strong>
        <span className="muted small">{dateText(a.date)}</span>
      </div>
      {a.rejectionReason && <p className="note-error">Rejected: {a.rejectionReason}</p>}
      {children && <div className="card-actions">{children}</div>}
    </Card>
  );
}
