import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { marketingFaqs } from '@/components/marketing/content';
import {
  LandingHero,
  RevealSection,
  FeatureCard,
  PropertyMock,
  NotificationMock,
  TicketMock,
  GrainyGradientBg,
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

export default function Home() {
  return (
    <>
      <MarketingHeader />
      <main>
        {/* ── HERO ── */}
        <LandingHero />

        {/* ── TRUST LINE ── */}
        <section className="py-8 text-center">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <p className="text-sm text-muted-foreground">Trusted by 500+ families across the US, UK, Canada, and Australia</p>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features-section" className="scroll-mt-16 py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <RevealSection>
              <h2 className="text-center font-[family-name:var(--font-geist-sans)] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15] text-foreground max-w-3xl mx-auto">
                Everything you need to protect what matters.
              </h2>
            </RevealSection>

            <div className="mt-12 sm:mt-16 space-y-8">
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

        {/* ── STATS (with gradient-15 accent) ── */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <RevealSection>
              <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-lg dark:shadow-none border border-border relative">
                <GrainyGradientBg name="gradient-10" className="opacity-45 dark:opacity-20" />
                <div className="absolute inset-0 bg-card/60 dark:bg-card/75" />
                <div className="relative z-10 p-12 sm:p-16">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                    {[
                      { num: '15', unit: 'min', desc: 'Average time to complete your first property assessment' },
                      { num: '72', unit: '%', desc: 'Average readiness score improvement after 30 days' },
                      { num: '4', unit: 'countries', desc: 'Families from US, UK, Canada, and Australia' },
                    ].map((stat) => (
                      <div key={stat.num}>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-5xl font-semibold text-primary">{stat.num}</span>
                          <span className="text-lg text-muted-foreground font-medium">{stat.unit}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground leading-snug max-w-[200px] mx-auto">{stat.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ── FEATURED TESTIMONIAL ── */}
        <section className="py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <RevealSection>
              <div className="rounded-3xl bg-card border border-border shadow-xl dark:shadow-none overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative min-h-[300px] lg:min-h-[450px]">
                    <img src="/images/landing/father-son-laptop.jpg" alt="Family using Wisebox" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="bg-card p-10 sm:p-14 flex flex-col justify-center">
                    <p className="text-xs font-medium uppercase text-primary" style={{ letterSpacing: '0.15em' }}>Case Study</p>
                    <blockquote className="mt-6 text-xl sm:text-2xl font-medium leading-relaxed italic text-foreground">
                      &ldquo;Wisebox has <span className="not-italic text-primary font-semibold">completely transformed</span> how our family manages property back in Bangladesh. What used to be scattered documents and anxious phone calls is now a clear, trackable system we all trust.&rdquo;
                    </blockquote>
                    <div className="mt-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">R</div>
                      <div><p className="text-sm font-medium text-foreground">Rafiq H.</p><p className="text-xs text-muted-foreground">London, UK</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq-section" className="scroll-mt-16 py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
              <RevealSection className="lg:col-span-1">
                <h2 className="font-[family-name:var(--font-geist-sans)] text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">Everything you need to know</h2>
                <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">Contact us <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} /></Link>
              </RevealSection>
              <RevealSection delay={100} className="lg:col-span-2"><FaqAccordion faqs={marketingFaqs} /></RevealSection>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA (with gradient-23 accent + woman photo) ── */}
        <section className="py-24 sm:py-32 relative overflow-hidden">
          <GrainyGradientBg name="gradient-12" className="opacity-55 dark:opacity-25" />
          <div className="absolute inset-0 bg-background/50 dark:bg-background/60" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
            <RevealSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-[family-name:var(--font-geist-sans)] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15] text-foreground">From scattered to structured</h2>
                  <p className="mt-4 text-lg text-muted-foreground leading-relaxed">Building clarity for families who own property across borders.</p>
                  <div className="mt-8">
                    <Link href="/assessment/start" className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-lg font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]">
                      Get started — it&rsquo;s free <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="rounded-3xl overflow-hidden shadow-xl dark:shadow-none ring-1 ring-black/5 dark:ring-white/5">
                    <img src="/images/landing/woman-armchair-away.jpg" alt="Peace of mind" className="w-full aspect-[4/3] object-cover" />
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>
      </main>

      <MarketingFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
