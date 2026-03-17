import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { marketingFaqs } from '@/components/marketing/content';
import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Read frequently asked questions about Wisebox workflows, security, and onboarding.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'Wisebox FAQ',
    description: 'Read frequently asked questions about Wisebox workflows, security, and onboarding.',
    type: 'website',
    url: 'https://mywisebox.com/faq',
    images: [
      {
        url: 'https://mywisebox.com/og/wisebox-faq.png',
        width: 1200,
        height: 630,
        alt: 'Wisebox FAQ page',
      },
    ],
  },
};

export default function FaqPage() {
  return (
    <>
      <MarketingHeader />
      <main className="bg-background">
        <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-3">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Frequently asked questions</h1>
            <p className="text-lg text-muted-foreground">
              If you are new to Wisebox, start here for quick answers about setup and workflows.
            </p>
          </div>
          <FaqAccordion faqs={marketingFaqs} />
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <Card className="border-primary/30 bg-card">
            <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">Need more help?</p>
                <p className="text-sm text-muted-foreground">
                  Contact our team for onboarding guidance and service recommendations.
                </p>
              </div>
              <Button asChild className="bg-primary text-white hover:bg-primary/90">
                <Link href="/contact">
                  Contact us
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
