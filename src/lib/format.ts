import type { CurrencyCode, Market } from "./site";

const localeOf: Record<CurrencyCode, string> = { GBP: "en-GB", USD: "en-US" };
const formatters = new Map<CurrencyCode, Intl.NumberFormat>();

export function formatMoney(n: number, currency: CurrencyCode) {
  let f = formatters.get(currency);
  if (!f) {
    f = new Intl.NumberFormat(localeOf[currency], { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 2 });
    formatters.set(currency, f);
  }
  return f.format(n);
}

export const shippingFor = (subtotal: number, market: Market) =>
  subtotal === 0 || subtotal >= market.freeShippingThreshold ? 0 : market.shippingFlat;

