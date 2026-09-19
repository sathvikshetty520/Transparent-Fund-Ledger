import useLoad from './useLoad';
import { getCampaigns } from '../api/services';
import { toList } from '../utils/format';
import { normalizeCampaign } from '../utils/normalize';

export default function useCampaigns() {
  const query = useLoad(() => getCampaigns());
  const campaigns = toList(query.data, 'campaigns').map(normalizeCampaign);
  return { ...query, campaigns };
}
