/**
 * Location: api/src/commerce-and-transactions/shared/currency.util.ts
 *
 * Regional pricing utilities.
 *
 * Strategy: prices are stored in KES (base). When a user visits from Uganda,
 * the API reads their IP → country → currency, then returns the price from
 * product.regionalPricing[currency]. If no regional price is stored yet,
 * it falls back to the KES price so nothing ever breaks.
 *
 * Admin sets prices in KES. The "Auto-convert" button in the admin UI calls
 * computeRegionalPrices() to pre-fill all other currencies using stored rates.
 * Rates are NOT fetched live on every request — they're stored in the DB and
 * refreshed via a scheduled job (or manually by admin) to keep prices stable.
 */

// ── Approximate rates relative to 1 KES ──────────────────────────────────────
// Update these periodically via a cron job hitting exchangerate-api.com etc.
// Stored here as fallback defaults only.
export const DEFAULT_RATES: Record<string, number> = {
  KES: 1,
  UGX: 28.5,      // 1 KES ≈ 28.5 UGX
  TZS: 19.8,      // 1 KES ≈ 19.8 TZS
  USD: 0.0077,    // 1 KES ≈ 0.0077 USD
  GBP: 0.0061,    // 1 KES ≈ 0.0061 GBP
  EUR: 0.0071,    // 1 KES ≈ 0.0071 EUR
  ZAR: 0.14,      // 1 KES ≈ 0.14 ZAR
};

// Maps country code → preferred currency
export const COUNTRY_CURRENCY: Record<string, string> = {
  KE: 'KES',
  UG: 'UGX',
  TZ: 'TZS',
  RW: 'USD',
  ET: 'USD',
  NG: 'USD',
  ZA: 'ZAR',
  GB: 'GBP',
  US: 'USD',
  CA: 'USD',
  AU: 'USD',
  DE: 'EUR',
  FR: 'EUR',
  NL: 'EUR',
};

// Currency display config
export const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string; decimals: number }> = {
  KES: { symbol: 'KSh', locale: 'en-KE', decimals: 0 },
  UGX: { symbol: 'USh', locale: 'en-UG', decimals: 0 },
  TZS: { symbol: 'TSh', locale: 'sw-TZ', decimals: 0 },
  USD: { symbol: '$',   locale: 'en-US', decimals: 2 },
  GBP: { symbol: '£',   locale: 'en-GB', decimals: 2 },
  EUR: { symbol: '€',   locale: 'de-DE', decimals: 2 },
  ZAR: { symbol: 'R',   locale: 'en-ZA', decimals: 2 },
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RegionalPriceEntry {
  currency: string;
  price: number;
  salePrice: number | null;
  exchangeRate: number;
  rateSetAt: Date;
}

export interface ResolvedPrice {
  currency: string;
  symbol: string;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  formatted: string;           // e.g. "KSh 12,500"
  formattedSale: string | null;// e.g. "KSh 9,800"
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format a number as a price string for a given currency */
export function formatPrice(amount: number, currency: string): string {
  const config = CURRENCY_CONFIG[currency];
  if (!config) return `${currency} ${amount}`;
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);
  } catch {
    return `${config.symbol}${amount.toLocaleString()}`;
  }
}

/** Convert a KES price to another currency using stored or default rates */
export function convertFromKes(kesPrice: number, targetCurrency: string, rates = DEFAULT_RATES): number {
  const rate = rates[targetCurrency] ?? 1;
  const converted = kesPrice * rate;
  // Round sensibly — no decimals for African shillings
  const decimals = CURRENCY_CONFIG[targetCurrency]?.decimals ?? 2;
  return decimals === 0 ? Math.round(converted) : Math.round(converted * 100) / 100;
}

/**
 * Pre-compute regional prices for all supported currencies from a KES base price.
 * Called by admin "Auto-convert" and by the product create endpoint.
 */
export function computeRegionalPrices(
  baseKes: number,
  salePriceKes: number | null,
  rates = DEFAULT_RATES,
): RegionalPriceEntry[] {
  return Object.keys(rates).map(currency => ({
    currency,
    price:        convertFromKes(baseKes, currency, rates),
    salePrice:    salePriceKes != null ? convertFromKes(salePriceKes, currency, rates) : null,
    exchangeRate: rates[currency],
    rateSetAt:    new Date(),
  }));
}

/**
 * Resolve the best price for a product given the visitor's country code.
 * Falls back gracefully: regionalPricing → KES base → USD conversion.
 */
export function resolvePrice(
  product: {
    basePrice: number;
    salePrice?: number | null;
    onSale?: boolean;
    regionalPricing?: RegionalPriceEntry[];
  },
  countryCode: string,
): ResolvedPrice {
  const targetCurrency = COUNTRY_CURRENCY[countryCode.toUpperCase()] ?? 'USD';

  // Try stored regional price first
  const regional = product.regionalPricing?.find(r => r.currency === targetCurrency);

  const price     = regional?.price     ?? convertFromKes(product.basePrice, targetCurrency);
  const salePrice = regional?.salePrice ?? (product.salePrice ? convertFromKes(product.salePrice, targetCurrency) : null);
  const onSale    = product.onSale ?? (salePrice !== null && salePrice < price);

  return {
    currency:      targetCurrency,
    symbol:        CURRENCY_CONFIG[targetCurrency]?.symbol ?? targetCurrency,
    price,
    salePrice,
    onSale,
    formatted:     formatPrice(price, targetCurrency),
    formattedSale: salePrice != null ? formatPrice(salePrice, targetCurrency) : null,
  };
}