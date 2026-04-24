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

function LogoMark() {
  return (
    <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d946ef]/35 bg-white/[0.03] shadow-[0_0_28px_rgba(168,85,247,0.16)]">
      <span className="absolute inset-[7px] rounded-full border border-white/10 bg-gradient-to-br from-[#ff2bd6] to-[#8b5cf6] opacity-80" />
      <span className="relative font-mono text-sm font-semibold uppercase tracking-[0.18em] text-white">
        P
      </span>
    </span>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getSession();

  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${mono.variable} pending-shell font-sans text-white`}
      >
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-white/8 bg-[#07070a]/82 backdrop-blur-xl">
            <div className="mx-auto max-w-[1240px] px-4">
              <div className="relative flex flex-col gap-5 py-4 md:flex-row md:items-center md:justify-between">
                <Link href="/" className="flex min-w-0 items-center gap-3">
                  <LogoMark />
                  <span className="min-w-0">
                    <span className="block truncate text-[1.65rem] font-semibold tracking-[-0.08em] text-white sm:text-[1.85rem]">
                      {BRAND_NAME}
                    </span>
                    <span className="mt-1 block truncate font-mono text-[11px] uppercase tracking-[0.18em] text-white/36">
                      {BRAND_SUBLABEL}
                    </span>
                  </span>
                </Link>

                <SiteNav viewer={viewer} />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d946ef]/60 to-transparent" />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:py-12">
            {children}
          </main>

          <footer className="border-t border-white/8">
            <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-4 py-8 text-sm text-white/52 md:flex-row md:items-center md:justify-between">
              <p>
                {BRAND_NAME} © {new Date().getFullYear()}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link href="/Tos" className="transition hover:text-white">
                  Terms
                </Link>
                <Link href="/ticket" className="transition hover:text-white">
                  Support
                </Link>
                <a
                  href="https://discord.gg/pending"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  Discord
                </a>
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
