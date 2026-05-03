export const BRAND_NAME = "Pending";
export const BRAND_SUBLABEL = "premium digital products";
export const SITE_DESCRIPTION =
  "Digital goods, Discord support, fast delivery, and clean order tracking.";
export const DISCORD_INVITE_URL = "https://discord.gg/pending";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
] as const;

export function toCategorySlug(category: string) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function parsePrice(value: string | number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function getMonogram(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
