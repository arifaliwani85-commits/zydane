import "server-only";
import { cache } from "react";
import { products as builtIn, type Product } from "./products";
import { fetchWooProducts } from "./woo";

/**
 * The full catalogue: your own Zydane Line products from products.ts, plus
 * Curated Finds from the AliDropship back office. While the back office is not
 * connected (or has no products yet), the sample Curated Finds in products.ts
 * are shown instead.
 */
export const getCatalog = cache(async (): Promise<Product[]> => {
  const house = builtIn.filter((p) => p.source === "house");
  const woo = await fetchWooProducts();
  const curated = woo && woo.length > 0 ? woo : builtIn.filter((p) => p.source === "curated");
  return [...house, ...curated];
});

export async function findProduct(slug: string) {
  return (await getCatalog()).find((p) => p.slug === slug);
}

/** The fields the bag and checkout need in the browser. */
export type CartProduct = Pick<
  Product,
  "slug" | "name" | "subtitle" | "price" | "source" | "variants" | "image" | "art" | "tone"
>;

export async function getCartCatalog(): Promise<CartProduct[]> {
  return (await getCatalog()).map(({ slug, name, subtitle, price, source, variants, image, art, tone }) => ({
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
