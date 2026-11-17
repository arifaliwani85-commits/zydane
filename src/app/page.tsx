import Link from "next/link";
import { ArrowIcon, LeafIcon, ReturnIcon, ShieldIcon, StarIcon, TruckIcon } from "@/components/Icons";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { money } from "@/lib/format";
import { categories, getProduct, products } from "@/lib/products";
import { site } from "@/lib/site";

const house = products.filter((p) => p.source === "house");
const curated = products.filter((p) => p.source === "curated");

const promises = [
  { icon: TruckIcon, title: "Fast, tracked delivery", text: `Free over ${money(site.freeShippingThreshold)}. Our own line leaves the warehouse within 24 hours.` },
  { icon: ReturnIcon, title: "30-day returns", text: "Changed your mind? Send it back within 30 days for a full refund." },
  { icon: ShieldIcon, title: "Vetted, every piece", text: "We test each product ourselves before it earns a place in the shop." },
  { icon: LeafIcon, title: "Made responsibly", text: "Plastic-free packaging and carbon-neutral shipping as standard." },
];

const reviews = [
  { quote: "The mug is the first thing I reach for every morning. It feels like it cost three times as much.", name: "Hannah R.", item: "Atlas Ceramic Mug" },
  { quote: "Beautifully packed, arrived in two days, and the candle scent is unlike anything else I own.", name: "Daniel O.", item: "No. 1 Botanical Candle" },
  { quote: "I've bought the tote twice now — once for me and once because my sister kept borrowing mine.", name: "Priya S.", item: "Field Canvas Tote" },
];

