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

  if (normalized.includes("complete") || normalized.includes("delivered")) {
    return "status-pill status-complete";
  }

  if (normalized.includes("cancel")) {
    return "status-pill status-cancelled";
  }

  return "status-pill status-pending";
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
    <main className="page-shell">
      <section className="page-header">
        <span className="page-kicker">
          <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.9)]" />
          Order tracking
        </span>
        <h1 className="section-title mt-6">Track previous and active orders.</h1>
        <p className="section-copy mt-4">
          Keep your Pending order history clean, readable, and easy to review
          after Discord fulfillment begins.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <div className="chip">
            <span className="font-display text-white">
              {orders.length.toString().padStart(2, "0")}
            </span>
            orders saved
          </div>
          <div className="chip">{totalUnits} total units</div>
          <div className="chip">{formatCurrency(totalSpent)} lifetime value</div>
        </div>
      </section>

      {!isLoaded ? (
        <section className="space-y-4">
          <div className="glass-panel h-40 animate-pulse p-6" />
          <div className="glass-panel h-40 animate-pulse p-6" />
        </section>
      ) : orders.length === 0 ? (
        <section className="glass-panel p-8 text-center">
          <p className="font-display text-2xl tracking-[-0.04em] text-white">
            No orders yet.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Once you place an order, it will appear here with its order ID,
            totals, and stored item details.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/products" className="button-base button-primary">
              Browse products
            </Link>
            <Link href="/ticket" className="button-base button-secondary">
              Open support
            </Link>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {orders.map((order, index) => (
            <article
              key={order.orderId}
              className={`glass-panel p-6 sm:p-7 reveal-up stagger-${
                (index % 4) + 1
              }`}
            >
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="chip-muted">{order.orderId}</span>
                    <span className={getStatusClasses(order.status)}>
                      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                      {order.status}
                    </span>
                  </div>

                  <h2 className="font-display mt-5 text-3xl tracking-[-0.04em] text-white">
                    {order.items.length} item
                    {order.items.length === 1 ? "" : "s"} in this order
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="chip-muted">Saved on {order.date}</span>
                    <span className="chip-muted">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      total units
                    </span>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-4 text-left xl:min-w-[220px] xl:text-right">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/38">
                    Order total
                  </p>
                  <p className="font-display mt-2 text-4xl tracking-[-0.05em] text-white">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3">
                {order.items.map((item) => (
                  <div
                    key={`${order.orderId}-${item.id}`}
                    className="glass-card p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-display text-xl tracking-[-0.03em] text-white">
                          {item.name}
                        </p>
                        <p className="mt-2 text-sm text-white/52">
                          Product #{item.id} • Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm text-white/72">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
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
