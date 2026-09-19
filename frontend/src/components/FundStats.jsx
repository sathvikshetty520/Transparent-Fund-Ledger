import { money } from '../utils/format';

// Six numbers every campaign dashboard shows. `d` is a normalized dashboard.
export default function FundStats({ d }) {
  const items = [
    { label: 'Goal', value: money(d.goal) },
    { label: 'Donations', value: money(d.donations) },
    { label: 'Allocated', value: money(d.allocated) },
    { label: 'Utilized', value: money(d.utilized) },
    { label: 'Remaining', value: money(d.remaining) },
    { label: 'Funding', value: `${Math.round(d.percent)}%` },
  ];
  return (
    <div className="stat-grid">
      {items.map((item) => (
        <div className="stat" key={item.label}>
          <span className="stat-label">{item.label}</span>
          <strong className="stat-value">{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
