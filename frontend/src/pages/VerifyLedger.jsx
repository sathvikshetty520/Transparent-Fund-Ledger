import { useSearchParams } from 'react-router-dom';
import useLoad from '../hooks/useLoad';
import useCampaigns from '../hooks/useCampaigns';
import { loadCampaignLedger } from '../utils/ledger';
import { money } from '../utils/format';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import CampaignPicker from '../components/CampaignPicker';
import Card from '../components/Card';
import Badge from '../components/Badge';

const sum = (list) => list.reduce((total, item) => total + item.amount, 0);
const same = (a, b) => Math.abs(a - b) < 0.01;

// Compares the dashboard totals with the individual records.
// A check is "skip" when the data needed for it could not be loaded.
function runChecks({ dashboard, donations, allocations, expenses }) {
  const checks = [];
  const add = (title, ok, detail) => checks.push({ title, result: ok === null ? 'skip' : ok ? 'pass' : 'fail', detail });

  if (dashboard && donations) {
    const total = sum(donations.filter((d) => !/FAIL|REJECT/i.test(d.status)));
    add('Donation records add up to the dashboard total', same(total, dashboard.donations), `Records: ${money(total)}. Dashboard: ${money(dashboard.donations)}.`);
  } else add('Donation records add up to the dashboard total', null, 'Donation records were not available.');

  if (dashboard && allocations) {
    const total = sum(allocations.filter((a) => /APPROV|ACTIVE|UTILI|COMPLETE/i.test(a.status)));
    add('Approved allocations add up to the dashboard total', same(total, dashboard.allocated), `Records: ${money(total)}. Dashboard: ${money(dashboard.allocated)}.`);
  } else add('Approved allocations add up to the dashboard total', null, 'Allocation records were not available.');

  if (dashboard && expenses) {
    const total = sum(expenses.filter((e) => /VERIFIED/i.test(e.status)));
    add('Verified expenses add up to the utilized total', same(total, dashboard.utilized), `Records: ${money(total)}. Dashboard: ${money(dashboard.utilized)}.`);
  } else add('Verified expenses add up to the utilized total', null, 'Expense records were not available.');

  if (dashboard) {
    add('Allocated is not more than donations', dashboard.allocated <= dashboard.donations + 0.01, `Allocated ${money(dashboard.allocated)}, donations ${money(dashboard.donations)}.`);
    add('Utilized is not more than allocated', dashboard.utilized <= dashboard.allocated + 0.01, `Utilized ${money(dashboard.utilized)}, allocated ${money(dashboard.allocated)}.`);
  }

  if (expenses) {
    const verified = expenses.filter((e) => /VERIFIED/i.test(e.status));
    const missing = verified.filter((e) => !e.receiptUrl).length;
    add('Every verified expense has a receipt', missing === 0, missing === 0 ? `${verified.length} verified expense(s) checked.` : `${missing} verified expense(s) have no receipt file.`);
  }
  return checks;
}

export default function VerifyLedger() {
  const [params, setParams] = useSearchParams();
  const { campaigns, loading: listLoading, error: listError } = useCampaigns({ interval: 6000 });
  const selected = params.get('campaign') || campaigns[0]?.id;
  const ledger = useLoad(() => (selected ? loadCampaignLedger(selected) : null), [selected], { interval: 6000 });

  const checks = ledger.data ? runChecks(ledger.data) : [];
  const failed = checks.filter((c) => c.result === 'fail').length;
  const passed = checks.filter((c) => c.result === 'pass').length;

  return (
    <div className="container page">
      <PageHeader title="Verify ledger" subtitle="Check that the totals shown on the dashboard match the individual records." />

      <LoadState loading={listLoading} error={listError} label="Loading campaigns">
        {campaigns.length === 0 ? (
          <div className="empty">There are no campaigns to verify yet.</div>
        ) : (
          <>
            <CampaignPicker campaigns={campaigns} value={selected} onChange={(id) => setParams({ campaign: id })} />
            <LoadState loading={ledger.loading} error={ledger.error} label="Running checks">
              {checks.length > 0 && (
                <>
                  <Card className={failed ? 'verdict verdict-bad' : 'verdict verdict-good'}>
                    <h2>{failed ? `${failed} check(s) did not match` : 'All available checks passed'}</h2>
                    <p className="muted">
                      {passed} passed, {failed} failed, {checks.length - passed - failed} skipped.
                    </p>
                  </Card>
                  <ul className="checks">
                    {checks.map((c) => (
                      <li key={c.title} className="check">
                        <div>
                          <strong>{c.title}</strong>
                          <p className="muted small">{c.detail}</p>
                        </div>
                        <Badge tone={c.result === 'pass' ? 'good' : c.result === 'fail' ? 'danger' : 'neutral'}>{c.result === 'pass' ? 'Match' : c.result === 'fail' ? 'Mismatch' : 'Skipped'}</Badge>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </LoadState>
          </>
        )}
      </LoadState>
    </div>
  );
}
