import type { Metadata } from "next";
import { Fraunces, Outfit, DM_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--ff-fraunces",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-outfit",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // No template: existing per-page titles already include "| FusionPrints".
  // Pages without their own title fall back to this default.
  title: `${SITE_NAME} — Hold the moment.`,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Hold the moment.`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_ZW",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "FusionPrints — Hold the moment." }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Hold the moment.`,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${outfit.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
