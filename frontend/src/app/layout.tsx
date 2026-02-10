import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mywisebox.com'),
  title: {
    default: 'Wisebox',
    template: '%s | Wisebox',
  },
  description: 'Wisebox helps property owners manage records, services, and support workflows in one secure workspace.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Wisebox',
    description:
      'Wisebox helps property owners manage records, services, and support workflows in one secure workspace.',
    url: 'https://mywisebox.com',
    siteName: 'Wisebox',
    type: 'website',
    images: [
      {
        url: 'https://mywisebox.com/og/wisebox-default.png',
        width: 1200,
        height: 630,
        alt: 'Wisebox property management platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wisebox',
    description:
      'Wisebox helps property owners manage records, services, and support workflows in one secure workspace.',
    images: ['https://mywisebox.com/og/wisebox-default.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
