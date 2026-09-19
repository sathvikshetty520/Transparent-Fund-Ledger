import { money } from '../utils/format';

export default function FundProgress({ goal, collected }) {
  const raw = goal > 0 ? (collected / goal) * 100 : 0;
  const width = Math.min(100, raw);
  return (
    <div className="fund">
      <div className="fund-figures">
        <div>
          <span>Collected</span>
          <strong>{money(collected)}</strong>
        </div>
        <div>
          <span>Goal</span>
          <strong>{money(goal)}</strong>
        </div>
      </div>
      <div className="fund-bar" role="progressbar" aria-valuenow={Math.round(raw)} aria-valuemin="0" aria-valuemax="100">
        <span style={{ width: `${width}%` }} />
      </div>
      <div className="fund-pct">{Math.round(raw)}% funded</div>
    </div>
  );
}
