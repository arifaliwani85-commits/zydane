"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo } from "react";
import { formatMoney } from "./format";
import { markets, type Market, type MarketCode } from "./site";
import { MARKET_COOKIE } from "./market-cookie";

interface MarketState {
  market: Market;
  money: (n: number) => string;
  setMarket: (code: MarketCode) => void;
}

const MarketContext = createContext<MarketState | null>(null);

export function MarketProvider({ code, children }: { code: MarketCode; children: React.ReactNode }) {
  const router = useRouter();
  const market = markets[code];

  const setMarket = useCallback(
    (next: MarketCode) => {
      document.cookie = `${MARKET_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo<MarketState>(
    () => ({
      market,
      money: (n) => formatMoney(n, market.currency),
      setMarket,
    }),
    [market, setMarket],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used inside <MarketProvider>");
  return ctx;
}
