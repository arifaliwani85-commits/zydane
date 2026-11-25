"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductArt } from "@/components/ProductArt";
import { useCart } from "@/lib/cart";
import { countries } from "@/lib/countries";
import { money, shippingFor } from "@/lib/format";
import { fulfilment } from "@/lib/site";

const fields = [
  { name: "email", label: "Email", type: "email", autoComplete: "email", span: 2 },
  { name: "name", label: "Full name", type: "text", autoComplete: "name", span: 2 },
  { name: "address", label: "Address", type: "text", autoComplete: "street-address", span: 2 },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2", span: 1 },
  { name: "postcode", label: "Postal code", type: "text", autoComplete: "postal-code", span: 1 },
];

export default function Checkout() {
  const { lines, subtotal } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const shipping = shippingFor(subtotal);
  const sources = [...new Set(lines.map((l) => l.product.source))];

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: Object.fromEntries(new FormData(e.currentTarget)),
          items: lines.map(({ slug, variant, qty }) => ({ slug, variant, qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      sessionStorage.setItem("zydane-last-order", JSON.stringify(data.order));
      router.push("/order/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (lines.length === 0) {
    return (
      <section className="container-x flex min-h-[55vh] flex-col items-center justify-center py-24 text-center">
        <h1 className="display text-6xl">Your bag is empty</h1>
        <p className="mt-4 text-ink-soft">Add something you love and come back to check out.</p>
        <Link href="/shop" className="btn btn-dark mt-8">Explore the shop</Link>
      </section>
    );
  }

  return (
    <div className="container-x grid gap-12 pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:pt-16">
      <form onSubmit={submit}>
        <p className="eyebrow">Secure checkout</p>
        <h1 className="display mt-4 text-6xl sm:text-7xl">Checkout</h1>

        <h2 className="mt-12 text-sm font-medium">Contact &amp; delivery</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <label key={f.name} className={f.span === 2 ? "col-span-2" : "col-span-2 sm:col-span-1"}>
              <span className="mb-1.5 block text-xs text-ink-soft">{f.label}</span>
              <input name={f.name} type={f.type} autoComplete={f.autoComplete} required className="field" />
            </label>
          ))}
          <label className="col-span-2">
            <span className="mb-1.5 block text-xs text-ink-soft">Country</span>
            <select name="country" required autoComplete="country" defaultValue="US" className="field appearance-none">
              {countries.map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl bg-[#F6E3DC] px-4 py-3 text-sm text-[#8A2E14]">{error}</p>}

        <button disabled={busy} className="btn btn-dark mt-8 !h-14 w-full text-[15px]">
          {busy ? "Processing…" : `Continue to payment — ${money(subtotal + shipping)}`}
        </button>
        <p className="mt-4 text-center text-xs text-ink-faint">Payments are encrypted and processed by Stripe. We never see your card details.</p>
      </form>

      <aside className="h-fit rounded-[28px] bg-shell p-6 sm:p-8 lg:sticky lg:top-28">
        <h2 className="display text-3xl">Order summary</h2>
        <ul className="mt-6 divide-y divide-line">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-4 py-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg">
                <ProductArt product={l.product} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.product.name}</p>
                <p className="text-[13px] text-ink-soft">{[l.variant, `Qty ${l.qty}`].filter(Boolean).join(" · ")}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink-faint">{fulfilment[l.product.source].label}</p>
              </div>
              <p className="text-sm tabular-nums">{money(l.product.price * l.qty)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2.5 border-t border-line pt-5 text-sm">
          <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd>{shipping === 0 ? "Complimentary" : money(shipping)}</dd></div>
          <div className="flex items-baseline justify-between pt-3"><dt className="font-medium">Total</dt><dd className="display text-4xl tabular-nums">{money(subtotal + shipping)}</dd></div>
        </dl>
        {sources.length > 0 && (
          <div className="mt-6 space-y-1.5 rounded-2xl bg-paper p-4 text-[13px] text-ink-soft">
            {sources.length > 1 && <p className="font-medium text-ink">Your order will arrive in separate parcels.</p>}
            {sources.map((s) => (
              <p key={s}><span className="text-ink">{fulfilment[s].label}:</span> {fulfilment[s].delivery.toLowerCase()}</p>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
