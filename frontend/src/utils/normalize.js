// The UI only reads data through these functions.
// If your backend uses different field names, add them to the lists below.
import { pick } from './format';
import { FILE_ORIGIN } from '../api/client';

function num(v) {
  if (v && typeof v === 'object' && v.$numberDecimal) return Number(v.$numberDecimal) || 0;
  return Number(v) || 0;
}

function refId(ref) {
  return ref && typeof ref === 'object' ? ref._id ?? ref.id : ref;
}

function refName(ref, keys = ['title', 'name']) {
  return ref && typeof ref === 'object' ? pick(ref, keys, '') : '';
}

export function fileUrl(path) {
  if (!path) return '';
  const p = typeof path === 'object' ? path.url ?? path.path ?? '' : path;
  if (!p) return '';
  return /^https?:/.test(p) ? p : FILE_ORIGIN + (p.startsWith('/') ? p : '/' + p);
}

export function normalizeUser(raw = {}) {
  return {
    id: raw._id ?? raw.id,
    name: raw.name ?? raw.fullName ?? raw.email ?? 'User',
    email: raw.email ?? '',
    role: String(raw.role ?? '').toUpperCase(),
  };
}

export function normalizeCampaign(raw = {}) {
  const s = { ...raw, ...(raw.stats || {}), ...(raw.summary || {}) };
  const organizer = pick(raw, ['organizer', 'organizerId', 'createdBy', 'owner']);
  return {
    id: raw._id ?? raw.id,
    title: pick(raw, ['title', 'name'], 'Untitled campaign'),
    category: raw.category ?? 'General',
    description: raw.description ?? '',
    status: raw.status ?? 'DRAFT',
    goal: num(pick(s, ['goalAmount', 'goal', 'targetAmount', 'target'])),
    collected: num(pick(s, ['collectedAmount', 'totalDonations', 'raisedAmount', 'amountCollected', 'totalRaised', 'currentAmount', 'raised'])),
    organizerId: refId(organizer),
    organizerName: refName(organizer, ['name', 'fullName']),
    rejectionReason: raw.rejectionReason ?? raw.reason ?? '',
  };
}

export function normalizeDashboard(data) {
  if (!data) return null;
  const d = { ...data, ...(data.data || {}), ...(data.totals || {}), ...(data.stats || {}), ...(data.dashboard || {}), ...(data.fundSummary || {}), ...(data.summary || {}) };
  const goal = num(pick(d, ['goal', 'goalAmount', 'targetAmount']));
  const donations = num(pick(d, ['donations', 'totalDonations', 'collected', 'collectedAmount', 'totalRaised', 'raised']));
  const allocated = num(pick(d, ['allocated', 'totalAllocated', 'allocatedAmount', 'approvedAllocations']));
  const utilized = num(pick(d, ['utilized', 'totalUtilized', 'utilizedAmount', 'spent', 'totalSpent', 'verifiedExpenses', 'totalExpenses']));
  const remaining = num(pick(d, ['unspentFunds', 'unallocatedFunds', 'remaining', 'remainingAmount', 'remainingFunds', 'available'], donations - utilized));
  const percent = num(pick(d, ['percentFunded', 'fundingPercentage', 'fundingPercent', 'percentage', 'percent'], goal > 0 ? (donations / goal) * 100 : 0));
  return { goal, donations, allocated, utilized, remaining, percent };
}

export function normalizeDonation(raw = {}) {
  const campaign = pick(raw, ['campaign', 'campaignId']);
  const donor = pick(raw, ['donor', 'contributor', 'user', 'donorId']);
  return {
    id: raw._id ?? raw.id,
    amount: num(raw.amount),
    status: raw.status ?? 'COMPLETED',
    date: pick(raw, ['createdAt', 'donatedAt', 'date']),
    campaignId: refId(campaign),
    campaignTitle: refName(campaign),
    donorName: refName(donor, ['name', 'fullName']) || (raw.isAnonymous || raw.anonymous ? 'Anonymous' : ''),
    hash: pick(raw, ['hash', 'txHash', 'ledgerHash'], ''),
  };
}

export function normalizeAllocation(raw = {}) {
  const campaign = pick(raw, ['campaign', 'campaignId']);
  return {
    id: raw._id ?? raw.id,
    title: pick(raw, ['title', 'purpose', 'name'], 'Allocation'),
    description: raw.description ?? '',
    amount: num(raw.amount),
    status: raw.status ?? 'PENDING',
    date: pick(raw, ['createdAt', 'date']),
    campaignId: refId(campaign),
    campaignTitle: refName(campaign),
    rejectionReason: raw.rejectionReason ?? raw.reason ?? '',
    hash: pick(raw, ['hash', 'ledgerHash'], ''),
  };
}

export function normalizeExpense(raw = {}) {
  const allocation = pick(raw, ['allocation', 'allocationId']);
  const campaign = pick(raw, ['campaign', 'campaignId'], allocation && typeof allocation === 'object' ? allocation.campaign ?? allocation.campaignId : undefined);
  return {
    id: raw._id ?? raw.id,
    amount: num(raw.amount),
    vendor: raw.vendor ?? '',
    description: raw.description ?? '',
    status: raw.status ?? 'PENDING',
    spentAt: pick(raw, ['spentAt', 'date', 'createdAt']),
    receiptUrl: fileUrl(pick(raw, ['receiptUrl', 'receipt', 'receiptPath', 'receiptFile', 'fileUrl'])),
    allocationId: refId(allocation),
    allocationTitle: refName(allocation),
    campaignTitle: refName(campaign),
    rejectionReason: raw.rejectionReason ?? raw.reason ?? '',
    hash: pick(raw, ['hash', 'ledgerHash'], ''),
  };
}
