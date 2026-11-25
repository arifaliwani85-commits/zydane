"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/Icons";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import type { CurrencyCode } from "@/lib/site";

interface Order {
  id: string;
  currency: CurrencyCode;
  email: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: { name: string; variant?: string; qty: number; price: number }[];
}

export default function OrderSuccess() {
  const { clear } = useCart();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    clear();
    try {
      const saved = sessionStorage.getItem("zydane-last-order");
      if (saved) setOrder(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, [clear]);

  const money = (n: number) => formatMoney(n, order?.currency ?? "GBP");

  return (
    <section className="container-x flex flex-col items-center py-20 text-center lg:py-28">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-forest text-cream">
        <CheckIcon width={28} height={28} />
      </span>
      <p className="eyebrow mt-8">Order confirmed</p>
      <h1 className="display mt-4 text-6xl sm:text-7xl">Thank you</h1>
      <p className="mt-5 max-w-md text-ink-soft">
        {order
          ? <>Order <span className="font-medium text-ink">{order.id}</span> is confirmed. A receipt is on its way to {order.email}.</>
          : "Your order is confirmed and a receipt is on its way to your inbox."}
      </p>

      {order && (
        <div className="mt-12 w-full max-w-md rounded-[28px] bg-shell p-8 text-left">
          <ul className="divide-y divide-line text-sm">
            {order.items.map((i) => (
              <li key={`${i.name}-${i.variant}`} className="flex justify-between gap-4 py-3">
                <span>{i.name}{i.variant ? ` — ${i.variant}` : ""} <span className="text-ink-faint">× {i.qty}</span></span>
                <span className="tabular-nums">{money(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd>{order.shipping === 0 ? "Complimentary" : money(order.shipping)}</dd></div>
            <div className="flex items-baseline justify-between"><dt className="font-medium">Total</dt><dd className="display text-3xl">{money(order.total)}</dd></div>
          </dl>
        </div>
      )}

      <Link href="/shop" className="btn btn-dark mt-12">Continue shopping</Link>
    </section>
  );
}
