"use client";

import { useEffect, useMemo, useState } from "react";

type CartItem = {
  id: number;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("pending_cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <main className="text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Cart</h1>
        <p className="mt-4 text-white/60">
          Review your selected products before placing your Discord order.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_420px]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold text-purple-300">Items</h2>

            <div className="mt-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur p-4 text-white/60">
                  Your cart is empty.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-black/30 backdrop-blur p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="mt-1 text-sm text-white/50">
                          Product ID: {item.id}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-white/50">
                          Qty: {item.quantity}
                        </p>
                        <p className="mt-1 font-semibold text-purple-300">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold text-purple-300">Summary</h2>

            <div className="mt-6 flex items-center justify-between text-white/80">
              <span>Items</span>
              <span>{cartItems.length}</span>
            </div>

            <div className="mt-4 flex items-center justify-between text-white/80">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between text-xl font-semibold">
                <span>Total</span>
                <span className="text-purple-300">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={async () => {
              const res = await fetch("/api/order", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    items: cartItems,
    total: subtotal,
  }),
});
                const data = await res.json();

                const newOrder = {
                  orderId: data.orderId,
                  items: cartItems,
                  total: subtotal,
                  status: "Pending",
                  date: new Date().toLocaleDateString(),
                };

                const existingOrders = JSON.parse(
                  localStorage.getItem("pending_orders") || "[]"
                );

                localStorage.setItem(
                  "pending_orders",
                  JSON.stringify([newOrder, ...existingOrders])
                );

                alert("Order Created: " + data.orderId);

                window.open("https://discord.gg/YOUR_INVITE", "_blank");
              }}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              disabled={cartItems.length === 0}
            >
              Place Order
            </button>

            <p className="mt-4 text-sm text-white/50">
              Later this will create one Discord ticket with all cart items and quantities.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
