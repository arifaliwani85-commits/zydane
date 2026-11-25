import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getCatalog } from "@/lib/catalog";
import { categories, type Category, type Source } from "@/lib/products";

export const metadata: Metadata = { title: "Shop" };

type Params = { category?: string; collection?: string; sort?: string; q?: string };

const sorts = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "rating", label: "Top rated" },
];

const collections: { id: Source; label: string }[] = [
  { id: "house", label: "The Zydane Line" },
  { id: "curated", label: "Curated Finds" },
];

export default async function Shop({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const products = await getCatalog();
  const category = categories.find((c) => c.id === sp.category)?.id as Category | undefined;
  const collection = collections.find((c) => c.id === sp.collection)?.id;
  const sort = sorts.find((s) => s.id === sp.sort)?.id ?? "featured";
  const q = (sp.q ?? "").trim().slice(0, 60);

  const href = (patch: Partial<Params>) => {
    const next = { category, collection, sort: sort === "featured" ? undefined : sort, q: q || undefined, ...patch };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  let list = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!collection || p.source === collection) &&
      (!q || `${p.name} ${p.subtitle} ${p.category} ${p.description}`.toLowerCase().includes(q.toLowerCase())),
  );
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  else if (sort === "rating") list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0));
  else list = [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

  const title = q
    ? `Results for “${q}”`
    : collection
      ? collections.find((c) => c.id === collection)!.label
      : category
        ? categories.find((c) => c.id === category)!.name
        : "Shop all";

  const chip = (active: boolean) =>
    `inline-flex h-10 items-center rounded-full border px-4 text-[13px] transition-colors ${
      active ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink hover:text-ink"
    }`;

  return (
    <div className="container-x pb-10 pt-12 lg:pt-16">
      <nav className="text-xs text-ink-faint" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link> <span className="mx-1.5">/</span> Shop
      </nav>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-6xl sm:text-8xl">{title}</h1>
        <p className="pb-2 text-sm text-ink-soft">{list.length} {list.length === 1 ? "product" : "products"}</p>
      </div>

      <div className="mt-10 flex flex-col gap-4 border-y border-line py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href={href({ category: undefined, collection: undefined, q: undefined })} className={chip(!category && !collection && !q)}>All</Link>
          {collections.map((c) => (
            <Link key={c.id} href={href({ collection: collection === c.id ? undefined : c.id })} className={`${chip(collection === c.id)} shrink-0`}>
              {c.label}
            </Link>
          ))}
          <span className="mx-1 hidden w-px self-stretch bg-line sm:block" />
          {categories.map((c) => (
            <Link key={c.id} href={href({ category: category === c.id ? undefined : c.id })} className={`${chip(category === c.id)} shrink-0`}>
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-4 text-[13px]">
          <span className="text-ink-faint">Sort</span>
          {sorts.map((s) => (
            <Link
              key={s.id}
              href={href({ sort: s.id === "featured" ? undefined : s.id })}
              className={sort === s.id ? "font-medium text-ink underline underline-offset-4" : "text-ink-soft hover:text-ink"}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="py-28 text-center">
          <p className="display text-5xl">Nothing matches — yet</p>
          <p className="mt-4 text-ink-soft">Try a different search or clear your filters.</p>
          <Link href="/shop" className="btn btn-dark mt-8">Clear filters</Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      )}
    </div>
  );
}
