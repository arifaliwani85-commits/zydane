import "server-only";

/** Which payment methods are switched on. Each needs its keys set on the hosting (see README). */
export function paymentMethods() {
  return {
    card: Boolean(process.env.STRIPE_SECRET_KEY),
    paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
  };
}

/** The public address of the store, used for the pages payment providers send customers back to. */
export function siteOrigin(req: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured && !configured.includes("localhost")) return configured;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) return `${req.headers.get("x-forwarded-proto") ?? "https"}://${host}`;
  return new URL(req.url).origin;
}

/** A short, readable order reference such as ZY-LQ2K9XA4. */
export function newOrderId() {
  return `ZY-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, "0")}`;
}
