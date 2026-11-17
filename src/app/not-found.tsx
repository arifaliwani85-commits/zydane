import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-5 text-6xl sm:text-7xl">This page has moved on</h1>
      <p className="mt-5 max-w-md text-ink-soft">The page you&apos;re looking for isn&apos;t here, but the good things still are.</p>
      <Link href="/shop" className="btn btn-dark mt-9">Back to the shop</Link>
    </section>
  );
}