export default function Home() {
  const hero = getProduct("no-1-botanical-candle")!;
  const heroAlt = getProduct("atlas-ceramic-mug")!;
  const story = getProduct("merino-lounge-throw")!;

  return (
    <>
      {/* Hero */}
      <section className="container-x grid items-end gap-10 pb-16 pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24 lg:pt-16">
        <div className="lg:pb-10">
          <p className="eyebrow rise">Autumn collection · 2026</p>
          <h1 className="display rise mt-6 text-[clamp(3.4rem,8.4vw,8rem)]" style={{ animationDelay: "80ms" }}>
            Everyday objects, <em className="text-forest">considered.</em>
          </h1>
          <p className="rise mt-7 max-w-[46ch] text-[17px] leading-relaxed text-ink-soft" style={{ animationDelay: "180ms" }}>
            We design our own line of essentials and seek out the best finds from independent makers — so everything
            in your home earns its place.
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "280ms" }}>
            <Link href="/shop?collection=house" className="btn btn-dark">
              Shop the Zydane Line <ArrowIcon width={16} height={16} />
            </Link>
            <Link href="/shop?collection=curated" className="btn btn-outline">
              Explore Curated Finds
            </Link>
          </div>
          <div className="rise mt-12 flex items-center gap-3 text-sm text-ink-soft" style={{ animationDelay: "380ms" }}>
            <span className="flex text-bronze" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
            </span>
            <span><span className="font-medium text-ink">4.8 out of 5</span> from 4,500+ verified reviews</span>
          </div>
        </div>

        <div className="rise relative" style={{ animationDelay: "200ms" }}>
          <Link href={`/product/${hero.slug}`} className="group block aspect-[4/5] overflow-hidden rounded-[28px] bg-shell">
            <div className="h-full transition-transform duration-[1600ms] ease-out-soft group-hover:scale-[1.04]">
              <ProductArt product={hero} />
            </div>
          </Link>
          <Link
            href={`/product/${heroAlt.slug}`}
            className="absolute -bottom-6 -left-4 hidden w-44 rounded-2xl bg-paper p-2.5 shadow-[0_24px_60px_-20px_rgba(22,21,18,0.35)] transition-transform duration-500 hover:-translate-y-1 sm:block lg:-left-12"
          >
            <div className="aspect-square overflow-hidden rounded-xl"><ProductArt product={heroAlt} /></div>
            <p className="px-1.5 pt-3 text-[13px] font-medium">{heroAlt.name}</p>
            <p className="px-1.5 pb-1.5 text-[13px] text-ink-soft">{money(heroAlt.price)}</p>
          </Link>
          <div className="absolute right-4 top-4 rounded-full bg-paper/90 px-4 py-2 text-xs backdrop-blur">
            <span className="font-medium">{hero.name}</span> · {money(hero.price)}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-x py-14">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
          {categories.map((c, i) => (
            <Link key={c.id} href={`/shop?category=${c.id}`} className="group flex min-h-44 flex-col justify-between bg-paper p-6 transition-colors duration-500 hover:bg-shell sm:p-8">
              <span className="eyebrow">0{i + 1}</span>
              <span>
                <span className="display flex items-center justify-between text-4xl sm:text-5xl">
                  {c.name}
                  <ArrowIcon className="-translate-x-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
                <span className="mt-2 block text-sm text-ink-soft">{c.blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Zydane Line */}
      <section className="container-x py-14">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Designed in-house</p>
            <h2 className="display mt-4 text-5xl sm:text-7xl">The Zydane Line</h2>
            <p className="mt-4 max-w-[52ch] text-ink-soft">
              Our own designs, made with partners we know by name and shipped from our warehouse within a day.
            </p>
          </div>
          <Link href="/shop?collection=house" className="link-underline text-sm font-medium">View all {house.length} pieces</Link>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {house.slice(0, 4).map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}><ProductCard product={p} /></Reveal>
          ))}
        </div>
      </section>

      {/* Story */}
      <section id="story" className="mt-14 scroll-mt-24 bg-forest-deep text-cream">
        <div className="container-x grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <Reveal className="overflow-hidden rounded-[28px]">
            <div className="aspect-[5/4]"><ProductArt product={story} /></div>
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow !text-cream/50">Our story</p>
            <h2 className="display mt-5 text-5xl sm:text-6xl lg:text-7xl">
              Fewer things. <em className="text-[#D9A66B]">Better made.</em>
            </h2>
            <p className="mt-7 max-w-[50ch] leading-relaxed text-cream/75">
              Zydane began with a simple frustration: too many products, too few worth keeping. So we started making
              our own — and for everything we don&apos;t make, we find the people who do it best and bring their work
              to you directly.
            </p>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-cream/15 pt-8">
              {[["40k+", "Happy customers"], ["24 h", "Dispatch on our line"], ["30 days", "Free returns"]].map(([n, l]) => (
                <div key={l}>
                  <dt className="display text-4xl">{n}</dt>
                  <dd className="mt-1 text-xs text-cream/55">{l}</dd>
                </div>
              ))}
            </dl>
            <Link href="/shop" className="btn btn-light mt-10">Shop the collection</Link>
          </Reveal>
        </div>
      </section>

      {/* Curated */}
      <section className="container-x pt-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Sourced from independent makers</p>
            <h2 className="display mt-4 text-5xl sm:text-7xl">Curated Finds</h2>
            <p className="mt-4 max-w-[52ch] text-ink-soft">
              The pieces we wish we&apos;d made ourselves, shipped straight to you from the people who did.
            </p>
          </div>
          <Link href="/shop?collection=curated" className="link-underline text-sm font-medium">View all {curated.length} finds</Link>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {curated.slice(0, 4).map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}><ProductCard product={p} /></Reveal>
          ))}
        </div>
      </section>

      {/* Promise */}
      <section id="promise" className="container-x scroll-mt-24 pt-24">
        <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((p) => (
            <div key={p.title} className="bg-paper p-8">
              <p.icon width={26} height={26} className="text-forest" />
              <h3 className="mt-6 text-[15px] font-medium">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="container-x pt-24">
        <Reveal>
          <p className="eyebrow">In their words</p>
          <h2 className="display mt-4 text-5xl sm:text-6xl">Kept, used, loved.</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 90}>
              <figure className="flex h-full flex-col rounded-3xl bg-shell p-8">
                <span className="flex text-bronze" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, s) => <StarIcon key={s} />)}
                </span>
                <blockquote className="display mt-6 flex-1 text-[28px] leading-[1.15]">“{r.quote}”</blockquote>
                <figcaption className="mt-8 text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-ink-soft"> · Verified buyer of {r.item}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
