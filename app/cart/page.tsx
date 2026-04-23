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
    } catch (e) {
      setFeedback({ kind: "error", message: "Order failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Cart</h1>

      {feedback && (
        <div className="mt-6 border border-white/10 rounded-lg p-4">
          <p className="text-white font-medium">
            {feedback.kind === "success" ? "Order created" : "Error"}
          </p>
          <p className="text-white/70 text-sm mt-1">{feedback.message}</p>
        </div>
      )}

      {!isLoaded ? (
        <p className="text-white/60 mt-6">Loading...</p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center border border-white/10 rounded-xl p-6">
                <p className="text-white">Cart is empty</p>
                <Link href="/products" className="mt-4 inline-block text-sm text-white/70 hover:text-white">
                  Browse products
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="border border-white/10 rounded-xl p-4 flex justify-between">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 flex items-center justify-center border border-white/10 rounded-md text-white/70">
                      {getMonogram(item.name)}
                    </div>
                    <div>
                      <p className="text-white">{item.name}</p>
                      <p className="text-white/60 text-sm">{formatCurrency(item.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, -1)} className="px-2">-</button>
                    <span className="text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="px-2">+</button>
                    <button onClick={() => removeItem(item.id)} className="text-xs text-red-400">remove</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <aside className="border border-white/10 rounded-xl p-5">
            <p className="text-white text-lg">Summary</p>
            <p className="text-white/60 text-sm mt-2">{totalItems} items</p>
            <p className="text-white text-2xl mt-4">{formatCurrency(subtotal)}</p>

            <button
              onClick={handlePlaceOrder}
              disabled={!cartItems.length || isSubmitting}
              className="mt-6 w-full bg-white text-black py-2 rounded-lg"
            >
              {isSubmitting ? "Processing..." : "Place order"}
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
