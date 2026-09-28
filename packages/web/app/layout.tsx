import { SITE_DESCRIPTION, SITE_NAME, SITE_SEO_TITLE, SITE_TAGLINE, SITE_URL } from "@/shared/site";
import { Analytics } from "./analytics";
import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Nunito } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_SEO_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Luke Fernandez" }],
  creator: "Luke Fernandez",
  keywords: [
    "potluck planner",
    "potluck sign up sheet",
    "potluck organizer",
    "who is bringing what",
    "potluck list",
    "dish sign up",
    "party food planner",
  ],
  category: "food",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF6EC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${nunito.variable}`}>
      <body className="font-sans">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <footer className="text-soft mt-8 px-6 pb-10 pt-8 text-center">
            <p className="mt-2 text-sm font-semibold">
              © {new Date().getFullYear()} Luke Fernandez.
            </p>
            <div className="mt-2 flex items-center justify-center gap-3 text-sm font-semibold">
              <Link
                href="/privacy-policy"
                className="hover:text-carrot rounded-full px-2 py-1 transition-colors"
              >
                Privacy policy
              </Link>
              <span aria-hidden className="bg-zinc-800/15 h-4 w-px" />
              <Link
                href="/terms-of-service"
                className="hover:text-carrot rounded-full px-2 py-1 transition-colors"
              >
                Terms of service
              </Link>
            </div>
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
