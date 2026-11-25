"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useMarket } from "@/lib/market-client";
import type { Product } from "@/lib/products";
import { fulfilment } from "@/lib/site";
import { ProductArt } from "./ProductArt";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { money } = useMarket();
  const quickAdd = !product.variants;

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-shell">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="block h-full">
          <div className="h-full transition-transform duration-[1200ms] ease-out-soft group-hover:scale-[1.045]">
            <ProductArt product={product} />
          </div>
        </Link>
        {product.badge && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] backdrop-blur">
            {product.badge}
          </span>
        )}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-500 ease-out-soft group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 max-md:hidden">
          {quickAdd ? (
            <button
              onClick={() => add(product.slug)}
              className="h-11 w-full rounded-full bg-ink text-[13px] font-medium text-paper transition-colors hover:bg-forest"
            >
              Add to bag — {money(product.price)}
            </button>
          ) : (
            <Link
              href={`/product/${product.slug}`}
              className="flex h-11 w-full items-center justify-center rounded-full bg-paper/95 text-[13px] font-medium backdrop-blur transition-colors hover:bg-white"
            >
              Choose {product.variants!.label.toLowerCase()}
            </Link>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
            {fulfilment[product.source].label}
          </p>
          <h3 className="mt-1.5 truncate text-[15px] font-medium">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-ink-soft">{product.subtitle}</p>
        </div>
        <p className="shrink-0 pt-[22px] text-right text-[15px] tabular-nums">
          {product.compareAt && <s className="mr-1.5 text-[13px] text-ink-faint">{money(product.compareAt)}</s>}
          {money(product.price)}
        </p>
      </div>
    </article>
  );
}
