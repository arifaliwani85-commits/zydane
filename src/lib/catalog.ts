import "server-only";
import { cache } from "react";
import { products as builtIn, type Product } from "./products";
import { exchangeRates, markets, type CurrencyCode, type MarketCode } from "./site";
import { fetchWooProducts } from "./woo";

/** A product with its price worked out for one market. */
export type MarketProduct = Product & { available: boolean; comingSoon: boolean };

/** Converts between currencies and rounds to a friendly price ending in .99. */
export function convert(amount: number, from: CurrencyCode, to: CurrencyCode) {
  if (from === to) return amount;
  const converted = (amount / exchangeRates[from]) * exchangeRates[to];
  return Math.max(0.99, Math.round(converted) - 0.01);
}

function forMarket(p: Product, code: MarketCode): MarketProduct {
  const { currency } = markets[code];
  const from = p.baseCurrency ?? "USD";
  const explicit = p.prices?.[currency];
  const price = explicit ? explicit.price : convert(p.price, from, currency);
  const compareAt = explicit ? explicit.compareAt : p.compareAt ? convert(p.compareAt, from, currency) : undefined;
  return {
    ...p,
    price,
    compareAt: compareAt && compareAt > price ? compareAt : undefined,
    baseCurrency: currency,
    available: !p.markets || p.markets.includes(code),
    comingSoon: Boolean(p.sample),
  };
}

/**
 * Every product, priced for one market. Your own Zydane Line products come
 * from products.ts; Curated Finds come from the AliDropship back office, or
 * from the samples in products.ts until it is connected.
 */
const getAll = cache(async (code: MarketCode): Promise<MarketProduct[]> => {
  const house = builtIn.filter((p) => p.source === "house");
  const woo = await fetchWooProducts();
  const curated = woo && woo.length > 0 ? woo : builtIn.filter((p) => p.source === "curated");
  return [...house, ...curated].map((p) => forMarket(p, code));
});

/** The products shown to a visitor in this market, including any marked "Coming soon". */
export async function getCatalog(code: MarketCode): Promise<MarketProduct[]> {
  return (await getAll(code)).filter((p) => p.available);
}

/** Only the products a visitor in this market can actually buy. */
export async function getBuyable(code: MarketCode): Promise<MarketProduct[]> {
  return (await getCatalog(code)).filter((p) => !p.comingSoon);
}

/** One product for a market, including ones not sold there (check `available`). */
export async function findProduct(slug: string, code: MarketCode) {
  return (await getAll(code)).find((p) => p.slug === slug);
}

/** The fields the bag and checkout need in the browser. */
export type CartProduct = Pick<
  Product,
  "slug" | "name" | "subtitle" | "price" | "source" | "variants" | "image" | "art" | "tone"
>;

export async function getCartCatalog(code: MarketCode): Promise<CartProduct[]> {
  return (await getBuyable(code)).map(({ slug, name, subtitle, price, source, variants, image, art, tone }) => ({
    slug,
    name,
    subtitle,
    price,
    source,
    variants,
    image,
    art,
    tone,
  }));
}
