/** Store-wide settings. Edit these to rebrand or change commercial terms. */
export type MarketCode = "GB" | "US";
export type CurrencyCode = "GBP" | "USD";

export interface Market {
  code: MarketCode;
  label: string;
  flag: string;
  currency: CurrencyCode;
  locale: string;
  /** Countries a customer can ship to from this market, as [ISO code, name]. */
  countries: [string, string][];
  /** Orders at or above this subtotal ship free. */
  freeShippingThreshold: number;
  /** Flat shipping fee below the threshold. */
  shippingFlat: number;
}

/** The markets you sell in. A visitor sees prices in one market's currency at a time. */
export const markets: Record<MarketCode, Market> = {
  GB: {
    code: "GB",
    label: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    locale: "en-GB",
    countries: [["GB", "United Kingdom"]],
    freeShippingThreshold: 60,
    shippingFlat: 4.99,
  },
  US: {
    code: "US",
    label: "United States",
    flag: "🇺🇸",
    currency: "USD",
    locale: "en-US",
    countries: [["US", "United States"]],
    freeShippingThreshold: 75,
    shippingFlat: 6,
  },
};

/** Shown to visitors whose location can't be worked out. */
export const defaultMarket: MarketCode = "GB";

/**
 * Value of 1 US dollar in each currency. Only used to price products that
 * have no explicit price for a market (see `prices` in products.ts).
 */
export const exchangeRates: Record<CurrencyCode, number> = { USD: 1, GBP: 0.78 };

export const site = {
  name: "Zydane",
  tagline: "Considered essentials for everyday living",
  description:
    "Zydane designs its own line of everyday essentials and curates the best finds from independent makers worldwide.",
  supportEmail: "hello@zydane.com",
} as const;

export const fulfilment = {
  house: {
    label: "Zydane Line",
    short: "Our own design",
    shipping: "Ships within 24 hours from our warehouse",
    delivery: "Delivered in 2–4 business days",
  },
  curated: {
    label: "Curated Find",
    short: "Sourced from a partner maker",
    shipping: "Ships direct from our partner within 3 days",
    delivery: "Delivered in 6–12 business days",
  },
} as const;
