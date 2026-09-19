// Loads everything we know about one campaign (used by Audit Explorer and Verify Ledger).
// Each request is separate, so one failing request does not break the others.
import {
  getCampaignDashboard,
  getCampaignDonations,
  getCampaignAllocations,
  getCampaignExpenses,
} from '../api/services';
import { toList, toObject } from './format';
import { normalizeDashboard, normalizeDonation, normalizeAllocation, normalizeExpense } from './normalize';

export async function loadCampaignLedger(campaignId) {
  const [dash, dons, allocs, exps] = await Promise.allSettled([
    getCampaignDashboard(campaignId),
    getCampaignDonations(campaignId),
    getCampaignAllocations(campaignId),
    getCampaignExpenses(campaignId),
  ]);

  const failed = [];
  const read = (result, label, convert) => {
    if (result.status === 'fulfilled') return convert(result.value);
    failed.push(label);
    return null;
  };

  return {
    dashboard: read(dash, 'dashboard', (d) => normalizeDashboard(toObject(d, 'dashboard'))),
    donations: read(dons, 'donations', (d) => toList(d, 'donations').map(normalizeDonation)),
    allocations: read(allocs, 'allocations', (d) => toList(d, 'allocations').map(normalizeAllocation)),
    expenses: read(exps, 'expenses', (d) => toList(d, 'expenses').map(normalizeExpense)),
    failed,
  };
}
