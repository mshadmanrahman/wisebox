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
};

export default function FaqPage() {
  return (
    <>
      <MarketingHeader />
      <main className="bg-white">
        <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-3">
            <h1 className="text-4xl font-bold text-wisebox-text-primary sm:text-5xl">Frequently asked questions</h1>
            <p className="text-lg text-wisebox-text-secondary">
              If you are new to Wisebox, start here for quick answers about setup and workflows.
            </p>
          </div>
          <FaqAccordion faqs={marketingFaqs} />
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <Card className="border-teal-200 bg-teal-50">
            <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-wisebox-text-primary">Need more help?</p>
                <p className="text-sm text-wisebox-text-secondary">
                  Contact our team for onboarding guidance and service recommendations.
                </p>
              </div>
              <Button asChild className="bg-wisebox-primary-600 text-white hover:bg-wisebox-primary-700">
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
