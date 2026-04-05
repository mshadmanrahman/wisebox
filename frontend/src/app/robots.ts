import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/services',
          '/assessment',
          '/assessment/start',
          '/faq',
          '/contact',
          '/help',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/dashboard',
          '/properties',
          '/tickets',
          '/orders',
          '/settings',
          '/notifications',
          '/consultant',
          '/admin',
          '/login',
          '/register',
          '/forgot-password',
          '/forms',
          '/workspace',
        ],
      },
    ],
    sitemap: 'https://mywisebox.com/sitemap.xml',
  };
}
