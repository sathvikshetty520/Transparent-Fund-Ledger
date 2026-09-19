import { humanize } from '../utils/format';

function toneFor(status) {
  const s = String(status || '').toUpperCase();
  if (/REJECT|FAIL|CANCEL/.test(s)) return 'danger';
  if (/PEND|SUBMIT|DRAFT|REVIEW/.test(s)) return 'warn';
  if (/APPROV|ACTIVE|VERIFIED|COMPLETE|SUCCESS|PAID|LIVE/.test(s)) return 'good';
  return 'neutral';
}

// <Badge status="PENDING_APPROVAL" />  -> colour picked from the status
// <Badge tone="neutral">Education</Badge> -> plain text badge
export default function Badge({ status, tone, children }) {
  const t = tone || toneFor(status);
  return <span className={`badge badge-${t}`}>{children ?? humanize(status)}</span>;
}
