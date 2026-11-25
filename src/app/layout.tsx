import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CartProvider } from "@/lib/cart";
import { getCartCatalog } from "@/lib/catalog";
import { getMarket } from "@/lib/market";
import { MarketProvider } from "@/lib/market-client";
import { markets, site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: { title: site.name, description: site.description, type: "website" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const code = await getMarket();
  const catalog = await getCartCatalog(code);
  return (
    <html lang={markets[code].locale} className={GeistSans.variable}>
      <body>
        <MarketProvider code={code}>
        <CartProvider catalog={catalog}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-paper">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
        </MarketProvider>
      </body>
    </html>
  );
}
