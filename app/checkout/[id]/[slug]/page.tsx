"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { products } from "@/data/products";
import { formatCurrency, parsePrice } from "@/lib/site";

type CartItem = {
  id: number;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
};

const fulfillmentNotes = [
  "Transparent pricing before checkout",
  "Multi-item cart support",
  "Discord-based fulfillment after order placement",
] as const;

export default function CheckoutPage() {
  const params = useParams<{ id: string; slug: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const id = params?.id ?? "";
  const slug = params?.slug ?? "";

  const product = useMemo(() => {
    return products.find(
      (item) => String(item.id) === String(id) && String(item.slug) === String(slug)
    );
  }, [id, slug]);

  const unitPrice = product ? parsePrice(product.price) : 0;
  const total = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!product) return;

    const existingCart = JSON.parse(
      localStorage.getItem("pending_cart") || "[]"
    ) as CartItem[];
    const existingItem = existingCart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      existingCart.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: unitPrice,
        quantity,
      });
    }

    localStorage.setItem("pending_cart", JSON.stringify(existingCart));
    router.push("/cart");
  };

  if (!product) {
    return (
      <main className="page-shell">
        <section className="page-header">
          <span className="page-kicker">Missing product</span>
          <h1 className="section-title mt-6">Product not found.</h1>
          <p className="section-copy mt-4">
            This product does not exist or the checkout link is no longer
            valid. Return to the catalog to continue browsing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="button-base button-primary">
              Browse products
            </Link>
            <Link href="/ticket" className="button-base button-secondary">
              Contact support
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <Link
          href={`/products/${product.category.toLowerCase().replace(/\s+/g, "-")}`}
          className="button-base button-ghost w-fit px-0 text-sm uppercase tracking-[0.22em] text-white/55 hover:text-white"
        >
          Back to {product.category}
        </Link>

        <span className="page-kicker mt-6">Checkout</span>
        <h1 className="section-title mt-6">{product.name}</h1>
        <p className="section-copy mt-4">
          Review the product details, set your quantity, and add everything to
          cart before moving into Discord fulfillment.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_420px]">
        <div className="glass-panel p-6 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <span className="chip">{product.category}</span>
                <span className="chip-muted">Product #{product.id}</span>
              </div>

              <h2 className="font-display mt-6 text-4xl tracking-[-0.05em] text-white">
                {product.name}
              </h2>
              <p className="mt-4 max-w-2xl text-white/64">
                {product.description}
              </p>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.05] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                Unit price
              </p>
              <p className="font-display mt-2 text-4xl tracking-[-0.05em] text-white">
                {formatCurrency(unitPrice)}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                Category
              </p>
              <p className="mt-3 text-white/82">{product.category}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                Fulfillment
              </p>
              <p className="mt-3 text-white/82">Discord handoff</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                Cart behavior
              </p>
              <p className="mt-3 text-white/82">Merges duplicate products</p>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="font-display text-xl tracking-[-0.04em] text-white">
              Product details
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/64">
              {fulfillmentNotes.map((note) => (
                <div key={note} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.85)]" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="glass-panel p-6 sm:p-7 lg:sticky lg:top-32 lg:h-fit">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-2xl tracking-[-0.04em] text-white">
                Order summary
              </p>
              <p className="mt-2 text-sm text-white/54">
                Premium cart review before Discord fulfillment.
              </p>
            </div>
            <span className="chip-muted">Live total</span>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-white/72">
              <span>Product</span>
              <span className="max-w-[180px] text-right text-white/88">
                {product.name}
              </span>
            </div>
            <div className="flex items-center justify-between text-white/72">
              <span>Unit price</span>
              <span className="text-white/88">{formatCurrency(unitPrice)}</span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">
              Quantity
            </p>
            <div className="mt-3 flex w-fit items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] p-2">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lg text-white/76 transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white disabled:opacity-40"
                disabled={quantity === 1}
              >
                -
              </button>
              <span className="min-w-10 text-center font-display text-2xl text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lg text-white/76 transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between text-sm text-white/58">
              <span>Quantity</span>
              <span>{quantity}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-base text-white/72">Total</span>
              <span className="font-display text-4xl tracking-[-0.05em] text-white">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="button-base button-primary cta-pulse mt-8 w-full"
          >
            Add to cart
          </button>

          <p className="mt-4 text-sm text-white/52">
            This adds the product to your cart so you can place one cleaner
            order for multiple items before opening Discord.
          </p>
        </aside>
      </section>
    </main>
  );
}
