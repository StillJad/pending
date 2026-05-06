import Link from "next/link";

export default function NotFound() {
  return (
    <main className="space-y-6">
      <section className="ui-panel p-8 sm:p-10">
        <p className="ui-overline ui-overline-accent">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
          Page not found
        </h1>
        <p className="mt-4 max-w-xl text-sm text-white/70">
          The page is gone or the link is wrong.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-black/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
          >
            Back home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-black/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
          >
            Browse products
          </Link>
        </div>
      </section>
    </main>
  );
}
