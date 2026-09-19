import { money } from '../utils/format';

// Simple horizontal bars made with plain CSS. items: [{ label, value }]
export default function BarChart({ items }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="bars">
      {items.map((item) => (
        <div className="bar-row" key={item.label}>
          <span className="bar-label">{item.label}</span>
          <div className="bar-track">
            <span className={`bar-fill bar-${item.label.toLowerCase()}`} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <span className="bar-value">{money(item.value)}</span>
        </div>
      ))}
    </div>
  );
}
