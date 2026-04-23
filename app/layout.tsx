import type { Metadata } from "next";
import Link from "next/link";
import { Manrope, Space_Grotesk } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import { BRAND_NAME, SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <div className="min-h-screen bg-[#0b0b0f] text-white">
          <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl items-center justify-between border-b border-white/10 px-4 py-4">
              <Link href="/" className="group inline-flex min-w-0 items-center gap-4">
                <span className="font-semibold text-lg tracking-wide">{BRAND_NAME}</span>
              </Link>

              <SiteNav />
            </div>
          </header>

          <div className="mx-auto w-full max-w-6xl px-4 py-10">
            {children}
          </div>

          <footer className="relative z-10 px-4 pb-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-white/10 px-4 py-6 text-sm text-white/60">
              <div>
                <p className="font-semibold text-white">{BRAND_NAME}</p>
                <p>Digital goods. Fast delivery.</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/55">
                <Link href="/products" className="hover:text-white">
                  Buy
                </Link>
                <Link href="/ticket" className="hover:text-white">
                  Support
                </Link>
                <Link href="/orders" className="hover:text-white">
                  Tracking
                </Link>
                <Link href="/Tos" className="hover:text-white">
                  Terms
                </Link>
                <Link href="/PrivPolicy" className="hover:text-white">
                  Privacy
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
