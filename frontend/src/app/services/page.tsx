import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { marketingFeatures, pricingPlans } from '@/components/marketing/content';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { PricingTable } from '@/components/marketing/pricing-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore Wisebox service offerings for property documentation, support workflows, and legal coordination.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Wisebox Services',
    description:
      'Explore Wisebox service offerings for property documentation, support workflows, and legal coordination.',
    type: 'website',
    url: 'https://mywisebox.com/services',
    images: [
      {
        url: 'https://mywisebox.com/og/wisebox-services.png',
        width: 1200,
        height: 630,
        alt: 'Wisebox services page',
      },
    ],
  },
};

const servicesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Wisebox Property Services',
  provider: {
    '@type': 'Organization',
    name: 'Wisebox',
    url: 'https://mywisebox.com',
  },
  description:
    'Property documentation, consultant workflows, legal coordination, and operational support for diaspora families.',
  areaServed: 'Global',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Wisebox Plans',
    itemListElement: pricingPlans.map((plan, index) => ({
      '@type': 'Offer',
      position: index + 1,
      name: plan.name,
      description: plan.description,
    })),
  },
};

export default function PublicServicesPage() {
  return (
    <>
      <MarketingHeader />
      <main className="bg-wisebox-background">
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <Badge className="bg-wisebox-primary-100 text-wisebox-primary-700 hover:bg-wisebox-primary-100">
              Services overview
            </Badge>
            <h1 className="text-4xl font-bold text-wisebox-text-primary sm:text-5xl">Wisebox Services</h1>
            <p className="max-w-2xl text-base leading-7 text-wisebox-text-secondary sm:text-lg">
              Choose the right support level for your property journey, from readiness checks to
              consultant-guided workflows.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-wisebox-primary-600 text-white hover:bg-wisebox-primary-700">
                <Link href="/assessment">
                  Get Free Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-wisebox-border text-wisebox-primary-400 hover:bg-wisebox-background-lighter">
                <Link href="/workspace/services">Open Services Workspace</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-wisebox-background-lighter">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-wisebox-text-primary sm:text-3xl">What you can do with Wisebox</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {marketingFeatures.map((feature) => (
                <Card key={feature.title} className="border-wisebox-border bg-wisebox-background-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-wisebox-text-primary">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-wisebox-text-secondary">{feature.description}</p>
                    {feature.comingSoon ? (
                      <Badge variant="outline" className="mt-3 border-amber-200 text-amber-700">
                        Coming soon
                      </Badge>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-wisebox-text-primary sm:text-3xl">Plans and pricing</h2>
          <PricingTable plans={pricingPlans} />
        </section>
      </main>
      <MarketingFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }} />
    </>
  );
}
