export type Product = {
  id: number;
  slug: string;
  name: string;
  price: number;
  category: string;
  tag: string;
  description: string;
  icon: string;
  duration: string;
};

export const products: Product[] = [
  {
    id: 67,
    slug: "spotify-premium-1-month",
    name: "Spotify Premium",
    price: 3,
    category: "Spotify",
    tag: "Best Seller",
    description: "1 month Spotify Premium access with fast Discord delivery.",
    icon: "/icons/spotify.svg",
    duration: "1 Month",
  },
  {
    id: 68,
    slug: "spotify-premium-3-months",
    name: "Spotify Premium",
    price: 8,
    category: "Spotify",
    tag: "Best Value",
    description: "3 months Spotify Premium access with clean checkout and support.",
    icon: "/icons/spotify.svg",
    duration: "3 Months",
  },
  {
    id: 69,
    slug: "spotify-upgrade",
    name: "Spotify Upgrade",
    price: 2,
    category: "Spotify",
    tag: "Upgrade",
    description: "Upgrade an existing Spotify account without changing your setup.",
    icon: "/icons/spotify.svg",
    duration: "Instant",
  },
];
