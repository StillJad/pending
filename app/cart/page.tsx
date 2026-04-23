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
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const updateCart = (nextItems: CartItem[]) => {
    setCartItems(nextItems);
    persistCart(nextItems);
  };

  const updateQuantity = (id: number, delta: number) => {
    const nextItems = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );

    updateCart(nextItems);
  };

  const removeItem = (id: number) => {
    updateCart(cartItems.filter((item) => item.id !== id));
  };

  const handlePlaceOrder = async () => {
    if (!cartItems.length || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems,
          total: subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.orderId) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Unable to create your order right now."
        );
      }

      const newOrder = {
        orderId: data.orderId,
        items: cartItems,
        total: subtotal,
        status: "Pending",
        date: new Date().toLocaleDateString(),
      };

      const existingOrders = JSON.parse(
        localStorage.getItem("pending_orders") || "[]"
      ) as typeof newOrder[];

      localStorage.setItem(
        "pending_orders",
        JSON.stringify([newOrder, ...existingOrders])
      );

      updateCart([]);

      setFeedback({
        kind: "success",
        message:
          "Your order was created successfully. Discord has been opened in a new tab so fulfillment can continue there.",
        orderId: data.orderId,
      });

      window.open(DISCORD_INVITE_URL, "_blank", "noopener,noreferrer");
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create your order right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="page-header">
        <span className="page-kicker">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
          Cart review
        </span>
        <h1 className="section-title mt-6">One polished cart before Discord.</h1>
        <p className="section-copy mt-4">
          Review your selected products, adjust quantities, and submit a single
          Pending order before moving into Discord fulfillment.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <div className="chip">
            <span className="font-display text-white">
              {totalItems.toString().padStart(2, "0")}
            </span>
            items selected
          </div>
          <div className="chip">Live subtotal {formatCurrency(subtotal)}</div>
          <div className="chip">One order record, one Discord handoff</div>
        </div>
      </section>

      {feedback ? (
        <section
          className={`glass-panel p-5 ${
            feedback.kind === "success"
              ? "border-emerald-300/20"
              : "border-rose-300/20"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl tracking-[-0.04em] text-white">
                {feedback.kind === "success"
                  ? "Order created"
                  : "Unable to create order"}
              </p>
              <p className="mt-2 max-w-3xl text-sm text-white/62">
                {feedback.message}
              </p>
              {feedback.orderId ? (
                <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/46">
                  {feedback.orderId}
                </p>
              ) : null}
            </div>

            {feedback.kind === "success" ? (
              <Link href="/orders" className="button-base button-secondary w-fit">
                View tracking
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {!isLoaded ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_420px]">
          <div className="glass-panel p-6">
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-3xl bg-white/[0.05]" />
              <div className="h-24 animate-pulse rounded-3xl bg-white/[0.05]" />
            </div>
          </div>
          <div className="glass-panel h-80 animate-pulse p-6" />
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_420px]">
          <div className="glass-panel p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl tracking-[-0.04em] text-white">
                  Cart items
                </h2>
                <p className="mt-2 text-sm text-white/52">
                  Adjust quantities or remove items before submitting.
                </p>
              </div>
              <span className="chip-muted">{cartItems.length} line items</span>
            </div>

            {cartItems.length === 0 ? (
              <div className="mt-8 glass-card p-8 text-center">
                <p className="font-display text-2xl tracking-[-0.04em] text-white">
                  Your cart is empty.
                </p>
                <p className="mx-auto mt-3 max-w-lg text-white/60">
                  Browse the catalog and add products to build a single refined
                  order before opening Discord.
                </p>
                <div className="mt-6 flex justify-center">
                  <Link href="/products" className="button-base button-primary">
                    Browse products
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`glass-card p-5 reveal-up stagger-${(index % 4) + 1}`}
                  >
                    <div className="card-glow" />

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] font-display text-sm tracking-[0.28em] text-white/78">
                          {getMonogram(item.name)}
                        </div>

                        <div className="max-w-xl">
                          <p className="text-xs uppercase tracking-[0.22em] text-white/38">
                            Product #{item.id}
                          </p>
                          <h3 className="font-display mt-2 text-2xl tracking-[-0.04em] text-white">
                            {item.name}
                          </h3>
                          <p className="mt-2 text-sm text-white/52">
                            Unit price {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-4 sm:items-end">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left sm:text-right">
                          <p className="text-xs uppercase tracking-[0.22em] text-white/38">
                            Item total
                          </p>
                          <p className="font-display mt-2 text-2xl tracking-[-0.04em] text-white">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] p-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lg text-white/72 transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white disabled:opacity-40"
                            disabled={item.quantity === 1}
                          >
                            -
                          </button>
                          <span className="min-w-10 text-center font-display text-xl text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lg text-white/72 transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="button-base button-ghost min-h-0 p-0 text-xs uppercase tracking-[0.22em] text-white/45 hover:text-rose-200"
                        >
                          Remove item
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="glass-panel p-6 sm:p-7 lg:sticky lg:top-32 lg:h-fit">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl tracking-[-0.04em] text-white">
                  Summary
                </h2>
                <p className="mt-2 text-sm text-white/52">
                  Clean totals before your order is submitted.
                </p>
              </div>
              <span className="chip-muted">Ready to place</span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between text-white/72">
                <span>Line items</span>
                <span className="text-white/88">{cartItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-white/72">
                <span>Total quantity</span>
                <span className="text-white/88">{totalItems}</span>
              </div>
              <div className="flex items-center justify-between text-white/72">
                <span>Subtotal</span>
                <span className="text-white/88">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/38">
                Final total
              </p>
              <p className="font-display mt-3 text-5xl tracking-[-0.06em] text-white">
                {formatCurrency(subtotal)}
              </p>
              <p className="mt-3 text-sm text-white/52">
                Submitting creates a Pending order record, then opens Discord so
                fulfillment can continue there.
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="button-base button-primary cta-pulse mt-8 w-full"
              disabled={cartItems.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Creating order..." : "Place order"}
            </button>

            <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/54">
              All items in this cart are grouped into one cleaner order flow for
              Discord-based fulfillment.
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
