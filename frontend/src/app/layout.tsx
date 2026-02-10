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
  openGraph: {
    title: 'Wisebox',
    description:
      'Wisebox helps property owners manage records, services, and support workflows in one secure workspace.',
    url: 'https://mywisebox.com',
    siteName: 'Wisebox',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wisebox',
    description:
      'Wisebox helps property owners manage records, services, and support workflows in one secure workspace.',
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
