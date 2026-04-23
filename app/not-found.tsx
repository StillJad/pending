import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/40">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Page not found
        </h1>
        <p className="max-w-xl text-sm text-white/70">
          The page is gone or the link is wrong.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
          >
            Back home
          </Link>
          <Link
            href="/products"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-[#8b5cf6]/50 hover:text-white"
          >
            Browse products
          </Link>
        </div>
      </div>
    </main>
  );
}
