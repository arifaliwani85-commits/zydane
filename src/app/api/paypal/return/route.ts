import { NextResponse } from "next/server";
import { fulfilViaAliDropship } from "@/lib/orders";
import { completePayPalOrder } from "@/lib/paypal";
import { siteOrigin } from "@/lib/payments";

/**
 * Where PayPal sends the customer after they approve a payment. It takes the
 * payment, sends any AliDropship items to the back office, then shows the
 * confirmation page. Reloading this address is safe: nothing is charged or
 * ordered twice.
 */
export async function GET(req: Request) {
  const origin = siteOrigin(req);
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!/^[A-Za-z0-9]{8,40}$/.test(token)) return NextResponse.redirect(`${origin}/checkout?error=paypal`, 303);

  try {
    const paid = await completePayPalOrder(token);

    const wooLines = paid.items
      .flatMap((i) => {
        const m = /^woo:(\d+):(\d+)$/.exec(i.sku);
        return m ? [[m[1], m[2], i.qty, i.price].join(":")] : [];
      })
      .join(";");
    try {
      await fulfilViaAliDropship({
        reference: paid.reference,
        customer: paid.customer,
        wooLines,
        shipping: 0,
        paymentTitle: "PayPal",
        currency: paid.currency,
      });
    } catch (err) {
      // The customer has paid. Keep going to the confirmation page and log it so the order can be placed by hand.
      console.error("[aliDropship] PayPal order", paid.reference, "was paid but could not be sent:", err instanceof Error ? err.message : err);
    }
    return NextResponse.redirect(`${origin}/order/success?ref=${encodeURIComponent(paid.reference)}`, 303);
  } catch (err) {
    console.error("[paypal] return failed:", err instanceof Error ? err.message : err);
    return NextResponse.redirect(`${origin}/checkout?error=paypal`, 303);
  }
}
