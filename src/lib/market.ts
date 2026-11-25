import "server-only";
import { cookies, headers } from "next/headers";
import { MARKET_COOKIE } from "./market-cookie";
import { defaultMarket, markets, type MarketCode } from "./site";

/** Headers set by common CDNs and hosts with the visitor's two-letter country. */
const COUNTRY_HEADERS = ["cf-ipcountry", "x-vercel-ip-country", "cloudfront-viewer-country", "x-country-code", "x-geoip-country", "x-appengine-country"];

/**
 * Which market a visitor is shopping in: their saved choice first, then their
 * country (from the CDN), then their browser language, then the default.
 */
export async function getMarket(): Promise<MarketCode> {
  const saved = (await cookies()).get(MARKET_COOKIE)?.value;
  if (saved && saved in markets) return saved as MarketCode;

  const h = await headers();
  for (const name of COUNTRY_HEADERS) {
    const country = h.get(name)?.trim().toUpperCase();
    if (country && /^[A-Z]{2}$/.test(country) && country !== "XX" && country !== "T1") {
      return country === "US" ? "US" : country === "GB" || country === "UK" ? "GB" : defaultMarket;
    }
  }
  const lang = h.get("accept-language")?.split(",")[0]?.trim().toLowerCase() ?? "";
  if (lang === "en-us") return "US";
  return defaultMarket;
}
