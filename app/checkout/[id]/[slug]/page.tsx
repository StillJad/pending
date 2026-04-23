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
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-white">Product not found.</h1>
          <p className="max-w-xl text-white/70">
            This product does not exist or the link is no longer valid. Return
            to the catalog to keep browsing.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
            >
              Browse products
            </Link>
            <Link
              href="/ticket"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80"
            >
              Contact support
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div>
        <Link
          href={`/products/${product.category.toLowerCase().replace(/\s+/g, "-")}`}
          className="text-sm text-white/60 hover:text-white"
        >
          Back to {product.category}
        </Link>

        <h1 className="mt-4 text-3xl font-semibold text-white">{product.name}</h1>
        <p className="mt-3 max-w-xl text-white/70">
          Review this item, choose a quantity, and add it to your cart before
          opening Discord.
        </p>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_420px]">
        <div className="rounded-xl border border-white/10 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm text-white/50">{product.category}</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {product.name}
              </h2>
              <p className="mt-4 text-white/70">{product.description}</p>
            </div>

            <div className="rounded-xl border border-white/10 p-4 text-left lg:min-w-[180px] lg:text-right">
              <p className="text-sm text-white/50">Unit price</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatCurrency(unitPrice)}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-white/10 p-5">
            <p className="text-lg font-medium text-white">Product details</p>
            <div className="mt-4 space-y-3">
              {fulfillmentNotes.map((note) => (
                <div key={note} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/40" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-xl border border-white/10 p-6">
          <div>
            <p className="text-xl font-medium text-white">Order summary</p>
            <p className="mt-2 text-sm text-white/60">
              Review your order before checkout.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between gap-4 text-white/70">
              <span>Product</span>
              <span className="max-w-[180px] text-right text-white">
                {product.name}
              </span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>Unit price</span>
              <span className="text-white">{formatCurrency(unitPrice)}</span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-white/60">Quantity</p>
            <div className="mt-3 flex w-fit items-center gap-3 rounded-xl border border-white/10 p-2">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="h-10 w-10 rounded-lg border border-white/10 text-white/80 hover:text-white disabled:opacity-40"
                disabled={quantity === 1}
              >
                -
              </button>
              <span className="min-w-10 text-center text-xl font-medium text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="h-10 w-10 rounded-lg border border-white/10 text-white/80 hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 p-5">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Total</span>
              <span className="text-3xl font-semibold text-white">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="mt-8 w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black hover:opacity-90"
          >
            Add to cart
          </button>

          <p className="mt-4 text-sm text-white/50">
            Add this item to your cart before opening Discord.
          </p>
        </aside>
      </section>
    </main>
  );
}
