export interface PromoData {
  code: string;
  subtitle: string;
  used: number;
  total: number;
  discountAed?: number;
  discountPct?: number;
}

// Mock list of available promos. Replace with backend fetch when available.
export const AVAILABLE_PROMOS: PromoData[] = [
  { code: "MYLAUNDRY25", subtitle: "AED 50 off on 3 laundry orders!", used: 1, total: 11, discountAed: 50 },
  { code: "FIRSTORDER10", subtitle: "10% off your first order", used: 0, total: 1, discountPct: 10 },
  { code: "WEEKEND15", subtitle: "AED 15 off weekend orders", used: 1, total: 3, discountAed: 15 },
];

// Codes already applied to in-progress orders (single-use de-dupe).
// TODO: populate from backend when wired up.
export const ALREADY_APPLIED_CODES = new Set<string>();

export function calculatePromoDiscount(code: string | null, itemsTotal: number): number {
  if (!code) return 0;
  const promo = AVAILABLE_PROMOS.find((p) => p.code === code);
  if (!promo) return 0;
  let amount = 0;
  if (promo.discountAed) amount = promo.discountAed;
  else if (promo.discountPct) amount = (itemsTotal * promo.discountPct) / 100;
  return Math.min(amount, itemsTotal);
}