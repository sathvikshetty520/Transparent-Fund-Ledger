import useLoad from './useLoad';
import { getCampaigns } from '../api/services';
import { toList } from '../utils/format';
import { normalizeCampaign } from '../utils/normalize';

export default function useCampaigns(options = {}) {
  const query = useLoad(() => getCampaigns(), [], options);
  const campaigns = toList(query.data, 'campaigns').map(normalizeCampaign);
  return { ...query, campaigns };
}
