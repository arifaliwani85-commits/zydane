import { NextResponse } from "next/server";
import { getMarket } from "@/lib/market";
import { encodeWooLines, priceOrder, routeOrder } from "@/lib/orders";
import { createPayPalOrder } from "@/lib/paypal";
import { newOrderId, paymentMethods, siteOrigin } from "@/lib/payments";
import { markets } from "@/lib/site";

const clean = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);

/** Tells the checkout page which payment buttons to show. */
export async function GET() {
  return NextResponse.json(paymentMethods(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  let body: { items?: unknown; customer?: Record<string, unknown>; method?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // The market comes from the visitor's saved choice or location, never from the request body.
  const market = markets[await getMarket()];
  const order = Array.isArray(body.items) && body.items.length <= 50 ? await priceOrder(body.items, market) : null;
  if (!order) return NextResponse.json({ error: "Your bag is empty or contains an unavailable item." }, { status: 400 });

  const c = body.customer ?? {};
  const customer = {
    email: clean(c.email, 200),
    name: clean(c.name),
    address: clean(c.address, 200),
    city: clean(c.city),
    region: clean(c.region, 40),
    postcode: clean(c.postcode, 20),
    country: clean(c.country, 2).toUpperCase(),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || !customer.name || !customer.address || !customer.city || !customer.postcode) {
    return NextResponse.json({ error: "Please complete your contact and delivery details." }, { status: 400 });
  }

  if (customer.country === "US" && !customer.region) {
    return NextResponse.json({ error: "Please enter your state." }, { status: 400 });
  }
  if (!market.countries.some(([code]) => code === customer.country)) {
    return NextResponse.json({ error: `We currently deliver to ${market.countries.map(([, n]) => n).join(", ")} from this store.` }, { status: 400 });
  }

  const id = newOrderId();
  const shipments = routeOrder(order.lines);

  const methods = paymentMethods();
  const method = body.method === "paypal" ? "paypal" : "card";
  const origin = siteOrigin(req);

  if (method === "paypal" && methods.paypal) {
    try {
      const paypal = await createPayPalOrder({
        reference: id,
        currency: market.currency,
        customer,
        lines: order.lines.map((l) => ({
          name: l.variant ? `${l.product.name} — ${l.variant}` : l.product.name,
          qty: l.qty,
          price: l.product.price,
          sku: l.product.wooId ? `woo:${l.product.wooId}:${(l.variant && l.product.wooVariations?.[l.variant]) || 0}` : l.product.slug,
        })),
        returnUrl: `${origin}/api/paypal/return`,
        cancelUrl: `${origin}/checkout`,
      });
      return NextResponse.json({ url: paypal.url });
    } catch (err) {
      console.error("[paypal]", err instanceof Error ? err.message : err);
      return NextResponse.json({ error: "We couldn't start the PayPal payment. Please try again or pay by card." }, { status: 502 });
    }
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || method !== "card") {
    if (methods.card || methods.paypal) {
      return NextResponse.json({ error: "That payment method isn't available. Please choose another." }, { status: 400 });
    }
    // Demo mode: no payment is taken, so nothing is sent to AliDropship either
    // (it would buy from the supplier for an unpaid order). Add payment keys to go live.
    console.info("[order:demo]", id, JSON.stringify({ total: order.total, shipments }));
    return NextResponse.json({
      demo: true,
      order: {
        id,
        currency: market.currency,
        email: customer.email,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        items: order.lines.map((l) => ({ name: l.product.name, variant: l.variant, qty: l.qty, price: l.product.price })),
      },
    });
  }

  const form = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
    customer_email: customer.email,
    client_reference_id: id,
    "metadata[order_id]": id,
    "metadata[name]": customer.name,
    "metadata[address]": customer.address,
    "metadata[city]": customer.city,
    "metadata[region]": customer.region,
    "metadata[postcode]": customer.postcode,
    "metadata[country]": customer.country,
    "metadata[shipping]": order.shipping.toFixed(2),
    "metadata[currency]": market.currency,
    "metadata[woo_lines]": encodeWooLines(order.lines),
    "metadata[shipments]": JSON.stringify(shipments).slice(0, 500),
  });
  order.lines.forEach((l, i) => {
    const p = `line_items[${i}]`;
    form.set(`${p}[quantity]`, String(l.qty));
    form.set(`${p}[price_data][currency]`, market.currency.toLowerCase());
    form.set(`${p}[price_data][unit_amount]`, String(Math.round(l.product.price * 100)));
    form.set(`${p}[price_data][product_data][name]`, l.variant ? `${l.product.name} — ${l.variant}` : l.product.name);
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const session = await res.json();
  if (!res.ok || !session.url) {
    console.error("[stripe]", session?.error?.message ?? res.status);
    return NextResponse.json({ error: "We couldn't start the payment. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ url: session.url });
}
