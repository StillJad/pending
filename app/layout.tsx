import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { BackgroundParticles } from "@/components/background-particles";
import { SiteNav } from "@/components/site-nav";
import { BRAND_NAME, SITE_DESCRIPTION } from "@/lib/site";
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
      <span className="absolute inset-[7px] rounded-full bg-gradient-to-br from-[#ff2bd6] via-[#c026d3] to-[#8b5cf6] opacity-92" />
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="relative h-7 w-7 drop-shadow-[0_0_10px_rgba(255,255,255,0.18)]"
      >
        <path
          d="M15 35V13h11.5c5.3 0 8.5 2.8 8.5 7.3 0 3.8-2.3 6.2-6 6.9l7.1 7.8h-6.5l-6.3-7.3h-2.3V35H15Zm6.1-12h5c2 0 3.3-1 3.3-2.7s-1.3-2.7-3.3-2.7h-5V23Z"
          fill="white"
        />
      </svg>
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
        <BackgroundParticles />
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-white/8 bg-[#07070a]/82 backdrop-blur-xl">
            <div className="relative z-10 mx-auto max-w-[1240px] px-4">
              <div className="relative flex flex-col gap-5 py-4 md:flex-row md:items-center md:justify-between">
                <Link href="/" className="flex min-w-0 items-center gap-3">
                  <LogoMark />
                  <span className="min-w-0">
                    <span className="block truncate text-[1.65rem] font-semibold tracking-[-0.08em] text-white sm:text-[1.85rem]">
                      {BRAND_NAME}
                    </span>
                  </span>
                </Link>

                <SiteNav viewer={viewer} />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d946ef]/60 to-transparent" />
              </div>
            </div>
          </header>

          <main className="relative z-10 mx-auto w-full max-w-[1240px] px-4 py-10 sm:py-12">
            {children}
          </main>

          <footer className="relative z-10 border-t border-white/8">
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
