"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartProduct } from "./catalog";

export interface CartLine {
  slug: string;
  variant?: string;
  qty: number;
}

export interface ResolvedLine extends CartLine {
  key: string;
  product: CartProduct;
}

interface CartState {
  lines: ResolvedLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (slug: string, variant?: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "zydane-cart-v1";
const keyOf = (l: { slug: string; variant?: string }) => `${l.slug}::${l.variant ?? ""}`;

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children, catalog }: { children: React.ReactNode; catalog: CartProduct[] }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) setRaw(saved);
    } catch {
      /* storage unavailable — start with an empty cart */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    } catch {
      /* ignore */
    }
  }, [raw, loaded]);

  const add = useCallback((slug: string, variant?: string, qty = 1) => {
    setRaw((prev) => {
      const k = keyOf({ slug, variant });
      const hit = prev.find((l) => keyOf(l) === k);
      return hit
        ? prev.map((l) => (keyOf(l) === k ? { ...l, qty: Math.min(99, l.qty + qty) } : l))
        : [...prev, { slug, variant, qty }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setRaw((prev) =>
      qty <= 0
        ? prev.filter((l) => keyOf(l) !== key)
        : prev.map((l) => (keyOf(l) === key ? { ...l, qty: Math.min(99, qty) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => setRaw((prev) => prev.filter((l) => keyOf(l) !== key)), []);
  const clear = useCallback(() => setRaw([]), []);

  const value = useMemo<CartState>(() => {
    const lines = raw.flatMap((l) => {
      const product = catalog.find((p) => p.slug === l.slug);
      return product ? [{ ...l, key: keyOf(l), product }] : [];
    });
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.product.price, 0),
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    };
  }, [raw, open, add, setQty, remove, clear, catalog]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
