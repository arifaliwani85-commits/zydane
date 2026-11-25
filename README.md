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
| Store name, currency, shipping fee, free-shipping threshold, support email | `src/lib/site.ts` |
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
