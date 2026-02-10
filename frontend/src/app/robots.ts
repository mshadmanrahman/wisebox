import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/about', '/faq', '/contact', '/assessment'],
      disallow: ['/dashboard', '/properties', '/tickets', '/orders', '/settings', '/notifications', '/consultant'],
    },
    sitemap: 'https://mywisebox.com/sitemap.xml',
  };
}
