import { useState } from 'react';
import Button from './Button';
import Alert from './Alert';
import { submitExpense } from '../api/services';
import { errorMessage } from '../api/client';

export default function ExpenseForm({ allocationId, onSuccess }) {
  const [form, setForm] = useState({ amount: '', vendor: '', description: '', spentAt: '' });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e) {
    e.preventDefault();
    if (!(Number(form.amount) > 0)) return setError('Enter the amount you spent.');
    if (!form.vendor.trim()) return setError('Enter the vendor or shop name.');
    if (!form.spentAt) return setError('Choose the date of the expense.');
    if (!file) return setError('Attach the receipt (image or PDF).');

    // multipart/form-data: FormData sets the Content-Type header for us
    const data = new FormData();
    data.append('amount', form.amount);
    data.append('vendor', form.vendor.trim());
    data.append('description', form.description.trim());
    data.append('spentAt', form.spentAt);
    data.append('receipt', file);

    setBusy(true);
    setError('');
    try {
      await submitExpense(allocationId, data);
      onSuccess();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && <Alert type="error">{error}</Alert>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="amount">Amount (₹)</label>
          <input id="amount" name="amount" type="number" min="1" step="any" value={form.amount} onChange={update} />
        </div>
        <div className="field">
          <label htmlFor="spentAt">Date spent</label>
          <input id="spentAt" name="spentAt" type="date" max={today} value={form.spentAt} onChange={update} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="vendor">Vendor</label>
        <input id="vendor" name="vendor" value={form.vendor} onChange={update} placeholder="Shop or supplier name" />
      </div>
      <div className="field">
        <label htmlFor="description">What was it for?</label>
        <textarea id="description" name="description" rows="3" value={form.description} onChange={update} />
      </div>
      <div className="field">
        <label htmlFor="receipt">Receipt</label>
        <input id="receipt" type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0] || null)} />
      </div>
      <Button type="submit" loading={busy}>
        Submit expense
      </Button>
    </form>
  );
}
