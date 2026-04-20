"use client";

import { useEffect, useState } from "react";

type Order = {
  orderId: string;
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: string;
  date: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem("pending_orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Orders</h1>
        <p className="mt-3 text-white/70">
          Track previous and active orders.
        </p>

        <div className="mt-10 space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
              No orders yet.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-white/50">{order.orderId}</p>
                    <h2 className="text-xl font-semibold">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </h2>
                  </div>
                  <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                </div>

                <div className="mt-4 space-y-2 text-sm text-white/70">
                  <p>Status: {order.status}</p>
                  <p>Date: {order.date}</p>

                  <div className="pt-2">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        {item.name} x{item.quantity}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
