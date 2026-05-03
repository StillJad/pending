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
      className="pending-product-card block"
    >
      <div className="border-b border-white/8 px-6 py-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06]">
            {showIcon ? (
              <img
                src={product.icon}
                alt={product.category}
                className="h-9 w-9 object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  setImageFailed(true);
                }}
              />
            ) : (
              <span className="text-sm font-semibold tracking-[0.14em] text-white/90">
                {getMonogram(product.category)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              {product.category}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {product.name}
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">{product.duration}</p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/90">
            {product.badge}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
          <span className="text-xl font-semibold text-white">
            {formatCurrency(parsePrice(product.price))}
          </span>
          <span className="text-sm text-white/60">{ctaLabel}</span>
        </div>
      </div>
    </Link>
  );
}
