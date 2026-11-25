import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { fulfilViaAliDropship } from "@/lib/orders";

/**
 * Stripe webhook: when a checkout is paid, sends its AliDropship items to the
 * back office so they are ordered from the supplier.
 *
 * In Stripe → Developers → Webhooks, add https://zydane.com/api/stripe/webhook
 * for the event `checkout.session.completed`, then set its signing secret as
 * STRIPE_WEBHOOK_SECRET on the hosting.
 */
function verify(payload: string, header: string | null, secret: string) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest();
  return header
    .split(",")
    .filter((kv) => kv.startsWith("v1="))
    .some((kv) => {
      const sig = Buffer.from(kv.slice(3), "hex");
      return sig.length === expected.length && timingSafeEqual(sig, expected);
    });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const payload = await req.text();
  if (!verify(payload, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload);
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return NextResponse.json({ received: true });
  }
  const session = event.data.object;
  if (session.payment_status !== "paid") return NextResponse.json({ received: true });

  const m = session.metadata ?? {};
  try {
    const wooId = await fulfilViaAliDropship({
      reference: m.order_id ?? session.client_reference_id,
      customer: {
        email: session.customer_details?.email ?? session.customer_email ?? "",
        name: m.name ?? "",
        address: m.address ?? "",
        city: m.city ?? "",
        postcode: m.postcode ?? "",
        country: m.country ?? "",
      },
      wooLines: m.woo_lines ?? "",
      shipping: Number(m.shipping ?? 0),
      paymentTitle: "Card (Stripe)",
    });
    if (wooId) console.info("[aliDropship] order", m.order_id, "→ WooCommerce", wooId);
  } catch (err) {
    // A non-2xx reply makes Stripe retry later; retries are safe (duplicates are skipped).
    console.error("[aliDropship] could not send order", m.order_id, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not forward order" }, { status: 502 });
  }
  return NextResponse.json({ received: true });
}
