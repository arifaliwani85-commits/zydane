"use client";

import { useEffect, useRef, useState } from "react";
import { useMarket } from "@/lib/market-client";
import { markets, type MarketCode } from "@/lib/site";

/** Lets a visitor choose which country's shop and currency they are looking at. */
export function MarketSwitch() {
  const { market, setMarket } = useMarket();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Shopping in ${market.label}, prices in ${market.currency}. Change country`}
        className="flex h-10 items-center gap-1.5 rounded-full px-2.5 text-[13px] transition-colors hover:bg-shell"
      >
        <span aria-hidden className="text-base leading-none">{market.flag}</span>
        <span className="hidden tabular-nums sm:inline">{market.currency}</span>
      </button>
      {open && (
        <ul role="listbox" aria-label="Country" className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-line bg-paper p-1.5 shadow-xl">
          {(Object.keys(markets) as MarketCode[]).map((code) => {
            const m = markets[code];
            return (
              <li key={code} role="option" aria-selected={code === market.code}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (code !== market.code) setMarket(code);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-shell ${code === market.code ? "font-medium" : ""}`}
                >
                  <span aria-hidden className="text-lg leading-none">{m.flag}</span>
                  <span className="flex-1">{m.label}</span>
                  <span className="text-xs text-ink-faint">{m.currency}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
