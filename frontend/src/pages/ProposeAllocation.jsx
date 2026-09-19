import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useLoad from '../hooks/useLoad';
import { getCampaign, proposeAllocation } from '../api/services';
import { errorMessage } from '../api/client';
import { toObject, money } from '../utils/format';
import { normalizeCampaign } from '../utils/normalize';
import { loadCampaignLedger } from '../utils/ledger';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import AllocationCard from '../components/AllocationCard';

export default function ProposeAllocation() {
  const { id } = useParams();
  const [form, setForm] = useState({ title: '', amount: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { data, loading, error, reload } = useLoad(async () => {
    const [raw, ledger] = await Promise.all([getCampaign(id), loadCampaignLedger(id)]);
    return { campaign: normalizeCampaign(toObject(raw, 'campaign')), ledger };
  }, [id]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const dash = data?.ledger.dashboard;
  const available = dash ? dash.donations - dash.allocated : null;

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setMessage({ type: 'error', text: 'Give the allocation a short title.' });
    if (!(Number(form.amount) > 0)) return setMessage({ type: 'error', text: 'Enter an amount greater than zero.' });
    if (available !== null && Number(form.amount) > available) {
      return setMessage({ type: 'error', text: `Only ${money(available)} is still unallocated.` });
    }
    setBusy(true);
    setMessage({ type: '', text: '' });
    try {
      await proposeAllocation(id, {
        purpose: form.title.trim(),
        amount: String(Number(form.amount)),
        ...(form.description.trim() ? { description: form.description.trim() } : {})
      });
      setForm({ title: '', amount: '', description: '' });
      setMessage({ type: 'success', text: 'Allocation proposed. An admin will review it.' });
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    }
    setBusy(false);
  }

  return (
    <div className="container page">
      <LoadState loading={loading} error={error} label="Loading campaign">
        {data && (
          <>
            <PageHeader title="Propose allocation" subtitle={data.campaign.title} />
            <div className="detail-grid">
              <Card>
                {message.text && <Alert type={message.type}>{message.text}</Alert>}
                {available !== null && (
                  <p className="muted">
                    Available to allocate: <strong>{money(available)}</strong>
                  </p>
                )}
                <form onSubmit={submit} noValidate>
                  <div className="field">
                    <label htmlFor="title">Title</label>
                    <input id="title" name="title" value={form.title} onChange={update} placeholder="e.g. Classroom furniture" />
                  </div>
                  <div className="field">
                    <label htmlFor="amount">Amount (₹)</label>
                    <input id="amount" name="amount" type="number" min="1" step="any" value={form.amount} onChange={update} />
                  </div>
                  <div className="field">
                    <label htmlFor="description">What will the money be used for?</label>
                    <textarea id="description" name="description" rows="4" value={form.description} onChange={update} />
                  </div>
                  <Button type="submit" loading={busy}>
                    Propose allocation
                  </Button>
                </form>
              </Card>

              <div>
                <h2>Existing allocations</h2>
                {!data.ledger.allocations || data.ledger.allocations.length === 0 ? (
                  <div className="empty">Nothing proposed yet.</div>
                ) : (
                  <div className="stack">
                    {data.ledger.allocations.map((a) => (
                      <AllocationCard key={a.id} allocation={a} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </LoadState>
    </div>
  );
}
