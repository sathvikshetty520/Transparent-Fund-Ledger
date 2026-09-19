import { useState } from 'react';
import useLoad from '../hooks/useLoad';
import { getPendingExpenses, verifyExpense, rejectExpense } from '../api/services';
import { errorMessage } from '../api/client';
import { toList, money, dateText } from '../utils/format';
import { normalizeExpense } from '../utils/normalize';
import PageHeader from '../components/PageHeader';
import AdminTabs from '../components/AdminTabs';
import LoadState from '../components/LoadState';
import Table from '../components/Table';
import Button from '../components/Button';
import Alert from '../components/Alert';
import ReasonModal from '../components/ReasonModal';

export default function ExpenseVerification() {
  const { data, loading, error, reload } = useLoad(getPendingExpenses, [], { interval: 5000 });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [rejecting, setRejecting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const expenses = toList(data, 'expenses').map(normalizeExpense);

  async function verify(id) {
    setBusyId(id);
    try {
      await verifyExpense(id);
      setMessage({ type: 'success', text: 'Expense verified.' });
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    }
    setBusyId(null);
  }

  async function reject(reason) {
    await rejectExpense(rejecting, reason);
    setRejecting(null);
    setMessage({ type: 'success', text: 'Expense rejected.' });
    reload();
  }

  return (
    <div className="container page">
      <PageHeader title="Expense verification" subtitle="Open each receipt and check it matches the amount and vendor." />
      <AdminTabs />
      {message.text && <Alert type={message.type}>{message.text}</Alert>}
      <LoadState loading={loading} error={error} label="Loading expenses">
        <Table
          rows={expenses}
          empty="No expenses are waiting for verification."
          columns={[
            { key: 'spentAt', label: 'Date', render: (e) => dateText(e.spentAt) },
            { key: 'vendor', label: 'Vendor' },
            { key: 'description', label: 'Purpose' },
            { key: 'campaignTitle', label: 'Campaign', render: (e) => e.campaignTitle || e.allocationTitle || '-' },
            { key: 'amount', label: 'Amount', numeric: true, render: (e) => money(e.amount) },
            {
              key: 'receipt',
              label: 'Receipt',
              render: (e) =>
                e.receiptUrl ? (
                  <a href={e.receiptUrl} target="_blank" rel="noreferrer">
                    Open
                  </a>
                ) : (
                  'None'
                ),
            },
            {
              key: 'actions',
              label: 'Decision',
              render: (e) => (
                <div className="row-actions">
                  <Button size="sm" loading={busyId === e.id} onClick={() => verify(e.id)}>
                    Verify
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRejecting(e.id)}>
                    Reject
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </LoadState>
      {rejecting && <ReasonModal title="Reject expense" onConfirm={reject} onClose={() => setRejecting(null)} />}
    </div>
  );
}
