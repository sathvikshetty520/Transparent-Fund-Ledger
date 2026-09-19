import { useState } from 'react';
import Button from './Button';
import Alert from './Alert';
import { errorMessage } from '../api/client';

const CATEGORIES = ['Education', 'Healthcare', 'Environment', 'Disaster relief', 'Community', 'Other'];

// Used by both Create Campaign and Edit Campaign.
// `onSave(values)` must return a promise.
export default function CampaignForm({ initial, submitLabel, onSave }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    category: initial?.category || CATEGORIES[0],
    goalAmount: initial?.goal || '',
    description: initial?.description || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (form.title.trim().length < 3) return setError('Title must contain at least 3 characters.');
    if (!(Number(form.goalAmount) > 0)) return setError('Enter a goal amount greater than zero.');
    if (form.description.trim().length < 10) return setError('Description must contain at least 10 characters.');

    setBusy(true);
    setError('');
    try {
      await onSave({
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        goalAmount: String(Number(form.goalAmount)),
      });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && <Alert type="error">{error}</Alert>}
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" value={form.title} onChange={update} />
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={update}>
            {[...new Set([form.category, ...CATEGORIES])].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="goalAmount">Goal (₹)</label>
          <input id="goalAmount" name="goalAmount" type="number" min="1" step="any" value={form.goalAmount} onChange={update} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows="6" value={form.description} onChange={update} />
      </div>
      <Button type="submit" loading={busy}>
        {submitLabel}
      </Button>
    </form>
  );
}
