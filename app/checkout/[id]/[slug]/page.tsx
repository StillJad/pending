"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Turnstile } from "@/components/turnstile";
import { products } from "@/data/products";
import { formatCurrency, getMonogram, parsePrice } from "@/lib/site";

type CartItem = {
  id: number;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
};

const fulfillmentNotes = [
  "Price is fixed before checkout.",
  "The cart supports more than one item.",
  "Final handoff happens in Discord.",
] as const;

export default function CheckoutPage() {
  const params = useParams<{ id: string; slug: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

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
    if (!product || !turnstileToken) return;

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
    setTurnstileToken("");
    setTurnstileResetKey((value) => value + 1);
    router.push("/cart");
  };

  if (!product) {
    return (
      <main className="space-y-6">
        <section className="ui-panel p-8 sm:p-10">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Product not found
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/70">
            This product does not exist or the link is no longer valid.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="ui-button-primary">
              Browse products
            </Link>
            <Link href="/ticket" className="ui-button-secondary">
              Open support
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <section className="grid gap-8 border-b border-white/5 pb-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="max-w-2xl">
          <Link
            href={`/products/${product.category.toLowerCase().replace(/\s+/g, "-")}`}
            className="ui-overline transition hover:text-white"
          >
            Back to {product.category}
          </Link>
          <p className="ui-overline ui-overline-accent mt-6">Checkout</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
            {product.name}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
            Pick a quantity. Add it to the cart.
          </p>
        </div>

        <aside className="ui-panel p-5">
          <p className="ui-overline">System</p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="ui-overline">Category</span>
              <span className="font-mono text-sm text-white/90">
                {product.category}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="ui-overline">Product</span>
              <span className="font-mono text-sm text-white/90">
                #{product.id}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="ui-overline">Route</span>
              <span className="font-mono text-sm uppercase tracking-[0.16em] text-[#8b5cf6]">
                cart / discord
              </span>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_360px]">
        <div className="ui-panel p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 font-mono text-sm uppercase text-[#8b5cf6]">
                {getMonogram(product.name)}
              </div>

              <div className="max-w-2xl">
                <p className="ui-overline">{product.category}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  {product.name}
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/70">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 p-4 text-left lg:min-w-[190px] lg:text-right">
              <p className="ui-overline">Unit price</p>
              <p className="mt-2 font-mono text-3xl text-[#8b5cf6]">
                {formatCurrency(unitPrice)}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 p-5">
            <p className="text-lg font-semibold tracking-tight text-white">
              Notes
            </p>
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

        <aside className="ui-panel p-6 lg:sticky lg:top-28 lg:h-fit">
          <p className="ui-overline ui-overline-accent">Summary</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Order
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Review the order before checkout.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <span className="ui-overline">Product</span>
              <span className="max-w-[180px] text-right text-sm text-white/90">
                {product.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="ui-overline">Unit price</span>
              <span className="font-mono text-sm text-white/90">
                {formatCurrency(unitPrice)}
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-6">
            <p className="ui-overline">Quantity</p>
            <div className="mt-3 flex w-fit items-center gap-3 rounded-xl border border-white/10 p-2">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="h-10 w-10 rounded-lg border border-white/10 text-white/80 transition hover:border-[#8b5cf6]/50 hover:text-white"
                disabled={quantity === 1}
              >
                -
              </button>
              <span className="min-w-10 text-center font-mono text-xl text-white/90">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="h-10 w-10 rounded-lg border border-white/10 text-white/80 transition hover:border-[#8b5cf6]/50 hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between">
              <span className="ui-overline">Total</span>
              <span className="font-mono text-3xl text-[#8b5cf6]">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <Turnstile
            className="mt-6"
            onVerify={setTurnstileToken}
            resetKey={turnstileResetKey}
          />

          <button
            onClick={handleAddToCart}
            className="ui-button-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!turnstileToken}
          >
            Add to cart
          </button>

          <p className="mt-4 text-sm text-white/50">
            Add this item to the cart before opening Discord.
          </p>
        </aside>
      </section>
    </main>
  );
}
