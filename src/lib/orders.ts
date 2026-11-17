import { shippingFor } from "./format";
import { getProduct, type Product } from "./products";

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

/** Re-prices a cart from the catalogue. Never trust prices sent by the browser. */
export function priceOrder(items: OrderItemInput[]) {
  const lines: OrderLine[] = [];
  for (const item of items) {
    const product = getProduct(String(item.slug));
    const qty = Math.floor(Number(item.qty));
    if (!product || !(qty >= 1 && qty <= 99)) return null;
    const variant = product.variants
      ? product.variants.options.find((o) => o === item.variant) ?? product.variants.options[0]
      : undefined;
    lines.push({ product, variant, qty });
  }
  if (lines.length === 0) return null;
  const subtotal = lines.reduce((n, l) => n + l.product.price * l.qty, 0);
  const shipping = shippingFor(subtotal);
  return { lines, subtotal, shipping, total: subtotal + shipping };
}

/**
 * Splits an order into shipments: one from your own warehouse (private label)
 * and one per dropship supplier. This is the hand-off point for automating
 * supplier purchase orders — email them, call their API, or push to a tool
 * like AutoDS / DSers from here.
 */
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
