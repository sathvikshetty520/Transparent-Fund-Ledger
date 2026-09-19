// Dropdown used on the dashboard, audit and verify pages.
export default function CampaignPicker({ campaigns, value, onChange }) {
  return (
    <div className="field picker">
      <label htmlFor="campaign-picker">Campaign</label>
      <select id="campaign-picker" value={value || ''} onChange={(e) => onChange(e.target.value)}>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
    </div>
  );
}
