import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="page-kicker">404</span>
        <h1 className="section-title mt-6">This page is off the grid.</h1>
        <p className="section-copy mt-4">
          The route you tried to open does not exist. Return to the catalog,
          support, or tracking from the main flow.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="button-base button-primary">
            Back home
          </Link>
          <Link href="/products" className="button-base button-secondary">
            Browse products
          </Link>
        </div>
      </section>
    </main>
  );
}
