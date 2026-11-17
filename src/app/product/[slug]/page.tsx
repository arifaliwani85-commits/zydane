import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { CheckIcon, ReturnIcon, StarIcon, TruckIcon } from "@/components/Icons";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import { money } from "@/lib/format";
import { categories, getProduct, products } from "@/lib/products";
import { fulfilment, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const f = fulfilment[product.source];
  const category = categories.find((c) => c.id === product.category)!;
  const related = [
    ...products.filter((p) => p.slug !== product.slug && p.category === product.category),
    ...products.filter((p) => p.slug !== product.slug && p.category !== product.category && p.featured),
  ].slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: site.name },
    offers: { "@type": "Offer", price: product.price, priceCurrency: site.currency, availability: "https://schema.org/InStock" },
  };

  return (
    <div className="container-x pt-8 lg:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="text-xs text-ink-faint" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link> <span className="mx-1.5">/</span>
        <Link href={`/shop?category=${category.id}`} className="hover:text-ink">{category.name}</Link> <span className="mx-1.5">/</span>
        <span className="text-ink-soft">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="aspect-[4/5] overflow-hidden rounded-[28px] bg-shell sm:col-span-2 sm:aspect-square">
            <ProductArt product={product} />
          </div>
          <div className="hidden aspect-square overflow-hidden rounded-3xl bg-shell sm:block">
            <ProductArt product={product} className="scale-[1.7]" />
          </div>
          <div className="hidden aspect-square flex-col justify-between rounded-3xl bg-forest-deep p-8 text-cream sm:flex">
            <p className="eyebrow !text-cream/50">{f.label}</p>
            <p className="display text-4xl leading-[1.05]">
              {product.source === "house"
                ? "Designed by us, made with partners we know by name."
                : "Chosen by us, shipped to you by the maker."}
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{f.label} · {category.name}</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl">{product.name}</h1>
          <p className="mt-3 text-ink-soft">{product.subtitle}</p>

          <div className="mt-5 flex items-center gap-2 text-sm">
            <span className="flex text-bronze" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className={i < Math.round(product.rating) ? "" : "opacity-25"} />
              ))}
            </span>
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-ink-faint">({product.reviews} reviews)</span>
          </div>

          <p className="mt-7 flex items-baseline gap-3">
            <span className="display text-5xl tabular-nums">{money(product.price)}</span>
            {product.compareAt && <s className="text-lg text-ink-faint">{money(product.compareAt)}</s>}
          </p>

          <p className="mt-7 leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-9">
            <AddToCart product={product} />
          </div>

          <ul className="mt-8 space-y-3 rounded-2xl bg-shell p-6 text-sm">
            <li className="flex gap-3"><TruckIcon className="mt-0.5 shrink-0 text-forest" /><span><span className="font-medium">{f.shipping}.</span> {f.delivery}.</span></li>
            <li className="flex gap-3"><ReturnIcon className="mt-0.5 shrink-0 text-forest" /><span>30-day returns and free shipping over {money(site.freeShippingThreshold)}.</span></li>
          </ul>

          <div className="mt-8 divide-y divide-line border-y border-line">
            <details open className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                Details <span className="text-xl font-light transition-transform group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
                {product.details.map((d) => (
                  <li key={d} className="flex gap-2.5"><CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-forest" />{d}</li>
                ))}
              </ul>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                Shipping &amp; returns <span className="text-xl font-light transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                {f.shipping}. {f.delivery}, with tracking sent by email. If it isn&apos;t right, return it within 30 days
                for a full refund — email {site.supportEmail} and we&apos;ll arrange it.
              </p>
            </details>
          </div>
        </div>
      </div>

      <section className="pt-24">
        <h2 className="display text-5xl sm:text-6xl">You may also like</h2>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {related.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>
    </div>
  );
}
