# Zydane

A premium storefront for selling your own private-label products alongside curated dropship products. Built with Next.js, React and Tailwind CSS.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

## What's included

- **Home, shop, product, checkout and order-confirmation pages**, fully responsive
- **Two collections**: "The Zydane Line" (private label) and "Curated Finds" (dropship), each with its own shipping promise shown to shoppers
- **Shop filters** by collection and category, sorting, and search
- **Bag drawer** with a free-shipping progress bar; the bag is remembered between visits
- **Checkout** that re-prices every order on the server and splits it into shipments — one from your warehouse and one per dropship supplier
- **Stripe payments**, switched on by adding a key (see below)

## Make it yours

| What | Where |
| --- | --- |
| Store name, support email | `src/lib/site.ts` |
| Markets (UK / US): currency, delivery countries, exchange rate | `src/lib/site.ts` |
| Products, prices, variants, suppliers | `src/lib/products.ts` |
| Colours and fonts | `src/app/globals.css` |
| Home page copy, reviews and statistics | `src/app/page.tsx` |

### Products

Each product has `source: "house"` (your private label) or `source: "curated"` (dropship, with a `supplier` name, SKU and cost that shoppers never see).

To use real photos, put them in `public/products/` and set `image: "/products/your-file.jpg"` on the product. Products without a photo show a generated illustration.

### Payments

Without a Stripe key the checkout runs in **demo mode**: orders complete but no payment is taken. To take real payments, copy `.env.example` to `.env.local` and set:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_live_...
```

### Dropship fulfilment

`routeOrder` in `src/lib/orders.ts` groups each order by who fulfils it. It is the place to connect supplier emails, a supplier API or a tool such as AutoDS or DSers. Today the shipment plan is attached to the Stripe payment's metadata (and logged in demo mode); forwarding orders to suppliers is not automated yet.

## Before launch

The catalogue, reviews, ratings and customer statistics are **sample content**. Replace them with your real products and genuine reviews before going live.

## Hosting

The store is deployed to Hostinger at **https://zydane.com** (and a copy at shop.zydane.com) and redeploys automatically on every push to the deployed branch.

The build uses webpack (`next build --webpack`) and a JavaScript config file, because Hostinger's build servers have an older system library (glibc) than Next.js's default compiler needs. Keep both when changing the build setup.

## AliDropship back office

Curated Finds come from **admin.zydane.com**, a WordPress + WooCommerce site running the AliDropship Woo plugin.

- **Products:** import products with AliDropship as usual and publish them. The store picks them up within 5 minutes and shows them in Curated Finds (replacing the sample curated products). Name WooCommerce categories Home, Wellness, Carry, Tech or Kids to place products in the store's categories.
- **Orders:** when a customer pays with Stripe, the AliDropship items of the order are created as a paid "Processing" order in WooCommerce, where AliDropship places them with the supplier. Demo-mode orders (no Stripe key) are never forwarded.
- **Settings** (Hostinger → zydane.com → Node.js → Environment variables, then redeploy): `WC_URL`, `WC_KEY`, `WC_SECRET` (a WooCommerce REST API key with Read/Write access) and `STRIPE_WEBHOOK_SECRET`. In Stripe, add the webhook `https://zydane.com/api/stripe/webhook` for `checkout.session.completed`.

## Selling in the UK and the US

Each product has **one listing**. Visitors see prices in the currency of their market, chosen from their saved choice (the flag button in the header), then their country, then their browser language, and otherwise the UK.

- **Prices:** set `prices: { GBP: { price, compareAt }, USD: … }` on a product for exact prices. Without one, the `price` (in US dollars) is converted at the rate in `site.ts` and rounded to .99.
- **One market only:** add `markets: ["GB"]` to a product (the Face & Neck Massage Set does this). US visitors see a "not available" notice and cannot buy it.
- **Shipping:** free on every order, in both markets.
- **Checkout:** the server decides the market, re-prices the order in that currency and only accepts delivery to that market's country. Stripe is charged in the same currency.
- **Back office:** prices entered in AliDropship/WooCommerce are read in the currency set in WooCommerce → Settings → General (GBP or USD) and converted for the other market.
