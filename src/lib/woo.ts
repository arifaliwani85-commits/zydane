import "server-only";
import type { Category, Product } from "./products";

/**
 * WooCommerce connection for the AliDropship back office (admin.zydane.com).
 *
 * Set these environment variables on the hosting (never in the repository):
 *   WC_URL     https://admin.zydane.com
 *   WC_KEY     WooCommerce REST API consumer key (ck_…)
 *   WC_SECRET  WooCommerce REST API consumer secret (cs_…)
 *
 * Without them the store runs on its built-in catalogue only.
 */
const WC_URL = process.env.WC_URL?.replace(/\/+$/, "");
const WC_KEY = process.env.WC_KEY;
const WC_SECRET = process.env.WC_SECRET;

export const wooEnabled = Boolean(WC_URL && WC_KEY && WC_SECRET);

/** How long product data is cached before it is fetched from WooCommerce again. */
const REVALIDATE_SECONDS = 300;

async function wc<T>(path: string, init?: RequestInit & { revalidate?: number | false }): Promise<T> {
  const { revalidate, ...rest } = init ?? {};
  const res = await fetch(`${WC_URL}/wp-json/wc/v3${path}`, {
    ...rest,
    headers: {
      Authorization: `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`,
      "Content-Type": "application/json",
      ...rest.headers,
    },
    ...(revalidate === false ? { cache: "no-store" as const } : { next: { revalidate: revalidate ?? REVALIDATE_SECONDS } }),
  });
  if (!res.ok) throw new Error(`WooCommerce ${path} responded ${res.status}`);
  return res.json() as Promise<T>;
}

interface WooProduct {
  id: number;
  name: string;
  slug: string;
  type: "simple" | "variable" | string;
  status: string;
  price: string;
  regular_price: string;
  description: string;
  short_description: string;
  stock_status: string;
  categories: { name: string; slug: string }[];
  images: { src: string; alt: string }[];
  attributes: { name: string; options: string[]; variation: boolean }[];
  average_rating: string;
  rating_count: number;
}

interface WooVariation {
  id: number;
  price: string;
  stock_status: string;
  attributes: { name: string; option: string }[];
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

const plain = (html: string) =>
  decode(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
      .replace(/<br\s*\/?>|<\/p>|<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

const categoryIds: Category[] = ["kids", "home", "wellness", "carry", "tech"];

/** Maps a WooCommerce category named Home / Wellness / Carry / Tech / Kids to the store's own. */
function categoryOf(p: WooProduct): Category {
  for (const c of p.categories) {
    const hit = categoryIds.find((id) => c.slug.toLowerCase().includes(id) || c.name.toLowerCase().includes(id));
    if (hit) return hit;
  }
  return "home";
}

const money = (s: string) => {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

async function toProduct(p: WooProduct): Promise<Product | null> {
  const price = money(p.price);
  if (!price) return null;
  const regular = money(p.regular_price);
  const optionAttr = p.type === "variable" ? p.attributes.find((a) => a.variation && a.options.length) : undefined;

  let wooVariations: Record<string, number> | undefined;
  if (optionAttr) {
    const variations = await wc<WooVariation[]>(`/products/${p.id}/variations?per_page=100`).catch(() => []);
    wooVariations = {};
    for (const v of variations) {
      const option = v.attributes.find((a) => a.name === optionAttr.name)?.option;
      if (option && v.stock_status !== "outofstock") wooVariations[option] = v.id;
    }
  }
  const options = optionAttr?.options.filter((o) => !wooVariations || o in wooVariations) ?? [];
  const description = plain(p.short_description || p.description) || p.name;
  const longText = plain(p.description);
  const details = longText
    .split("\n")
    .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
    .filter((l) => l.length > 3 && l.length < 140 && l !== description)
    .slice(0, 8);
  const [image, ...gallery] = p.images.map((i) => i.src);

  return {
    slug: `c-${p.slug}`,
    name: decode(p.name),
    subtitle: decode(p.categories[0]?.name ?? "Curated find"),
    price,
    compareAt: regular > price ? regular : undefined,
    category: categoryOf(p),
    source: "curated",
    supplier: { name: "AliDropship", sku: String(p.id), cost: 0 },
    description,
    details: details.length ? details : ["Ships direct from our partner supplier", "Tracking included"],
    variants: options.length ? { label: optionAttr!.name, options } : undefined,
    rating: p.rating_count > 0 ? money(p.average_rating) : undefined,
    reviews: p.rating_count > 0 ? p.rating_count : undefined,
    art: "jar",
    tone: ["#E8E2D8", "#8A7A62"],
    image,
    gallery: gallery.length ? gallery.slice(0, 8) : undefined,
    wooId: p.id,
    wooVariations,
  };
}

/** Published, in-stock products from the back office, or null if the connection is off or failing. */
export async function fetchWooProducts(): Promise<Product[] | null> {
  if (!wooEnabled) return null;
  try {
    const all: WooProduct[] = [];
    for (let page = 1; page <= 10; page++) {
      const batch = await wc<WooProduct[]>(`/products?status=publish&stock_status=instock&per_page=100&page=${page}`);
      all.push(...batch);
      if (batch.length < 100) break;
    }
    const products = await Promise.all(all.map(toProduct));
    return products.filter((p): p is Product => p !== null);
  } catch (err) {
    console.error("[woo] could not load products:", err instanceof Error ? err.message : err);
    return null;
  }
}

export interface WooOrderInput {
  reference: string;
  email: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  paymentTitle: string;
  lines: { wooId: number; variationId?: number; variant?: string; qty: number; price: number }[];
  shipping: number;
}

/**
 * Creates a paid order in WooCommerce so AliDropship can place it with the supplier.
 * Returns the WooCommerce order id.
 */
export async function createWooOrder(o: WooOrderInput): Promise<number> {
  const [first, ...rest] = o.name.trim().split(/\s+/);
  const address = {
    first_name: first ?? "",
    last_name: rest.join(" "),
    address_1: o.address,
    city: o.city,
    postcode: o.postcode,
    country: o.country,
  };
  const order = await wc<{ id: number }>("/orders", {
    method: "POST",
    revalidate: false,
    body: JSON.stringify({
      status: "processing",
      set_paid: true,
      payment_method: "zydane",
      payment_method_title: o.paymentTitle,
      customer_note: `zydane.com order ${o.reference}`,
      billing: { ...address, email: o.email },
      shipping: address,
      line_items: o.lines.map((l) => ({
        product_id: l.wooId,
        ...(l.variationId ? { variation_id: l.variationId } : {}),
        quantity: l.qty,
        subtotal: (l.price * l.qty).toFixed(2),
        total: (l.price * l.qty).toFixed(2),
        ...(l.variant && !l.variationId ? { meta_data: [{ key: "Option", value: l.variant }] } : {}),
      })),
      shipping_lines: o.shipping > 0 ? [{ method_id: "flat_rate", method_title: "Standard shipping", total: o.shipping.toFixed(2) }] : [],
      meta_data: [{ key: "_zydane_reference", value: o.reference }],
    }),
  });
  return order.id;
}

/** True if an order with this zydane.com reference was already sent (makes retries safe). */
export async function wooOrderExists(reference: string): Promise<boolean> {
  const found = await wc<{ id: number }[]>(`/orders?search=${encodeURIComponent(reference)}&per_page=5`, { revalidate: false }).catch(
    () => [],
  );
  return found.length > 0;
}
