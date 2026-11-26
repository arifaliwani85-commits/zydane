"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useMarket } from "@/lib/market-client";
import { site } from "@/lib/site";
import { MarketSwitch } from "./MarketSwitch";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from "./Icons";

const nav = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?collection=house", label: "The Zydane Line" },
  { href: "/shop?collection=curated", label: "Curated Finds" },
  { href: "/#story", label: "Our story" },
];

export function Header() {
  const { count, setOpen } = useCart();
  const { market, money } = useMarket();
  const notes = [
    "Free shipping on every order",
    "30-day returns, no questions",
    "Zydane Line ships within 24 hours",
    "Secure checkout with card or PayPal",
  ];
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    setSearch(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <>
      <div className="overflow-hidden bg-forest-deep py-2.5 text-cream">
        <div className="marquee flex w-max gap-14 whitespace-nowrap text-[11px] uppercase tracking-[0.2em]">
          {[...notes, ...notes, ...notes, ...notes].map((n, i) => (
            <span key={i} className="flex items-center gap-14" aria-hidden={i >= notes.length}>
              {n}
              <span className="h-1 w-1 rounded-full bg-bronze" />
            </span>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled ? "border-b border-line bg-paper/85 backdrop-blur-xl" : "border-b border-transparent bg-paper"
        }`}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <div className="flex flex-1 items-center gap-8">
            <button className="-ml-2 p-2 lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
              <MenuIcon />
            </button>
            <nav className="hidden items-center gap-8 text-[13px] lg:flex" aria-label="Main">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="link-underline text-ink-soft transition-colors hover:text-ink">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" className="display text-[30px] leading-none tracking-[0.02em]" aria-label={`${site.name} home`}>
            {site.name}
          </Link>

          <div className="flex flex-1 items-center justify-end gap-1">
            <MarketSwitch />
            <button className="p-2.5" onClick={() => setSearch((s) => !s)} aria-label="Search" aria-expanded={search}>
              <SearchIcon />
            </button>
            <button className="relative flex items-center gap-2 p-2.5" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} items`}>
              <BagIcon />
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1.5 text-[10px] font-medium tabular-nums text-paper">
                {count}
              </span>
            </button>
          </div>
        </div>

        {search && (
          <div className="border-t border-line bg-paper">
            <form onSubmit={onSearch} className="container-x flex items-center gap-4 py-4">
              <SearchIcon className="shrink-0 text-ink-faint" />
              <input
                name="q"
                autoFocus
                placeholder="Search candles, totes, serums…"
                aria-label="Search products"
                className="display h-12 w-full bg-transparent text-2xl placeholder:text-ink-faint focus:outline-none sm:text-3xl"
              />
              <button type="button" onClick={() => setSearch(false)} className="p-2" aria-label="Close search">
                <CloseIcon />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menu ? "" : "pointer-events-none"}`} aria-hidden={!menu}>
        <div
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-500 ${menu ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenu(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-paper p-6 transition-transform duration-500 ease-out-soft ${
            menu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="display text-3xl">{site.name}</span>
            <button className="-mr-2 p-2" onClick={() => setMenu(false)} aria-label="Close menu" tabIndex={menu ? 0 : -1}>
              <CloseIcon />
            </button>
          </div>
          <nav className="mt-12 flex flex-col" aria-label="Mobile">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                tabIndex={menu ? 0 : -1}
                onClick={() => setMenu(false)}
                className="display border-b border-line py-5 text-4xl"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <p className="mt-auto text-sm text-ink-soft">{site.supportEmail}</p>
        </div>
      </div>
    </>
  );
}
