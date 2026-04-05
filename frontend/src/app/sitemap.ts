import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mywisebox.com';
  const lastModified = new Date();

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/about`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/assessment`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/assessment/start`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/help`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
