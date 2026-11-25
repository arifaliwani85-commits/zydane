import "server-only";
import type { CurrencyCode } from "./site";

/**
 * PayPal Checkout (Orders v2). The customer is sent to PayPal to approve the
 * payment, returns to /api/paypal/return, and the payment is captured there.
 *
 * Environment variables: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and
 * PAYPAL_ENV=sandbox to test (anything else means live).
 */
const BASE = process.env.PAYPAL_API_BASE ?? (process.env.PAYPAL_ENV === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com");

let cached: { token: string; expires: number } | null = null;

async function accessToken() {
  if (cached && cached.expires > Date.now() + 30_000) return cached.token;
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error(`PayPal sign-in failed (${res.status})`);
  cached = { token: data.access_token, expires: Date.now() + Number(data.expires_in ?? 300) * 1000 };
  return cached.token;
}

async function pp<T>(path: string, init: { method?: string; body?: unknown; requestId?: string } = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
      ...(init.requestId ? { "PayPal-Request-Id": init.requestId } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`PayPal ${path} responded ${res.status}: ${data?.name ?? ""} ${data?.details?.[0]?.issue ?? ""}`.trim());
  return data as T;
}

const cents = (n: number) => Math.round(n * 100);
const amount = (c: number) => (c / 100).toFixed(2);
const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export interface PayPalLine {
  name: string;
  qty: number;
  price: number;
  /** "woo:<productId>:<variationId>" for AliDropship items, otherwise the product slug. */
  sku: string;
}

export async function createPayPalOrder(o: {
  reference: string;
  currency: CurrencyCode;
  lines: PayPalLine[];
  customer: { email: string; name: string; address: string; city: string; region: string; postcode: string; country: string };
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  const total = o.lines.reduce((n, l) => n + cents(l.price) * l.qty, 0);
  const money = (c: number) => ({ currency_code: o.currency, value: amount(c) });
  const order = await pp<{ id: string; links: { rel: string; href: string }[] }>("/v2/checkout/orders", {
    method: "POST",
    requestId: `create-${o.reference}`,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: o.reference,
          invoice_id: o.reference,
          description: `Zydane order ${o.reference}`,
          amount: { ...money(total), breakdown: { item_total: money(total) } },
          items: o.lines.map((l) => ({
            name: cut(l.name, 127),
            quantity: String(l.qty),
            unit_amount: money(cents(l.price)),
            sku: l.sku.slice(0, 127),
            category: "PHYSICAL_GOODS",
          })),
          shipping: {
            type: "SHIPPING",
            name: { full_name: cut(o.customer.name, 300) },
            address: {
              address_line_1: cut(o.customer.address, 300),
              admin_area_2: o.customer.city,
              ...(o.customer.region ? { admin_area_1: o.customer.region } : {}),
              postal_code: o.customer.postcode,
              country_code: o.customer.country,
            },
          },
        },
      ],
      payment_source: {
        paypal: {
          email_address: o.customer.email,
          experience_context: {
            brand_name: "Zydane",
            shipping_preference: "SET_PROVIDED_ADDRESS",
            user_action: "PAY_NOW",
            return_url: o.returnUrl,
            cancel_url: o.cancelUrl,
          },
        },
      },
    },
  });
  const url = order.links.find((l) => l.rel === "payer-action")?.href ?? order.links.find((l) => l.rel === "approve")?.href;
  if (!url) throw new Error("PayPal did not return an approval link");
  return { id: order.id, url };
}

interface PayPalOrder {
  id: string;
  status: string;
  payer?: { email_address?: string };
  purchase_units: {
    custom_id?: string;
    amount: { currency_code: string; value: string };
    items?: { name: string; quantity: string; sku?: string; unit_amount: { value: string } }[];
    shipping?: { name?: { full_name?: string }; address?: { address_line_1?: string; admin_area_1?: string; admin_area_2?: string; postal_code?: string; country_code?: string } };
  }[];
}

/** Takes the payment for an order the customer has approved. Safe to call more than once. */
export async function completePayPalOrder(paypalOrderId: string) {
  let order = await pp<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);
  if (order.status === "APPROVED") {
    await pp(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, { method: "POST", body: {}, requestId: `capture-${paypalOrderId}` });
    order = await pp<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);
  }
  if (order.status !== "COMPLETED") throw new Error(`PayPal order ${paypalOrderId} is ${order.status}, not paid`);

  const unit = order.purchase_units[0];
  const reference = unit.custom_id ?? "";
  if (!/^ZY-[A-Z0-9]+$/.test(reference)) throw new Error(`PayPal order ${paypalOrderId} has no Zydane reference`);
  const a = unit.shipping?.address;
  return {
    reference,
    currency: (unit.amount.currency_code === "USD" ? "USD" : "GBP") as CurrencyCode,
    customer: {
      email: order.payer?.email_address ?? "",
      name: unit.shipping?.name?.full_name ?? "",
      address: a?.address_line_1 ?? "",
      city: a?.admin_area_2 ?? "",
      region: a?.admin_area_1 ?? "",
      postcode: a?.postal_code ?? "",
      country: a?.country_code ?? "",
    },
    items: (unit.items ?? []).map((i) => ({ name: i.name, sku: i.sku ?? "", qty: Number(i.quantity), price: Number(i.unit_amount.value) })),
  };
}
