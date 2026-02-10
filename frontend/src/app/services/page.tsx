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
};

export default function PublicServicesPage() {
  return (
    <>
      <MarketingHeader />
      <main className="bg-white">
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <Badge className="bg-wisebox-primary-100 text-wisebox-primary-700 hover:bg-wisebox-primary-100">
              Services overview
            </Badge>
            <h1 className="text-4xl font-bold text-wisebox-text-primary sm:text-5xl">Wisebox Services</h1>
            <p className="text-lg text-wisebox-text-secondary">
              Choose the right support level for your property journey, from readiness checks to consultant-guided workflows.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-wisebox-primary-600 text-white hover:bg-wisebox-primary-700">
                <Link href="/assessment">
                  Get Free Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-teal-200 text-wisebox-primary-700 hover:bg-teal-50">
                <Link href="/workspace/services">Open Services Workspace</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-wisebox-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-wisebox-text-primary sm:text-3xl">What you can do with Wisebox</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {marketingFeatures.map((feature) => (
                <Card key={feature.title} className="border-gray-200 bg-white">
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
    </>
  );
}
