import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Landmark,
  ShieldCheck,
  BellRing,
  FolderKanban,
  Handshake,
  Wallet,
  Scale,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import {
  marketingFaqs,
  marketingFeatures,
  marketingHowItWorks,
  marketingPainPoints,
  pricingPlans,
} from '@/components/marketing/content';
import { PricingTable } from '@/components/marketing/pricing-table';

export const metadata: Metadata = {
  title: 'Property Management for Diaspora Families',
  description:
    'Manage ancestral properties from anywhere with document tracking, consultant workflows, and secure collaboration.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Wisebox | Property Management for Diaspora Families',
    description:
      'Manage ancestral properties from anywhere with document tracking, consultant workflows, and secure collaboration.',
    type: 'website',
    url: 'https://mywisebox.com',
    images: [
      {
        url: 'https://mywisebox.com/og/wisebox-home.png',
        width: 1200,
        height: 630,
        alt: 'Wisebox home page',
      },
    ],
  },
};

const featureIcons = [
  FolderKanban,
  Landmark,
  Handshake,
  Scale,
  BellRing,
  Wallet,
  ShieldCheck,
  Users,
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://mywisebox.com/#organization',
      name: 'Wisebox',
      url: 'https://mywisebox.com',
      description:
        'Secure property management for diaspora families, including document tracking and consultant workflows.',
      sameAs: ['https://mywisebox.com/about', 'https://mywisebox.com/contact'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://mywisebox.com/#website',
      url: 'https://mywisebox.com',
      name: 'Wisebox',
      publisher: {
        '@id': 'https://mywisebox.com/#organization',
      },
      inLanguage: 'en',
    },
  ],
};

export default function Home() {
  return (
    <>
      <MarketingHeader />
      <main className="bg-wisebox-background">
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-60 bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.15),_transparent_55%)]" />
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div className="space-y-6">
              <Badge className="bg-wisebox-primary-100 text-wisebox-primary-700 hover:bg-wisebox-primary-100">
                Built for property owners and diaspora families
              </Badge>
              <h1 className="text-4xl font-bold leading-tight text-wisebox-text-primary sm:text-5xl">
                Manage Your Ancestral Properties From Anywhere in the World
              </h1>
              <p className="max-w-xl text-base leading-7 text-wisebox-text-secondary sm:text-lg">
                Wisebox unifies documents, tickets, consultant support, and assessment insights into one
                secure operating system for your properties.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild className="bg-wisebox-primary-600 text-white hover:bg-wisebox-primary-700">
                  <Link href="/assessment/start">
                    Get Free Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-wisebox-border text-wisebox-primary-400 hover:bg-wisebox-background-lighter"
                >
                  <Link href="/register">Start Managing Properties</Link>
                </Button>
              </div>
            </div>

            <Card className="border-wisebox-border shadow-xl shadow-wisebox-primary/10 bg-wisebox-background-card">
              <CardHeader>
                <CardTitle className="text-wisebox-text-primary">Why families choose Wisebox</CardTitle>
                <CardDescription>One workspace to reduce legal and operational chaos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Track document readiness', 'Coordinate consultant support', 'Get status updates in real time'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md border border-wisebox-border px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 text-wisebox-primary-600" />
                    <p className="text-sm text-wisebox-text-secondary">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 max-w-3xl">
            <h2 className="text-2xl font-bold text-wisebox-text-primary sm:text-3xl">Common pain points we solve</h2>
            <p className="mt-2 text-wisebox-text-secondary">
              Property operations often become fragmented when owners live across borders.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {marketingPainPoints.map((item) => (
              <Card key={item.title} className="border-wisebox-border bg-wisebox-background-card">
                <CardHeader>
                  <CardTitle className="text-lg text-wisebox-text-primary">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-wisebox-text-secondary">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-wisebox-background-lighter">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6 max-w-3xl">
              <h2 className="text-2xl font-bold text-wisebox-text-primary sm:text-3xl">How Wisebox works</h2>
              <p className="mt-2 text-wisebox-text-secondary">Three steps to establish reliable property operations.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {marketingHowItWorks.map((item) => (
                <Card key={item.step} className="border-wisebox-border bg-wisebox-background-card">
                  <CardHeader>
                    <p className="text-sm font-semibold text-wisebox-primary-600">Step {item.step}</p>
                    <CardTitle className="text-lg text-wisebox-text-primary">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-wisebox-text-secondary">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 max-w-3xl">
            <h2 className="text-2xl font-bold text-wisebox-text-primary sm:text-3xl">Core platform capabilities</h2>
            <p className="mt-2 text-wisebox-text-secondary">
              Designed for real-world property workflows, not just static document storage.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {marketingFeatures.map((item, index) => {
              const Icon = featureIcons[index] ?? FolderKanban;
              return (
                <Card key={item.title} className="border-wisebox-border bg-wisebox-background-card">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <Icon className="h-5 w-5 text-wisebox-primary-700" />
                      {item.comingSoon ? (
                        <Badge variant="outline" className="border-wisebox-status-warning/30 text-wisebox-status-warning">
                          Coming soon
                        </Badge>
                      ) : null}
                    </div>
                    <CardTitle className="text-lg text-wisebox-text-primary">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-wisebox-text-secondary">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="bg-wisebox-background-lighter">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6 max-w-3xl">
              <h2 className="text-2xl font-bold text-wisebox-text-primary sm:text-3xl">Pricing built for every stage</h2>
              <p className="mt-2 text-wisebox-text-secondary">
                Start free, then upgrade when you need deeper workflows and service support.
              </p>
            </div>
            <PricingTable plans={pricingPlans} />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <Card className="border-wisebox-primary/30 bg-wisebox-background-card">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-wisebox-text-primary">Your documents are encrypted and secure</h2>
                <p className="mt-1 text-sm text-wisebox-text-secondary">
                  Wisebox is designed with secure APIs, permissioned workflows, and audit-friendly status tracking.
                </p>
              </div>
              <Button asChild className="bg-wisebox-primary-600 text-white hover:bg-wisebox-primary-700">
                <Link href="/assessment/start">Run Free Assessment</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-wisebox-text-primary sm:text-3xl">Frequently asked questions</h2>
            <p className="mt-2 text-wisebox-text-secondary">Answers to the most common onboarding questions.</p>
          </div>
          <FaqAccordion faqs={marketingFaqs} />
        </section>
      </main>
      <MarketingFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
