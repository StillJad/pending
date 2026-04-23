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
    return "rounded-full border border-[#8b5cf6]/35 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#c4b5fd]";
  }

  if (normalized.includes("complete") || normalized.includes("delivered")) {
    return "rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60";
  }

  return "rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50";
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
    <main className="space-y-8">
      <section className="grid gap-8 border-b border-white/5 pb-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="max-w-2xl">
          <p className="ui-overline ui-overline-accent">Tracking</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
            Orders
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
            Track previous and active orders.
          </p>
        </div>

        <aside className="ui-panel p-5">
          <p className="ui-overline">Index</p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="ui-overline">Orders</span>
              <span className="font-mono text-xl text-white/90">
                {orders.length.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="ui-overline">Items</span>
              <span className="font-mono text-xl text-white/90">
                {totalUnits.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="ui-overline">Value</span>
              <span className="font-mono text-base text-[#8b5cf6]">
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </div>
        </aside>
      </section>

      {!isLoaded ? (
        <section className="space-y-4">
          <div className="ui-panel h-36 animate-pulse" />
          <div className="ui-panel h-36 animate-pulse" />
        </section>
      ) : orders.length === 0 ? (
        <section className="ui-panel p-10 text-center">
          <p className="text-xl font-semibold tracking-tight text-white">
            No orders yet
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/65">
            Place an order and it will show up here.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/products" className="ui-button-primary">
              Browse products
            </Link>
            <Link href="/ticket" className="ui-button-secondary">
              Open support
            </Link>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {orders.map((order) => (
            <article key={order.orderId} className="ui-panel p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                      {order.orderId}
                    </span>
                    <span className={getStatusClasses(order.status)}>
                      {order.status}
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                    {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </h2>
                  <p className="mt-2 text-sm text-white/60">
                    Saved on{" "}
                    <span className="font-mono text-white/50">{order.date}</span>
                  </p>
                </div>

                <div className="border-t border-white/10 pt-5 lg:min-w-[180px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 lg:text-right">
                  <p className="ui-overline">Total</p>
                  <p className="mt-2 font-mono text-3xl text-[#8b5cf6]">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-white/5 rounded-2xl border border-white/10">
                {order.items.map((item) => (
                  <div
                    key={`${order.orderId}-${item.id}`}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-base font-medium text-white">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-white/60">
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
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
