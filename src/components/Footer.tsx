import Link from "next/link";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";
import { Newsletter } from "./Newsletter";

export function Footer() {
  return (
    <footer className="mt-28 bg-forest-deep text-cream">
      <div className="container-x grid gap-14 py-20 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="eyebrow !text-cream/50">The Zydane letter</p>
          <h2 className="display mt-4 max-w-[14ch] text-5xl sm:text-6xl">New arrivals, first. Nothing else.</h2>
          <Newsletter />
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <div>
            <p className="eyebrow !text-cream/50">Shop</p>
            <ul className="mt-5 space-y-3">
              <li><Link className="link-underline" href="/shop">All products</Link></li>
              <li><Link className="link-underline" href="/shop?collection=house">The Zydane Line</Link></li>
              <li><Link className="link-underline" href="/shop?collection=curated">Curated Finds</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-cream/50">Categories</p>
            <ul className="mt-5 space-y-3">
              {categories.map((c) => (
                <li key={c.id}><Link className="link-underline" href={`/shop?category=${c.id}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-cream/50">Care</p>
            <ul className="mt-5 space-y-3">
              <li><Link className="link-underline" href="/#promise">Shipping &amp; returns</Link></li>
              <li><Link className="link-underline" href="/#story">Our story</Link></li>
              <li><a className="link-underline" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a></li>
              <li><a className="link-underline" href={`mailto:${site.altEmail}`}>{site.altEmail}</a></li>
              <li><a className="link-underline" href={`tel:${site.phoneHref}`}>{site.phone}</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col items-start justify-between gap-4 py-8 text-xs text-cream/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Secure checkout · Visa · Mastercard · Amex · Apple Pay · Google Pay</p>
        </div>
      </div>
      <div className="overflow-hidden" aria-hidden>
        <p className="display -mb-[0.2em] select-none text-center text-[28vw] leading-[0.8] text-cream/[0.06]">{site.name}</p>
      </div>
    </footer>
  );
}
