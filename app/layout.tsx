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
  icons: {
    icon: "/favicon.png",
  },
};

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
      <body
        className={`${sans.variable} ${mono.variable} pending-shell font-sans text-white`}
      >
        <BackgroundParticles />
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-white/8 bg-[#07070a]/82 backdrop-blur-xl">
            <div className="relative z-10 mx-auto max-w-[1240px] px-4">
              <div className="relative py-4">
                <SiteNav viewer={viewer} />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
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
