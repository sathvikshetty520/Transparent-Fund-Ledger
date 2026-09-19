import { useState } from 'react';
import Button from './Button';
import Alert from './Alert';
import { donate } from '../api/services';
import { errorMessage } from '../api/client';
import { money } from '../utils/format';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export default function DonationForm({ campaignId, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await donate(campaignId, { amount: String(value) });
      onSuccess(result);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && <Alert type="error">{error}</Alert>}
      <div className="field">
        <label htmlFor="amount">Amount (₹)</label>
        <input id="amount" type="number" min="1" step="any" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" />
      </div>
      <div className="chips">
        {QUICK_AMOUNTS.map((q) => (
          <button type="button" key={q} className="chip" onClick={() => setAmount(String(q))}>
            {money(q)}
          </button>
        ))}
      </div>
      <Button type="submit" loading={busy}>
        Donate {Number(amount) > 0 ? money(amount) : ''}
      </Button>
    </form>
  );
}
