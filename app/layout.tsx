import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Pending",
  description: "Prices, tracking, and Discord-based ordering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h1 className="text-2xl font-bold">Pending</h1>
          <nav className="flex gap-6 text-sm text-white/70">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/products" className="hover:text-white">
              Prices
            </Link>
            <Link href="/ticket" className="hover:text-white">
              Create Ticket
            </Link>
            <Link href="/cart" className="hover:text-white">
              Cart
            </Link>
            <Link href="/orders" className="hover:text-white">
              Orders
            </Link>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}
