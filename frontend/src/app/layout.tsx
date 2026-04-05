import type { Metadata } from "next";
import localFont from "next/font/local";
import { HtmlLangUpdater } from "@/components/html-lang-updater";
import { ThemeProviderWrapper } from "@/components/providers/theme-provider";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mywisebox.com"),
  title: {
    default: "Wisebox | Property Management for Diaspora Families",
    template: "%s | Wisebox",
  },
  description:
    "One secure place to track documents, monitor readiness, and coordinate expert help for your property in Bangladesh. Trusted by 500+ families across the US, UK, Canada, and Australia.",
  keywords: [
    "Bangladesh property management",
    "diaspora property",
    "ancestral property Bangladesh",
    "property documents Bangladesh",
    "NRB property management",
    "Bangladesh land management",
    "property consultant Bangladesh",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Wisebox | Property Management for Diaspora Families",
    description:
      "One secure place to track documents, monitor readiness, and coordinate expert help for your property in Bangladesh.",
    url: "https://mywisebox.com",
    siteName: "Wisebox",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wisebox | Property Management for Diaspora Families",
    description:
      "One secure place to track documents, monitor readiness, and coordinate expert help for your property in Bangladesh.",
    site: "@mywisebox",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/images/wisebox-logo-light.svg" />
        <link rel="preload" as="image" href="/images/wisebox-logo-dark.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProviderWrapper>
          <AnalyticsProvider>
            <HtmlLangUpdater />
            {children}
          </AnalyticsProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
