import type { Campaign, CartItem, Product } from '../types';

export interface ProductPricing {
  campaign?: Campaign;
  discountPercent: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export interface CartPricing {
  subtotal: number;
  discount: number;
  total: number;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getActiveCampaigns(campaigns: Campaign[], now = Date.now()): Campaign[] {
  return campaigns.filter((campaign) => campaign.active && campaign.startAt <= now && campaign.endAt > now);
}

export function getBestCampaignForProduct(productId: string, campaigns: Campaign[], now = Date.now()): Campaign | undefined {
  return getActiveCampaigns(campaigns, now)
    .filter((campaign) => campaign.productIds.includes(productId) && (campaign.discountPercent ?? 0) > 0)
    .reduce<Campaign | undefined>((bestCampaign, campaign) => {
      if (!bestCampaign || (campaign.discountPercent ?? 0) > (bestCampaign.discountPercent ?? 0)) return campaign;
      return bestCampaign;
    }, undefined);
}

export function getProductPricing(product: Product, campaigns: Campaign[], now = Date.now()): ProductPricing {
  const campaign = getBestCampaignForProduct(product.id, campaigns, now);
  const discountPercent = campaign?.discountPercent ?? 0;
  const finalPrice = roundCurrency(product.price * (1 - discountPercent / 100));

  return {
    campaign,
    discountPercent,
    originalPrice: product.price,
    discountAmount: roundCurrency(product.price - finalPrice),
    finalPrice,
  };
}

export function calculateCartPricing(items: CartItem[], campaigns: Campaign[], now = Date.now()): CartPricing {
  const { subtotal, discount } = items.reduce(
    (totals, item) => {
      const pricing = getProductPricing(item.product, campaigns, now);
      return {
        subtotal: totals.subtotal + pricing.originalPrice * item.quantity,
        discount: totals.discount + pricing.discountAmount * item.quantity,
      };
    },
    { subtotal: 0, discount: 0 },
  );

  const roundedSubtotal = roundCurrency(subtotal);
  const roundedDiscount = roundCurrency(discount);
  return { subtotal: roundedSubtotal, discount: roundedDiscount, total: roundCurrency(roundedSubtotal - roundedDiscount) };
}
