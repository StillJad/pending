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
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="ambient-orb ambient-orb-one" />
          <div className="ambient-orb ambient-orb-two" />
          <div className="ambient-orb ambient-orb-three" />
          <div className="ambient-grid" />
        </div>

        <div className="relative isolate min-h-screen">
          <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[28px] border border-white/10 bg-[rgba(8,10,18,0.72)] px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="group inline-flex min-w-0 items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sm font-semibold tracking-[0.34em] text-white/80 shadow-[0_0_40px_rgba(97,123,255,0.18)] transition duration-300 group-hover:border-white/25 group-hover:bg-white/15 group-hover:text-white">
                  PN
                </span>

                <span className="min-w-0">
                  <span className="font-display block text-lg uppercase tracking-[0.42em] text-white sm:text-xl">
                    {BRAND_NAME}
                  </span>
                  <span className="block truncate text-[11px] uppercase tracking-[0.24em] text-white/45">
                    Premium digital fulfillment
                  </span>
                </span>
              </Link>

              <SiteNav />
            </div>
          </header>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 lg:px-8">
            {children}
          </div>

          <footer className="relative z-10 px-4 pb-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-5 shadow-[0_16px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-sm uppercase tracking-[0.34em] text-white/75">
                  {BRAND_NAME}
                </p>
                <p className="mt-2 max-w-2xl text-sm text-white/50">
                  Digital goods, transparent pricing, and Discord-based order
                  fulfillment in one polished flow.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/55">
                <Link href="/products" className="footer-link">
                  Buy
                </Link>
                <Link href="/ticket" className="footer-link">
                  Support
                </Link>
                <Link href="/orders" className="footer-link">
                  Tracking
                </Link>
                <Link href="/Tos" className="footer-link">
                  Terms
                </Link>
                <Link href="/PrivPolicy" className="footer-link">
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
