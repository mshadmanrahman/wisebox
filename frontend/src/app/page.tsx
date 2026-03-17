import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  FolderOpen,
  EyeOff,
  AlertTriangle,
  Users,
  FileText,
  Activity,
  Scale,
  Ticket,
  Bell,
  BarChart3,
  ScrollText,
  UsersRound,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  alternates: { canonical: '/' },
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

const painPointIcons = [FolderOpen, EyeOff, AlertTriangle, Users];
const featureIcons = [FileText, Activity, Scale, Ticket, Bell, BarChart3, ScrollText, UsersRound];

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
      publisher: { '@id': 'https://mywisebox.com/#organization' },
      inLanguage: 'en',
    },
  ],
};

function SectionMarker({ number, label }: { number: string; label: string }) {
  return (
    <div className="mb-10 flex items-center gap-4">
      <span
        className="text-xs font-medium text-muted-foreground"
        style={{ letterSpacing: '0.05em' }}
      >
        [{number}]
      </span>
      <div className="h-px w-10 bg-border" />
      <span
        className="text-xs font-medium uppercase text-muted-foreground"
        style={{ letterSpacing: '0.05em' }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <MarketingHeader />
      <main className="scroll-smooth">
        {/* ── Hero ── */}
        <section className="px-6 pb-16 pt-24 sm:pb-24 sm:pt-40 md:pt-40">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <p
              className="text-xs font-medium uppercase text-muted-foreground"
              style={{ letterSpacing: '0.05em' }}
            >
              Property operations for Bangladeshi families abroad
            </p>

            <h1
              className="mt-6 max-w-4xl font-[family-name:var(--font-geist-sans)] text-2xl font-semibold leading-[1.1] text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Your property in Bangladesh deserves the same care you&rsquo;d give it in person.
            </h1>

            <p
              className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
              style={{ lineHeight: '1.6' }}
            >
              Wisebox gives diaspora families a single, secure workspace to organize documents, track
              property status, and coordinate legal and operational support — from anywhere in the
              world.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                className="h-11 rounded-lg bg-primary px-6 text-primary-foreground transition-all duration-200 hover:bg-primary/90"
              >
                <Link href="/assessment/start">
                  Get Free Assessment
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-lg border-border px-6 text-foreground transition-all duration-200 hover:border-wisebox-border-light"
              >
                <a href="#process-section">Learn How It Works</a>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Trust strip ── */}
        <section className="border-b border-t border-border py-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1 px-6 sm:flex-row sm:justify-center sm:gap-0">
            <span className="text-sm text-muted-foreground">Secure document management</span>
            <span className="hidden px-3 text-border sm:inline">&middot;</span>
            <span className="text-sm text-muted-foreground">Real-time property tracking</span>
            <span className="hidden px-3 text-border sm:inline">&middot;</span>
            <span className="text-sm text-muted-foreground">Licensed consultant network</span>
          </div>
        </section>

        {/* ── [01] The Problem ── */}
        <section id="problem-section" className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
            <SectionMarker number="01" label="Common Realities" />

            <h2
              className="max-w-2xl font-[family-name:var(--font-geist-sans)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Distance creates blind spots. Blind spots create risk.
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              {marketingPainPoints.map((item, index) => {
                const Icon = painPointIcons[index] ?? FolderOpen;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-wisebox-border-light"
                  >
                    <Icon className="mb-4 h-5 w-5 text-primary" strokeWidth={1.5} />
                    <p
                      className="font-[family-name:var(--font-geist-sans)] text-lg font-medium text-foreground"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground" style={{ lineHeight: '1.6' }}>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── [02] The Process ── */}
        <section id="process-section" className="border-b border-border scroll-mt-16">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
            <SectionMarker number="02" label="How Wisebox Works" />

            <h2
              className="max-w-2xl font-[family-name:var(--font-geist-sans)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Three steps to structured property operations.
            </h2>

            <div className="mt-12 flex flex-col gap-12 sm:gap-16">
              {marketingHowItWorks.map((item, index) => (
                <div key={item.step} className="flex gap-6 sm:gap-10">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary text-sm font-medium text-primary">
                      {item.step}
                    </div>
                    {index < marketingHowItWorks.length - 1 && (
                      <div className="mt-3 w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-2">
                    <p
                      className="font-[family-name:var(--font-geist-sans)] text-lg font-medium text-foreground"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="mt-2 max-w-lg text-sm text-muted-foreground"
                      style={{ lineHeight: '1.6' }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── [03] Features ── */}
        <section id="features-section" className="border-b border-border scroll-mt-16">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
            <SectionMarker number="03" label="Platform Capabilities" />

            <h2
              className="max-w-2xl font-[family-name:var(--font-geist-sans)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              One workspace for everything your property needs.
            </h2>
            <p
              className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg"
              style={{ lineHeight: '1.6' }}
            >
              Designed for real property workflows, not just document storage.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {marketingFeatures.map((item, index) => {
                const Icon = featureIcons[index] ?? FileText;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-wisebox-border-light"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      {item.comingSoon && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p
                      className="font-[family-name:var(--font-geist-sans)] text-lg font-medium text-foreground"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="mt-2 text-sm text-muted-foreground"
                      style={{ lineHeight: '1.6' }}
                    >
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── [04] Pricing ── */}
        <section id="pricing-section" className="border-b border-border scroll-mt-16">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
            <SectionMarker number="04" label="Plans" />

            <h2
              className="max-w-2xl font-[family-name:var(--font-geist-sans)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Start free. Upgrade when you need deeper support.
            </h2>
            <p
              className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base"
              style={{ lineHeight: '1.6' }}
            >
              Every plan includes your property profile, assessment scoring, and notification center.
            </p>

            <div className="mt-12">
              <PricingTable plans={pricingPlans} />
            </div>
          </div>
        </section>

        {/* ── [05] Security ── */}
        <section className="border-b border-border">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-16 text-center sm:py-24">
            <Shield className="h-6 w-6 text-primary" strokeWidth={1.5} />

            <h2
              className="mt-6 font-[family-name:var(--font-geist-sans)] text-xl font-semibold text-foreground sm:text-2xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Your documents are encrypted and access-controlled.
            </h2>
            <p
              className="mt-3 max-w-xl text-sm text-muted-foreground"
              style={{ lineHeight: '1.6' }}
            >
              Wisebox is built with secure APIs, role-based permissions, and audit-friendly status
              tracking. Your property records are private by default and shared only with people you
              authorize.
            </p>

            <Button
              asChild
              className="mt-8 h-11 rounded-lg bg-primary px-6 text-primary-foreground transition-all duration-200 hover:bg-primary/90"
            >
              <Link href="/assessment/start">Run Free Assessment</Link>
            </Button>
          </div>
        </section>

        {/* ── [06] FAQ ── */}
        <section id="faq-section" className="border-b border-border scroll-mt-16">
          <div className="mx-auto w-full max-w-[720px] px-6 py-16 sm:py-24">
            <SectionMarker number="06" label="Frequently Asked Questions" />

            <h2
              className="font-[family-name:var(--font-geist-sans)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Frequently asked questions
            </h2>

            <div className="mt-10">
              <FaqAccordion faqs={marketingFaqs} />
            </div>
          </div>
        </section>

        {/* ── [07] Final CTA ── */}
        <section>
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-20 text-center sm:py-32">
            <h2
              className="font-[family-name:var(--font-geist-sans)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Start with clarity. Everything else follows.
            </h2>
            <p
              className="mt-4 max-w-lg text-sm text-muted-foreground sm:text-base"
              style={{ lineHeight: '1.6' }}
            >
              Run a free assessment to see where your property stands. No payment required. No
              commitment.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                className="h-11 rounded-lg bg-primary px-6 text-primary-foreground transition-all duration-200 hover:bg-primary/90"
              >
                <Link href="/assessment/start">
                  Get Free Assessment
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-lg border-border px-6 text-foreground transition-all duration-200 hover:border-wisebox-border-light"
              >
                <a href="#pricing-section">See Our Plans</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
