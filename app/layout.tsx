import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { SiteNav } from "@/components/site-nav";
import { BRAND_NAME, BRAND_SUBLABEL, SITE_DESCRIPTION } from "@/lib/site";
import { getSession } from "@/lib/auth";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-site-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-site-mono",
  display: "swap",
});

export const metadata = {
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getSession();

  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} font-sans bg-[#0b0b0f] text-white`}>
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0b0f]/96">
            <div className="mx-auto max-w-6xl px-4">
              <div className="relative flex flex-col gap-6 py-5 md:flex-row md:items-end md:justify-between">
                <Link href="/" className="min-w-0">
                  <span className="block text-[1.55rem] font-semibold tracking-[-0.08em] text-white sm:text-[1.75rem]">
                    {BRAND_NAME}
                  </span>
                  <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                    {BRAND_SUBLABEL}
                  </span>
                </Link>

                <SiteNav viewer={viewer} />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/45 to-transparent" />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-4 py-12">{children}</main>

          <footer className="mt-6 border-t border-white/5">
            <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <p className="text-lg font-semibold tracking-tight text-white">
                  {BRAND_NAME}
                </p>
                <p className="mt-2 max-w-xl text-sm text-white/55">
                  {SITE_DESCRIPTION}
                </p>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                <Link href="/products" className="transition hover:text-white">
                  Buy
                </Link>
                <Link href="/ticket" className="transition hover:text-white">
                  Support
                </Link>
                <Link href="/orders" className="transition hover:text-white">
                  Tracking
                </Link>
                <Link href="/Tos" className="transition hover:text-white">
                  Terms
                </Link>
                <Link href="/PrivPolicy" className="transition hover:text-white">
                  Privacy
                </Link>
              </div>
            </div>
          </footer>
        </div>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
