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
      <body className="min-h-screen bg-[#0b0b0f] text-white">
        <div className="relative min-h-screen bg-gradient-to-b from-[#0b0b0f] via-[#0e0e14] to-black">
          <div className="pointer-events-none absolute inset-0 opacity-20 blur-3xl bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.3),transparent_60%)]" />
          <header className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-4 backdrop-blur">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              /Pending
            </h1>
            <nav className="flex gap-6 text-sm text-white/70">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <Link href="/products" className="hover:text-white">
                Buy
              </Link>
              <Link href="/ticket" className="hover:text-white">
                Support
              </Link>
              <Link href="/orders" className="hover:text-white">
                Tracking
              </Link>
            </nav>
          </header>

          <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
