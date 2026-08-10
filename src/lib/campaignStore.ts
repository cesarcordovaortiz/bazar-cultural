import type { Campaign } from '../types';

const STORAGE_KEY = 'bazar_campaigns_v1';
const CHANGE_EVENT = 'bazar-campaigns-changed';

const initialCampaigns: Campaign[] = [
  { id: 'campaign-welcome', name: 'Bienvenida cultural', productIds: ['prod-1', 'prod-2'], startAt: Date.now(), endAt: Date.now() + 30 * 86_400_000, discountPercent: 10, active: true },
];

export function readCampaigns(): Campaign[] {
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCampaigns));
    return initialCampaigns;
  }
  try {
    return JSON.parse(value) as Campaign[];
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCampaigns));
    return initialCampaigns;
  }
}

function notify(): void {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveCampaign(campaign: Campaign): void {
  const campaigns = readCampaigns();
  const exists = campaigns.some((item) => item.id === campaign.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exists ? campaigns.map((item) => item.id === campaign.id ? campaign : item) : [campaign, ...campaigns]));
  notify();
}

export function deleteCampaign(campaignId: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readCampaigns().filter((campaign) => campaign.id !== campaignId)));
  notify();
}

export function subscribeCampaigns(listener: () => void): () => void {
  const handleChange = (): void => listener();
  window.addEventListener(CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleChange);
  return (): void => {
    window.removeEventListener(CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleChange);
  };
}
