import { useEffect, useMemo, useState } from 'react';
import { readCampaigns, subscribeCampaigns } from '../../lib/campaignStore';
import { getActiveCampaigns } from '../../lib/pricing';
import type { Campaign } from '../../types';

export function useActiveCampaigns(): Campaign[] {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => readCampaigns());

  useEffect(() => {
    const refresh = (): void => setCampaigns(readCampaigns());
    return subscribeCampaigns(refresh);
  }, []);

  return useMemo(() => getActiveCampaigns(campaigns), [campaigns]);
}
