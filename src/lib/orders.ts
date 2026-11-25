import "server-only";
import { getCatalog } from "./catalog";
import type { Product } from "./products";
import type { CurrencyCode, Market } from "./site";
import { createWooOrder, wooEnabled, wooOrderExists } from "./woo";

export interface OrderItemInput {
  slug: string;
  variant?: string;
  qty: number;
}

export interface OrderLine {
  product: Product;
  variant?: string;
  qty: number;
}

export interface Customer {
  email: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
}

/** Re-prices a cart from the catalogue. Never trust prices sent by the browser. */
export async function priceOrder(items: OrderItemInput[], market: Market) {
  const catalog = await getCatalog(market.code);
  const lines: OrderLine[] = [];
  for (const item of items) {
    const product = catalog.find((p) => p.slug === String(item.slug));
    const qty = Math.floor(Number(item.qty));
    if (!product || !(qty >= 1 && qty <= 99)) return null;
    const variant = product.variants
      ? product.variants.options.find((o) => o === item.variant) ?? product.variants.options[0]
      : undefined;
    lines.push({ product, variant, qty });
  }
  if (lines.length === 0) return null;
  const subtotal = lines.reduce((n, l) => n + l.product.price * l.qty, 0);
  // Shipping is free on every order.
  return { lines, subtotal, shipping: 0, total: subtotal };
}

/** Compact form of the AliDropship lines, small enough for Stripe metadata: "wooId:variationId:qty:price;…". */
export function encodeWooLines(lines: OrderLine[]) {
  return lines
    .filter((l) => l.product.wooId)
    .map((l) => [l.product.wooId, (l.variant && l.product.wooVariations?.[l.variant]) || 0, l.qty, l.product.price].join(":"))
    .join(";");
}

function decodeWooLines(encoded: string) {
  return encoded
    .split(";")
    .filter(Boolean)
    .map((part) => {
      const [wooId, variationId, qty, price] = part.split(":").map(Number);
      return { wooId, variationId: variationId || undefined, qty, price };
    })
    .filter((l) => l.wooId > 0 && l.qty > 0);
}

/**
 * Sends the AliDropship items of a paid order to the back office, where
 * AliDropship places them with the supplier. Safe to call more than once for
 * the same reference. Returns the WooCommerce order id, or null if there was
 * nothing to send.
 */
export async function fulfilViaAliDropship(params: {
  reference: string;
  customer: Customer;
  wooLines: string;
  shipping: number;
  paymentTitle: string;
  currency: CurrencyCode;
}): Promise<number | null> {
  const lines = decodeWooLines(params.wooLines);
  if (!wooEnabled || lines.length === 0) return null;
  if (await wooOrderExists(params.reference)) return null;
  return createWooOrder({
    reference: params.reference,
    ...params.customer,
    paymentTitle: params.paymentTitle,
    currency: params.currency,
    lines,
    shipping: params.shipping,
  });
}

/** Splits an order into shipments: one from your own warehouse and one per supplier. */
export function routeOrder(lines: OrderLine[]) {
  const shipments = new Map<string, { fulfilledBy: string; items: { sku: string; name: string; variant?: string; qty: number }[] }>();
  for (const l of lines) {
    const fulfilledBy = l.product.source === "house" ? "Own warehouse" : (l.product.supplier?.name ?? "Unassigned supplier");
    const shipment = shipments.get(fulfilledBy) ?? { fulfilledBy, items: [] };
    shipment.items.push({ sku: l.product.supplier?.sku ?? l.product.slug, name: l.product.name, variant: l.variant, qty: l.qty });
    shipments.set(fulfilledBy, shipment);
  }
  return [...shipments.values()];
}
