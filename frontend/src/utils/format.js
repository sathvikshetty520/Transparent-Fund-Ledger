export function money(value) {
  const n = Number(value) || 0;
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function dateText(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// "PENDING_APPROVAL" -> "Pending approval", "totalDonations" -> "Total donations"
export function humanize(text) {
  const s = String(text ?? '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}

// Return the first field in `keys` that exists on obj
export function pick(obj, keys, fallback) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return fallback;
}

// The backend may answer with [..] or { campaigns: [..] } or { data: [..] }
export function toList(data, key) {
  const options = [data, data?.data, data?.[key], data?.data?.[key], data?.items, data?.results];
  return options.find(Array.isArray) || [];
}

// The backend may answer with {..} or { campaign: {..} } or { data: {..} }
export function toObject(data, key) {
  if (!data) return {};
  return data[key] ?? data.data?.[key] ?? data.data ?? data;
}

export function shortId(id) {
  const s = String(id ?? '');
  return s.length > 10 ? s.slice(0, 4) + '…' + s.slice(-4) : s;
}

// Turns a summary object like { totalDonations: 500, campaigns: 3 } into rows for display
export function summaryRows(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj)
    .filter(([k, v]) => !k.startsWith('_') && v !== '' && v !== null && typeof v !== 'object' && typeof v !== 'boolean' && !isNaN(v))
    .map(([key, v]) => {
      let value;
      if (/percent/i.test(key)) value = Number(v).toFixed(1) + '%';
      else if (/amount|donation|alloc|util|remain|goal|raised|spent|fund|balance/i.test(key) && !/count|campaigns|donors|users|number/i.test(key)) value = money(v);
      else value = Number(v).toLocaleString('en-IN');
      return { key, label: humanize(key), value };
    });
}
