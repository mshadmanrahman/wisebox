import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { PricingTable } from '@/components/marketing/pricing-table';
import { marketingFaqs, pricingPlans } from '@/components/marketing/content';
import {
  LandingHero,
  RevealSection,
  TestimonialScroller,
  FeatureCard,
  PropertyMock,
  NotificationMock,
  TicketMock,
} from '@/components/marketing/landing-sections';

export const metadata: Metadata = {
  title: 'Property Management for Diaspora Families',
  description: 'Manage ancestral properties from anywhere with document tracking, consultant workflows, and secure collaboration.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Wisebox | Property Management for Diaspora Families',
    description: 'Manage ancestral properties from anywhere with document tracking, consultant workflows, and secure collaboration.',
    type: 'website',
    url: 'https://mywisebox.com',
    images: [{ url: 'https://mywisebox.com/og/wisebox-home.png', width: 1200, height: 630, alt: 'Wisebox home page' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': 'https://mywisebox.com/#organization', name: 'Wisebox', url: 'https://mywisebox.com', description: 'Secure property management for diaspora families.', sameAs: ['https://mywisebox.com/about', 'https://mywisebox.com/contact'] },
    { '@type': 'WebSite', '@id': 'https://mywisebox.com/#website', url: 'https://mywisebox.com', name: 'Wisebox', publisher: { '@id': 'https://mywisebox.com/#organization' }, inLanguage: 'en' },
  ],
};

const testimonials = [
  { quote: 'I spent three years trying to sort out my father\u2019s land documents from London. Wisebox gave me clarity in one week.', name: 'Rafiq H.', location: 'London, UK' },
  { quote: 'The assessment told me exactly which documents were missing. I didn\u2019t even know what a mutation certificate was before this.', name: 'Nasreen A.', location: 'Toronto, Canada' },
  { quote: 'Having a tracked ticket for every consultant interaction changed everything. No more he-said-she-said.', name: 'Kamal U.', location: 'Dallas, USA' },
  { quote: 'My siblings and I were arguing about the family property for months. Wisebox gave us one place to see the actual status.', name: 'Farhana R.', location: 'Sydney, Australia' },
  { quote: 'I was always anxious about our property in Sylhet. Now I check the app once a week and I know exactly where things stand.', name: 'Imran S.', location: 'New York, USA' },
];

export default function Home() {
  return (
    <>
      <MarketingHeader />
      <main>
        {/* ── HERO ── */}
        <LandingHero />

        {/* ── TRUST STRIP ── */}
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-sm text-muted-foreground">Trusted by families across the world</p>
            <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-24 h-8 rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features-section" className="scroll-mt-16 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <RevealSection>
              <h2 className="text-center font-[family-name:var(--font-geist-sans)] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15] text-foreground max-w-3xl mx-auto">
                Everything you need to protect what matters.
              </h2>
            </RevealSection>

            <div className="mt-16 space-y-8">
              <FeatureCard kicker="Foundation" heading="Document vault & property profiles" body="Organize deeds, tax records, legal correspondence, and ownership evidence in a secure, searchable timeline. Every document versioned and time-stamped.">
                <PropertyMock />
              </FeatureCard>
              <FeatureCard kicker="Insight" heading="Real-time status & smart alerts" body="Track property status, action items, and updates from consultants. Receive targeted alerts for comments, assignments, status changes, and deadlines." reverse>
                <NotificationMock />
              </FeatureCard>
              <FeatureCard kicker="Support" heading="Licensed consultants & tracked tickets" body="Connect with licensed consultants for legal guidance, dispute resolution, and compliance. Every request becomes a tracked ticket with status history.">
                <TicketMock />
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="py-20 sm:py-28">
          <RevealSection>
            <div className="mx-6 rounded-3xl bg-muted/50 dark:bg-card/50">
              <div className="mx-auto max-w-5xl px-8 py-16 sm:py-20">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 text-center">
                  {[
                    { num: '15', unit: 'min', desc: 'Average time to complete your first property assessment' },
                    { num: '72', unit: '%', desc: 'Average readiness score improvement after 30 days' },
                    { num: '4', unit: 'countries', desc: 'Families from US, UK, Canada, and Australia' },
                  ].map((stat) => (
                    <div key={stat.num}>
                      <p className="text-5xl font-semibold text-primary">{stat.num}<span className="text-2xl font-normal text-muted-foreground ml-1">{stat.unit}</span></p>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{stat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* ── FEATURED TESTIMONIAL ── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <RevealSection>
              <div className="rounded-3xl bg-card border border-border shadow-xl dark:shadow-none p-10 sm:p-16">
                <p className="text-xs font-medium uppercase text-primary" style={{ letterSpacing: '0.15em' }}>Case Study</p>
                <blockquote className="mt-6 text-2xl sm:text-3xl font-medium leading-relaxed italic text-foreground max-w-3xl">
                  &ldquo;Wisebox has <em className="not-italic text-primary">completely transformed</em> how our family manages property back in Bangladesh. What used to be scattered documents and anxious phone calls is now a clear, trackable system we all trust.&rdquo;
                </blockquote>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border">
                    <img src="/images/landing/hero-family.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div><p className="text-base font-medium text-foreground">Rafiq H.</p><p className="text-sm text-muted-foreground">London, UK</p></div>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ── TESTIMONIAL CAROUSEL ── */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <RevealSection><p className="text-xl font-medium text-muted-foreground">Real stories from real families</p></RevealSection>
          </div>
          <TestimonialScroller testimonials={testimonials} />
        </section>

        {/* ── FAQ ── */}
        <section id="faq-section" className="scroll-mt-16 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.5fr]">
              <RevealSection>
                <h2 className="font-[family-name:var(--font-geist-sans)] text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">Everything you need to know</h2>
                <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">Contact us <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} /></Link>
              </RevealSection>
              <RevealSection delay={100}><FaqAccordion faqs={marketingFaqs} /></RevealSection>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <RevealSection>
              <h2 className="font-[family-name:var(--font-geist-sans)] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15] text-foreground">From scattered to structured</h2>
              <div className="mt-8">
                <Link href="/assessment/start" className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-lg font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]">
                  Get started — it&rsquo;s free <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                </Link>
              </div>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">Building clarity for families who own property across borders.</p>
            </RevealSection>
          </div>
        </section>
      </main>

      <MarketingFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
