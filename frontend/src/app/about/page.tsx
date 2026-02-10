import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Globe2, ShieldCheck, Workflow } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn how Wisebox helps diaspora families manage property records, workflows, and consultant support securely.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Wisebox',
    description:
      'Learn how Wisebox helps diaspora families manage property records, workflows, and consultant support securely.',
    type: 'website',
    url: 'https://mywisebox.com/about',
    images: [
      {
        url: 'https://mywisebox.com/og/wisebox-about.png',
        width: 1200,
        height: 630,
        alt: 'About Wisebox',
      },
    ],
  },
};

const pillars = [
  {
    title: 'Operational clarity',
    description: 'We convert scattered documents and updates into a structured operating workflow.',
    icon: Workflow,
  },
  {
    title: 'Trust and security',
    description: 'Data handling prioritizes secure access paths and clear ownership controls.',
    icon: ShieldCheck,
  },
  {
    title: 'Global accessibility',
    description: 'Owners can coordinate property decisions from any country and timezone.',
    icon: Globe2,
  },
];

export default function AboutPage() {
  return (
    <>
      <MarketingHeader />
      <main className="bg-white">
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold text-wisebox-text-primary sm:text-5xl">About Wisebox</h1>
            <p className="text-lg text-wisebox-text-secondary">
              Wisebox exists to give property owners a reliable system for handling documentation,
              service requests, and long-term planning with less friction.
            </p>
            <p className="text-wisebox-text-secondary">
              We focus on real operational needs: tracking records, resolving issues quickly, and
              creating visibility for families who manage assets across borders.
            </p>
          </div>
        </section>

        <section className="bg-wisebox-surface">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title} className="border-gray-200 bg-white">
                  <CardHeader>
                    <Icon className="h-5 w-5 text-wisebox-primary-700" />
                    <CardTitle className="text-lg text-wisebox-text-primary">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-wisebox-text-secondary">{pillar.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-wisebox-text-primary">Start with a free readiness check</h2>
                <p className="mt-2 text-sm text-wisebox-text-secondary">
                  Run the free assessment to understand your current documentation status and next best actions.
                </p>
              </div>
              <Button asChild className="bg-wisebox-primary-600 text-white hover:bg-wisebox-primary-700">
                <Link href="/assessment">
                  Get Free Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
