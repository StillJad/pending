"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { products } from "../../../../data/products";

export default function CheckoutPage() {
  const params = useParams<{ id: string; slug: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const id = params?.id ?? "";
  const slug = params?.slug ?? "";

  const product = useMemo(() => {
    return products.find(
      (item) => String(item.id) === String(id) && String(item.slug) === String(slug)
    );
  }, [id, slug]);

  const unitPrice = product ? Number(String(product.price).replace(/[^0-9.]/g, "")) : 0;
  const total = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!product) return;

    const existingCart = JSON.parse(localStorage.getItem("pending_cart") || "[]");
    const existingItem = existingCart.find((item: { id: number }) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      existingCart.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: unitPrice,
        quantity,
      });
    }

    localStorage.setItem("pending_cart", JSON.stringify(existingCart));
    router.push("/cart");
  };

  if (!product) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold">Product not found</h1>
          <p className="mt-3 text-white/70">
            This product does not exist or the link is incorrect.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-white/50">Checkout</p>
        <h1 className="mt-2 text-4xl font-bold">{product.name}</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Review this product before adding it to your cart.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_420px]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Product Details</h2>

            <div className="mt-6 space-y-4 text-white/80">
              <div>
                <p className="text-sm text-white/50">Category</p>
                <p className="mt-1">{product.category}</p>
              </div>

              <div>
                <p className="text-sm text-white/50">Product Name</p>
                <p className="mt-1">{product.name}</p>
              </div>

              <div>
                <p className="text-sm text-white/50">Product ID</p>
                <p className="mt-1">{product.id}</p>
              </div>

              <div>
                <p className="text-sm text-white/50">Description</p>
                <p className="mt-1">{product.description}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Order Summary</h2>

            <div className="mt-6 flex items-center justify-between text-white/80">
              <span>Product</span>
              <span>{product.name}</span>
            </div>

            <div className="mt-4 flex items-center justify-between text-white/80">
              <span>Unit Price</span>
              <span>${unitPrice.toFixed(2)}</span>
            </div>

            <div className="mt-4">
              <p className="text-sm text-white/50">Quantity</p>
              <div className="mt-2 flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-lg text-white/70"
                >
                  -
                </button>
                <span className="min-w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-lg text-white/70"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between text-xl font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="mt-8 w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:opacity-80"
            >
              Add to Cart
            </button>

            <p className="mt-4 text-sm text-white/50">
              This adds the product to your cart so you can place one Discord order for multiple items.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
