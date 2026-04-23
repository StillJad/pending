export const BRAND_NAME = "Pending";
export const BRAND_SUBLABEL = "digital goods / discord fulfillment";
export const SITE_DESCRIPTION =
  "Digital goods. Clear pricing. Discord fulfillment.";
export const DISCORD_INVITE_URL = "https://discord.gg/pending";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Buy" },
  { href: "/ticket", label: "Support" },
  { href: "/orders", label: "Tracking" },
] as const;

export function toCategorySlug(category: string) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function parsePrice(price: string) {
  const value = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : 0;
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
