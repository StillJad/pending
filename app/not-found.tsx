import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-4">
        <p className="text-sm font-medium text-[#8b5cf6]">404</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Page not found
        </h1>
        <p className="max-w-xl text-white/70">
          The page you tried to open does not exist. Return to the main flow to
          keep browsing.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
          >
            Back home
          </Link>
          <Link
            href="/products"
            className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-[#8b5cf6]/40 hover:text-white"
          >
            Browse products
          </Link>
        </div>
      </div>
    </main>
  );
}
