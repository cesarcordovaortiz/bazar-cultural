import type { Campaign } from '../types';

const STORAGE_KEY = 'bazar_campaigns_v1';
const SEED_VERSION_KEY = 'bazar_campaigns_seed_version';
const SEED_VERSION = '2';
const CHANGE_EVENT = 'bazar-campaigns-changed';
const DAY = 86_400_000;

function createSeedCampaigns(now = Date.now()): Campaign[] {
  return [
    { id: 'campaign-welcome', name: 'Bienvenida cultural', productIds: ['prod-1', 'prod-2'], startAt: now - DAY, endAt: now + 30 * DAY, discountPercent: 10, active: true },
    { id: 'campaign-books-memory', name: 'Libros y memorias vivas', productIds: ['prod-5', 'prod-6', 'prod-17', 'prod-20'], startAt: now - 2 * DAY, endAt: now + 12 * DAY, discountPercent: 15, active: true },
    { id: 'campaign-music-roots', name: 'Sonidos de raíz', productIds: ['prod-7', 'prod-8', 'prod-19'], startAt: now - 3 * DAY, endAt: now + 9 * DAY, discountPercent: 20, active: true },
    { id: 'campaign-graphic-art', name: 'Arte gráfico para compartir', productIds: ['prod-11', 'prod-12', 'prod-18'], startAt: now - DAY, endAt: now + 18 * DAY, discountPercent: 12, active: true },
    { id: 'campaign-original-pieces', name: 'Piezas originales de taller', productIds: ['prod-13', 'prod-14', 'prod-15', 'prod-16'], startAt: now - 4 * DAY, endAt: now + 6 * DAY, discountPercent: 8, active: true },
    { id: 'campaign-cinema-programmed', name: 'Encuentro de cine comunitario', productIds: ['prod-9', 'prod-10'], startAt: now + 7 * DAY, endAt: now + 17 * DAY, discountPercent: 18, active: true },
    { id: 'campaign-photography-ended', name: 'Semana de la fotografía', productIds: ['prod-20'], startAt: now - 21 * DAY, endAt: now - 7 * DAY, discountPercent: 10, active: true },
    { id: 'campaign-archive-paused', name: 'Selección de archivo', productIds: ['prod-3', 'prod-4'], startAt: now - DAY, endAt: now + 20 * DAY, discountPercent: 5, active: false },
  ];
}

function persistCampaigns(campaigns: Campaign[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

function addMissingSeedCampaigns(campaigns: Campaign[], force = false): Campaign[] {
  if (!force && localStorage.getItem(SEED_VERSION_KEY) === SEED_VERSION) return campaigns;

  const campaignIds = new Set(campaigns.map((campaign) => campaign.id));
  const missingCampaigns = createSeedCampaigns().filter((campaign) => !campaignIds.has(campaign.id));
  const mergedCampaigns = [...campaigns, ...missingCampaigns];
  persistCampaigns(mergedCampaigns);
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
  return mergedCampaigns;
}

export function readCampaigns(): Campaign[] {
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) return addMissingSeedCampaigns([], true);

  try {
    const campaigns = JSON.parse(value) as Campaign[];
    return Array.isArray(campaigns) ? addMissingSeedCampaigns(campaigns) : addMissingSeedCampaigns([]);
  } catch {
    return addMissingSeedCampaigns([], true);
  }
}

function notify(): void {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveCampaign(campaign: Campaign): void {
  const campaigns = readCampaigns();
  const exists = campaigns.some((item) => item.id === campaign.id);
  persistCampaigns(exists ? campaigns.map((item) => item.id === campaign.id ? campaign : item) : [campaign, ...campaigns]);
  notify();
}

export function deleteCampaign(campaignId: string): void {
  persistCampaigns(readCampaigns().filter((campaign) => campaign.id !== campaignId));
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
