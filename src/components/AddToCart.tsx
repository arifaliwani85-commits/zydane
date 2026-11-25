"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useMarket } from "@/lib/market-client";
import type { Product } from "@/lib/products";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const { money } = useMarket();
  const [variant, setVariant] = useState(product.variants?.options[0]);
  const [qty, setQty] = useState(1);

  return (
    <div className="space-y-7">
      {product.variants && (
        <fieldset>
          <legend className="text-sm">
            <span className="text-ink-soft">{product.variants.label}:</span> <span className="font-medium">{variant}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.options.map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={variant === o}
                onClick={() => setVariant(o)}
                className={`h-11 rounded-full border px-5 text-sm transition-colors ${
                  variant === o ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="flex gap-3">
        <div className="flex h-14 items-center rounded-full border border-line">
          <button className="h-full w-12 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
          <span className="w-6 text-center tabular-nums" aria-live="polite">{qty}</span>
          <button className="h-full w-12 text-lg" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase quantity">+</button>
        </div>
        <button onClick={() => add(product.slug, variant, qty)} className="btn btn-dark !h-14 flex-1 text-[15px]">
          Add to bag — {money(product.price * qty)}
        </button>
      </div>
    </div>
  );
}
