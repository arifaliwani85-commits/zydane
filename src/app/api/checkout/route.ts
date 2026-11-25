import { NextResponse } from "next/server";
import { countries } from "@/lib/countries";
import { encodeWooLines, priceOrder, routeOrder } from "@/lib/orders";
import { site } from "@/lib/site";

const clean = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  let body: { items?: unknown; customer?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const order = Array.isArray(body.items) && body.items.length <= 50 ? await priceOrder(body.items) : null;
  if (!order) return NextResponse.json({ error: "Your bag is empty or contains an unavailable item." }, { status: 400 });

  const c = body.customer ?? {};
  const customer = {
    email: clean(c.email, 200),
    name: clean(c.name),
    address: clean(c.address, 200),
    city: clean(c.city),
    postcode: clean(c.postcode, 20),
    country: clean(c.country, 2).toUpperCase(),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || !customer.name || !customer.address || !customer.city || !customer.postcode || !countries.some(([code]) => code === customer.country)) {
    return NextResponse.json({ error: "Please complete your contact and delivery details." }, { status: 400 });
  }

  const id = `ZY-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, "0")}`;
  const shipments = routeOrder(order.lines);

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Demo mode: no payment is taken, so nothing is sent to AliDropship either
    // (it would buy from the supplier for an unpaid order). Add STRIPE_SECRET_KEY to go live.
    console.info("[order:demo]", id, JSON.stringify({ total: order.total, shipments }));
    return NextResponse.json({
      demo: true,
      order: {
        id,
        email: customer.email,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        items: order.lines.map((l) => ({ name: l.product.name, variant: l.variant, qty: l.qty, price: l.product.price })),
      },
    });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
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
    "metadata[postcode]": customer.postcode,
    "metadata[country]": customer.country,
    "metadata[shipping]": order.shipping.toFixed(2),
    "metadata[woo_lines]": encodeWooLines(order.lines),
    "metadata[shipments]": JSON.stringify(shipments).slice(0, 500),
  });
  order.lines.forEach((l, i) => {
    const p = `line_items[${i}]`;
    form.set(`${p}[quantity]`, String(l.qty));
    form.set(`${p}[price_data][currency]`, site.currency.toLowerCase());
    form.set(`${p}[price_data][unit_amount]`, String(Math.round(l.product.price * 100)));
    form.set(`${p}[price_data][product_data][name]`, l.variant ? `${l.product.name} — ${l.variant}` : l.product.name);
  });
  if (order.shipping > 0) {
    form.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
    form.set("shipping_options[0][shipping_rate_data][display_name]", "Standard shipping");
    form.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(Math.round(order.shipping * 100)));
    form.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", site.currency.toLowerCase());
  }

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
