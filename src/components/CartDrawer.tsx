"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { money, shippingFor } from "@/lib/format";
import { site } from "@/lib/site";
import { CloseIcon } from "./Icons";
import { ProductArt } from "./ProductArt";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, count, setQty, remove } = useCart();
  const remaining = Math.max(0, site.freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / site.freeShippingThreshold) * 100);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        inert={!open}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-paper transition-transform duration-500 ease-out-soft ${
          open ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <h2 className="display text-3xl">
            Your bag <span className="text-ink-faint">({count})</span>
          </h2>
          <button className="-mr-2 p-2" onClick={() => setOpen(false)} aria-label="Close bag">
            <CloseIcon />
          </button>
        </div>

        {lines.length > 0 && (
          <div className="px-6 pb-5">
            <p className="text-[13px] text-ink-soft">
              {remaining > 0 ? (
                <>
                  You&apos;re <span className="font-medium text-ink">{money(remaining)}</span> away from complimentary shipping
                </>
              ) : (
                <span className="font-medium text-forest">You&apos;ve unlocked complimentary shipping</span>
              )}
            </p>
            <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-forest transition-all duration-700 ease-out-soft" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="display text-4xl">Nothing here yet</p>
            <p className="mt-3 max-w-[30ch] text-sm text-ink-soft">Start with the pieces our customers reach for most.</p>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-dark mt-8">
              Explore the shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto border-y border-line px-6">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-4 py-5">
                  <Link
                    href={`/product/${l.product.slug}`}
                    onClick={() => setOpen(false)}
                    className="h-[104px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-shell"
                  >
                    <ProductArt product={l.product} />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <p className="truncate text-[15px] font-medium">{l.product.name}</p>
                      <p className="shrink-0 text-[15px] tabular-nums">{money(l.product.price * l.qty)}</p>
                    </div>
                    <p className="mt-0.5 text-[13px] text-ink-soft">{l.variant ?? l.product.subtitle}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex h-9 items-center rounded-full border border-line text-sm">
                        <button className="h-full w-9" onClick={() => setQty(l.key, l.qty - 1)} aria-label={`Decrease quantity of ${l.product.name}`}>
                          −
                        </button>
                        <span className="w-6 text-center tabular-nums">{l.qty}</span>
                        <button className="h-full w-9" onClick={() => setQty(l.key, l.qty + 1)} aria-label={`Increase quantity of ${l.product.name}`}>
                          +
                        </button>
                      </div>
                      <button onClick={() => remove(l.key)} className="link-underline text-xs text-ink-faint hover:text-ink">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 p-6">
              <div className="flex justify-between text-sm text-ink-soft">
                <span>Shipping</span>
                <span>{shippingFor(subtotal) === 0 ? "Complimentary" : money(shippingFor(subtotal))}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="display text-3xl tabular-nums">{money(subtotal)}</span>
              </div>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-dark w-full">
                Checkout securely
              </Link>
              <p className="text-center text-xs text-ink-faint">Taxes calculated at checkout · 30-day returns</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
