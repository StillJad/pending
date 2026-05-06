"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { formatCurrency, getMonogram, parsePrice } from "@/lib/site";

type ProductCardProps = {
  product: Product;
  ctaLabel?: string;
};

export function ProductCard({
  product,
  ctaLabel = "Open checkout",
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showIcon = Boolean(product.icon) && !imageFailed;

  return (
    <Link
      href={`/checkout/${product.id}/${product.slug}`}
      className="group block overflow-hidden rounded-[1.9rem] border border-white/10 bg-[#09090b] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#0c0c0f]"
    >
      <div className="px-7 py-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {showIcon ? (
                <img
                  src={product.icon}
                  alt={product.name}
                  className="h-10 w-10 object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    setImageFailed(true);
                  }}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold tracking-[0.14em] text-black">
                  {getMonogram(product.name)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72">
                {product.category}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {product.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {product.description}
              </p>
            </div>
          </div>

          <span className="rounded-full border border-white/20 bg-white px-3 py-1 text-xs font-semibold text-black">
            {product.badge}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/48">
                Duration
              </p>
              <p className="mt-1 text-sm font-medium text-white/84">
                {product.duration}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/48">
                Price
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {formatCurrency(parsePrice(product.price))}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/8 pt-5">
          <span className="text-sm text-white/62">{ctaLabel}</span>
          <span className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition group-hover:bg-white/90">
            Open checkout
          </span>
        </div>
      </div>
    </Link>
  );
}
