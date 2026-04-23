"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DISCORD_INVITE_URL,
  formatCurrency,
  getMonogram,
} from "@/lib/site";

type CartItem = {
  id: number;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderFeedback =
  | {
      kind: "success" | "error";
      message: string;
      orderId?: string;
    }
  | null;

function readStoredCart() {
  try {
    return JSON.parse(localStorage.getItem("pending_cart") || "[]") as CartItem[];
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]) {
  localStorage.setItem("pending_cart", JSON.stringify(items));
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<OrderFeedback>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCartItems(readStoredCart());
      setIsLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((t, i) => t + i.quantity, 0);
  }, [cartItems]);

  const updateCart = (next: CartItem[]) => {
    setCartItems(next);
    persistCart(next);
  };

  const updateQuantity = (id: number, delta: number) => {
    updateCart(
      cartItems.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      )
    );
  };

  const removeItem = (id: number) => {
    updateCart(cartItems.filter((i) => i.id !== id));
  };

  const handlePlaceOrder = async () => {
    if (!cartItems.length || isSubmitting) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, total: subtotal }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success || !data?.orderId) {
        throw new Error(data?.error || "Order failed");
      }

      const newOrder = {
        orderId: data.orderId,
        items: cartItems,
        total: subtotal,
        status: "Pending",
        date: new Date().toLocaleDateString(),
      };

      const existing = JSON.parse(localStorage.getItem("pending_orders") || "[]");
      localStorage.setItem("pending_orders", JSON.stringify([newOrder, ...existing]));

      updateCart([]);

      setFeedback({
        kind: "success",
        message: "Order created. Continue in Discord.",
        orderId: data.orderId,
      });

      window.open(DISCORD_INVITE_URL, "_blank");
    } catch {
      setFeedback({ kind: "error", message: "Order failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="space-y-8">
      <section className="grid gap-8 border-b border-white/5 pb-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="max-w-2xl">
          <p className="ui-overline ui-overline-accent">Cart</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
            Review your cart
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
            Check the items. Then place the order.
          </p>
        </div>

        <aside className="ui-panel p-5">
          <p className="ui-overline">Index</p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="ui-overline">Lines</span>
              <span className="font-mono text-xl text-white/90">
                {cartItems.length.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="ui-overline">Items</span>
              <span className="font-mono text-xl text-white/90">
                {totalItems.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="ui-overline">Subtotal</span>
              <span className="font-mono text-base text-[#8b5cf6]">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>
        </aside>
      </section>

      {feedback ? (
        <section
          className={`ui-panel p-5 ${
            feedback.kind === "success" ? "border-[#8b5cf6]/35" : ""
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">
                {feedback.kind === "success" ? "Order created" : "Order failed"}
              </p>
              <p className="mt-2 text-sm text-white/65">{feedback.message}</p>
              {feedback.orderId ? (
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#8b5cf6]">
                  {feedback.orderId}
                </p>
              ) : null}
            </div>

            {feedback.kind === "success" ? (
              <Link href="/orders" className="ui-button-secondary">
                Track order
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {!isLoaded ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_360px]">
          <div className="ui-panel p-6">
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
              <div className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
            </div>
          </div>
          <div className="ui-panel h-80 animate-pulse p-6" />
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_360px]">
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="ui-panel p-8 text-center">
                <p className="text-xl font-semibold tracking-tight text-white">
                  Your cart is empty
                </p>
                <p className="mx-auto mt-3 max-w-lg text-sm text-white/65">
                  Browse the catalog and add something first.
                </p>
                <div className="mt-6">
                  <Link href="/products" className="ui-button-primary">
                    Browse products
                  </Link>
                </div>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="ui-panel ui-panel-hover p-5">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 font-mono text-sm uppercase text-[#8b5cf6]">
                        {getMonogram(item.name)}
                      </div>

                      <div className="max-w-xl">
                        <p className="ui-overline">#{item.id}</p>
                        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">
                          {item.name}
                        </h2>
                        <p className="mt-2 text-sm text-white/60">
                          Unit price{" "}
                          <span className="font-mono text-white/90">
                            {formatCurrency(item.price)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-5 lg:min-w-[180px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <p className="ui-overline">Item total</p>
                      <p className="mt-2 font-mono text-2xl text-[#8b5cf6]">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 p-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-10 w-10 rounded-lg border border-white/10 text-white/80 transition hover:border-[#8b5cf6]/50 hover:text-white"
                        disabled={item.quantity === 1}
                      >
                        -
                      </button>
                      <span className="min-w-10 text-center font-mono text-lg text-white/90">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-10 w-10 rounded-lg border border-white/10 text-white/80 transition hover:border-[#8b5cf6]/50 hover:text-white"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="ui-overline transition hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <aside className="ui-panel p-6 lg:sticky lg:top-28 lg:h-fit">
            <p className="ui-overline ui-overline-accent">Summary</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Order
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Review the totals before you place the order.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="ui-overline">Lines</span>
                <span className="font-mono text-sm text-white/90">
                  {cartItems.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="ui-overline">Items</span>
                <span className="font-mono text-sm text-white/90">
                  {totalItems}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="ui-overline">Subtotal</span>
                <span className="font-mono text-sm text-white/90">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 p-5">
              <p className="ui-overline">Total</p>
              <p className="mt-2 font-mono text-3xl text-[#8b5cf6]">
                {formatCurrency(subtotal)}
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="ui-button-primary mt-8 w-full"
              disabled={!cartItems.length || isSubmitting}
            >
              {isSubmitting ? "Creating order" : "Place order"}
            </button>

            <p className="mt-4 text-sm text-white/50">
              This creates one order, then opens Discord.
            </p>
          </aside>
        </section>
      )}
    </main>
  );
}
