"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/site";

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

function getStatusClasses(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("pending")) {
    return "rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-2.5 py-1 text-xs font-medium text-[#c4b5fd]";
  }

  if (normalized.includes("complete") || normalized.includes("delivered")) {
    return "rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium text-white/70";
  }

  return "rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium text-white/60";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("pending_orders");
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  const totalUnits = useMemo(() => {
    return orders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0),
      0
    );
  }, [orders]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="space-y-4">
        <p className="text-sm font-medium text-[#8b5cf6]">Tracking</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Orders
        </h1>
        <p className="max-w-xl text-white/70">
          Track previous and active orders.
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-white/50">
          <span>{orders.length} saved orders</span>
          <span>{totalUnits} total units</span>
          <span>{formatCurrency(totalSpent)} total value</span>
        </div>
      </section>

      {!isLoaded ? (
        <section className="mt-8 space-y-4">
          <div className="h-36 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
          <div className="h-36 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
        </section>
      ) : orders.length === 0 ? (
        <section className="mt-8 rounded-xl border border-white/10 p-8 text-center">
          <p className="text-xl font-medium text-white">No orders yet.</p>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Once you place an order, it will appear here with its order ID and
            saved items.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/products"
              className="rounded-lg bg-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
            >
              Browse products
            </Link>
            <Link
              href="/ticket"
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-[#8b5cf6]/40 hover:text-white"
            >
              Open support
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-8 space-y-4">
          {orders.map((order) => (
            <article
              key={order.orderId}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-white/50">{order.orderId}</span>
                    <span className={getStatusClasses(order.status)}>
                      {order.status}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-medium text-white">
                    {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </h2>
                  <p className="mt-2 text-sm text-white/60">
                    Saved on {order.date}
                  </p>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-sm text-white/50">Order total</p>
                  <p className="mt-1 text-2xl font-semibold text-[#8b5cf6]">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10">
                {order.items.map((item) => (
                  <div
                    key={`${order.orderId}-${item.id}`}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="mt-1 text-sm text-white/60">
                        Product #{item.id} • Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm text-white/70">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
