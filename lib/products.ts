export { products } from "@/data/products";
export type Product = (typeof import("@/data/products").products)[number];
