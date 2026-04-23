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
    return "rounded-full border border-[#8b5cf6]/30 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#c4b5fd]";
  }

  if (normalized.includes("complete") || normalized.includes("delivered")) {
    return "rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/60";
  }

  return "rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/50";
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
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/40">
          Tracking
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Orders
        </h1>
        <p className="max-w-xl text-sm text-white/70">
          Track previous and active orders.
        </p>
        <div className="flex flex-wrap gap-4 font-mono text-xs uppercase tracking-[0.12em] text-white/40">
          <span>{orders.length} orders</span>
          <span>{totalUnits} items</span>
          <span>{formatCurrency(totalSpent)}</span>
        </div>
      </section>

      {!isLoaded ? (
        <section className="mt-8 space-y-4">
          <div className="h-36 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
          <div className="h-36 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
        </section>
      ) : orders.length === 0 ? (
        <section className="mt-8 rounded-xl border border-white/10 p-8 text-center">
          <p className="text-lg font-semibold tracking-tight text-white">
            No orders yet.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
            Place an order and it will show up here.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/products"
              className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
            >
              Browse products
            </Link>
            <Link
              href="/ticket"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-[#8b5cf6]/50 hover:text-white"
            >
              Need help?
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-8 space-y-4">
          {orders.map((order) => (
            <article
              key={order.orderId}
              className="rounded-xl border border-white/10 bg-transparent p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.12em] text-white/40">
                      {order.orderId}
                    </span>
                    <span className={getStatusClasses(order.status)}>
                      {order.status}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">
                    {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </h2>
                  <p className="mt-2 text-sm text-white/60">
                    Saved on{" "}
                    <span className="font-mono text-white/50">{order.date}</span>
                  </p>
                </div>

                <div className="text-left lg:text-right">
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/40">
                    Total
                  </p>
                  <p className="mt-1 font-mono text-2xl text-[#8b5cf6]">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-white/5 rounded-xl border border-white/10">
                {order.items.map((item) => (
                  <div
                    key={`${order.orderId}-${item.id}`}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="mt-1 text-sm text-white/60">
                        <span className="font-mono text-xs uppercase tracking-[0.12em] text-white/40">
                          #{item.id}
                        </span>{" "}
                        • Qty {item.quantity}
                      </p>
                    </div>
                    <p className="font-mono text-sm text-white/90">
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
