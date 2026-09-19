import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import { errorMessage } from '../api/client';

// Asks the admin for a reason, then calls onConfirm(reason).
export default function ReasonModal({ title, confirmLabel = 'Reject', onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Write a short reason so the organizer knows what to fix.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onConfirm(reason.trim());
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit}>
        {error && <Alert type="error">{error}</Alert>}
        <div className="field">
          <label htmlFor="reason">Reason</label>
          <textarea id="reason" rows="4" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
        </div>
        <div className="row-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
