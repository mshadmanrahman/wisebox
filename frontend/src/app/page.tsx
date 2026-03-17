import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FolderOpen,
  EyeOff,
  AlertTriangle,
  GitBranch,
  FileText,
  Activity,
  Scale,
  Ticket,
  Bell,
  BarChart3,
  ScrollText,
  UsersRound,
  Shield,
  ArrowRight,
  Home as HomeIcon,
} from 'lucide-react';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { PricingTable } from '@/components/marketing/pricing-table';
import { marketingFaqs, pricingPlans } from '@/components/marketing/content';
import {
  LandingHero,
  RevealSection,
  StaggerGrid,
  TestimonialScroller,
} from '@/components/marketing/landing-sections';

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
    images: [{ url: 'https://mywisebox.com/og/wisebox-home.png', width: 1200, height: 630, alt: 'Wisebox home page' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://mywisebox.com/#organization',
      name: 'Wisebox',
      url: 'https://mywisebox.com',
      description: 'Secure property management for diaspora families.',
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

const painPoints = [
  { icon: FolderOpen, title: 'Your deed is in a drawer in Dhaka. Your tax receipts are in a Gmail thread.', body: 'Critical documents scattered across family members, filing cabinets, and inboxes. When you need them urgently, they\u2019re never in one place.' },
  { icon: EyeOff, title: 'By the time you hear about a problem, it\u2019s already a crisis.', body: 'Encroachment. Forged signatures. Missed municipal deadlines. 8,000 miles away, small issues become expensive emergencies.' },
  { icon: AlertTriangle, title: 'Your family calls the local contact. The local contact calls their guy.', body: 'No audit trail. No documentation. No way to verify what was done, what it cost, or whether it happened.' },
  { icon: GitBranch, title: 'Nobody in the family can answer: who owns what?', body: 'Inherited property without clear succession documentation is a ticking clock.' },
];

const features = [
  { icon: FileText, title: 'Document Vault', body: 'Organize deeds, tax records, legal correspondence, and ownership evidence in a secure, searchable timeline. Every document versioned and time-stamped.', size: 'large' as const },
  { icon: Activity, title: 'Property Status', body: 'Track action items, updates from consultants, and changes on the ground.', size: 'small' as const },
  { icon: Scale, title: 'Legal Consultations', body: 'Connect with licensed consultants for guidance, disputes, and compliance. Every interaction linked to your property.', size: 'small' as const },
  { icon: Ticket, title: 'Tracked Tickets', body: 'Every service request becomes a tracked ticket with status history and consultant notes.', size: 'small' as const },
  { icon: Bell, title: 'Smart Notifications', body: 'Targeted alerts for comments, assignments, status changes, and deadlines.', size: 'small' as const },
  { icon: BarChart3, title: 'Readiness Score', body: 'A clarity score for each property based on document completeness, ownership structure, and operational readiness. Know where you stand.', size: 'full' as const },
];

const processSteps = [
  { num: '1', title: 'Add your property', body: 'Capture location, ownership details, and baseline context in a single digital record. One property, one source of truth.', mockLabel: 'Add Property Form', mockIcon: HomeIcon},
  { num: '2', title: 'See where you stand', body: 'Upload what you have. Wisebox scores your documentation against what\u2019s required, flags what\u2019s missing, and gives you a prioritized action list.', mockLabel: 'Assessment Results', mockIcon: BarChart3 },
  { num: '3', title: 'Get support when you need it', body: 'Book legal consultations, property valuations, or document retrieval. Every request becomes a tracked ticket with status updates and consultant notes.', mockLabel: 'Ticket Tracking', mockIcon: Ticket },
];

const testimonials = [
  { quote: 'I spent three years trying to sort out my father\u2019s land documents from London. Wisebox gave me clarity in one week.', name: 'Rafiq H.', location: 'London, UK' },
  { quote: 'The assessment told me exactly which documents were missing. I didn\u2019t even know what a mutation certificate was before this.', name: 'Nasreen A.', location: 'Toronto, Canada' },
  { quote: 'Having a tracked ticket for every consultant interaction changed everything. No more he-said-she-said.', name: 'Kamal U.', location: 'Dallas, USA' },
  { quote: 'My siblings and I were arguing about the family property for months. Wisebox gave us one place to see the actual status.', name: 'Farhana R.', location: 'Sydney, Australia' },
  { quote: 'I was always anxious about our property in Sylhet. Now I check the app once a week and I know exactly where things stand.', name: 'Imran S.', location: 'New York, USA' },
];

/* Browser frame mock for process section */
function BrowserMock({ icon: Icon, label }: { icon: typeof HomeIcon; label: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border dark:border-white/10 overflow-hidden shadow-sm dark:shadow-none">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/50">
        <div className="w-2.5 h-2.5 rounded-full bg-border" />
        <div className="w-2.5 h-2.5 rounded-full bg-border" />
        <div className="w-2.5 h-2.5 rounded-full bg-border" />
        <div className="ml-3 h-5 w-48 rounded bg-border/50" />
      </div>
      <div className="h-64 sm:h-80 bg-muted/30 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Screenshot coming soon</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <MarketingHeader />
      <main className="scroll-smooth">
        {/* ─── HERO ─── */}
        <LandingHero />

        {/* ─── SOCIAL PROOF ─── */}
        <section className="bg-muted/30 py-12">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-sm text-muted-foreground">
              Trusted by diaspora families across the US, UK, Canada, and Australia.
            </p>
          </div>
        </section>

        {/* ─── [01] THE PROBLEM ─── */}
        <section id="problem-section" className="py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-6xl px-6">
            <RevealSection>
              <p className="text-xs font-medium uppercase text-primary" style={{ letterSpacing: '0.2em' }}>[01]&ensp;The Reality</p>
            </RevealSection>

            <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_auto]">
              <RevealSection delay={100}>
                <h2 className="max-w-lg font-[family-name:var(--font-geist-sans)] text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                  Distance doesn&rsquo;t just create inconvenience.{' '}<span className="text-primary">It creates risk.</span>
                </h2>
              </RevealSection>
              <RevealSection delay={200} className="hidden lg:block">
                <div className="relative w-72 xl:w-80">
                  <img src="/images/landing/father-son-laptop.jpg" alt="Father and son at laptop" className="rounded-2xl object-cover shadow-2xl dark:shadow-none ring-1 ring-black/10 dark:ring-white/5 aspect-[3/4]" />
                </div>
              </RevealSection>
            </div>

            <RevealSection delay={150}>
              <p className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Every year, thousands of diaspora families lose money, land, or legal standing because they couldn&rsquo;t see what was happening on the ground.
              </p>
            </RevealSection>

            {/* Fix #2: Card body text-base + leading-relaxed, p-8 confirmed */}
            <StaggerGrid className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {painPoints.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="group rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/[0.03] p-8 shadow-sm dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:border-white/15">
                    <Icon className="mb-4 h-5 w-5 text-primary" strokeWidth={1.5} />
                    <p className="text-base font-medium text-foreground leading-snug">{item.title}</p>
                    <p className="mt-3 text-base text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                );
              })}
            </StaggerGrid>
          </div>
        </section>

        {/* ─── [02] THE PROCESS ─── */}
        <section id="process-section" className="scroll-mt-16 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-6xl px-6">
            <RevealSection>
              <p className="text-xs font-medium uppercase text-primary" style={{ letterSpacing: '0.2em' }}>[02]&ensp;The Process</p>
            </RevealSection>
            <RevealSection delay={100}>
              <h2 className="mt-6 max-w-xl font-[family-name:var(--font-geist-sans)] text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.02em' }}>Three steps. Full clarity.</h2>
              <Link href="/assessment/start" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                Get Free Assessment — takes 3 minutes <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </RevealSection>

            {/* Fix #3: Proper browser frame mocks */}
            <div className="mt-20 space-y-24 sm:space-y-32">
              {processSteps.map((step, i) => (
                <div key={step.num} className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 ${i === 1 ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''}`}>
                  <RevealSection delay={i === 1 ? 0 : undefined}>
                    <div className="flex items-start gap-6">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-semibold text-primary">{step.num}</div>
                      <div>
                        <h3 className="text-2xl font-semibold text-foreground sm:text-3xl" style={{ letterSpacing: '-0.01em' }}>{step.title}</h3>
                        <p className="mt-3 max-w-md text-base text-muted-foreground leading-relaxed">{step.body}</p>
                      </div>
                    </div>
                  </RevealSection>
                  <RevealSection delay={150}>
                    <BrowserMock icon={step.mockIcon} label={step.mockLabel} />
                  </RevealSection>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── [03] FEATURES ─── */}
        <section id="features-section" className="scroll-mt-16 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-6xl px-6">
            <RevealSection>
              <p className="text-xs font-medium uppercase text-primary" style={{ letterSpacing: '0.2em' }}>[03]&ensp;The Platform</p>
              <h2 className="mt-6 max-w-xl font-[family-name:var(--font-geist-sans)] text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                One workspace. Everything your property needs.
              </h2>
            </RevealSection>

            <RevealSection delay={100}>
              <div className="mt-12 overflow-hidden rounded-2xl ring-1 ring-black/10 dark:ring-white/5">
                <img src="/images/landing/woman-armchair-away.jpg" alt="Manage your property from anywhere" className="w-full object-cover aspect-[21/9]" />
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">Manage your property from anywhere.</p>
            </RevealSection>

            {/* Fix #4: Bento grid with proper sizing — large card w-8 h-8 icon, full-width card py-6 */}
            <StaggerGrid className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {features.map((f) => {
                const Icon = f.icon;
                const isLarge = f.size === 'large';
                const isFull = f.size === 'full';
                return (
                  <div key={f.title} className={`group rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/[0.03] shadow-sm dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:border-white/15 ${isLarge ? 'sm:col-span-2 sm:row-span-2 p-10' : ''} ${isFull ? 'sm:col-span-3 px-8 py-6' : ''} ${!isLarge && !isFull ? 'p-8' : ''}`}>
                    <Icon className={`mb-4 text-primary ${isLarge ? 'h-8 w-8' : 'h-5 w-5'}`} strokeWidth={1.5} />
                    <p className={`font-medium text-foreground ${isLarge ? 'text-xl' : 'text-lg'}`}>{f.title}</p>
                    <p className={`mt-2 text-muted-foreground leading-relaxed ${isLarge ? 'text-base' : 'text-sm'}`}>{f.body}</p>
                  </div>
                );
              })}
            </StaggerGrid>

            <RevealSection delay={200}>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                {[{ icon: ScrollText, title: 'Digital Will Creation' }, { icon: UsersRound, title: 'Family Collaboration' }].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-center gap-3 text-muted-foreground">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                      <span className="text-sm">{item.title}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">Coming soon</span>
                    </div>
                  );
                })}
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ─── [04] TESTIMONIALS ─── */}
        <section className="bg-muted/20 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-6xl px-6">
            <RevealSection>
              <p className="text-xs font-medium uppercase text-primary" style={{ letterSpacing: '0.2em' }}>[04]&ensp;What Families Say</p>
              <h2 className="mt-6 max-w-lg font-[family-name:var(--font-geist-sans)] text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl" style={{ letterSpacing: '-0.02em' }}>
                Trusted by families who care about what they&rsquo;ve built.
              </h2>
            </RevealSection>
          </div>
          <TestimonialScroller testimonials={testimonials} />
        </section>

        {/* ─── [05] PRICING ─── */}
        <section id="pricing-section" className="scroll-mt-16 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-6xl px-6">
            <RevealSection>
              <p className="text-xs font-medium uppercase text-primary" style={{ letterSpacing: '0.2em' }}>[05]&ensp;Pricing</p>
              <h2 className="mt-6 max-w-lg font-[family-name:var(--font-geist-sans)] text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl" style={{ letterSpacing: '-0.02em' }}>
                Start free. Upgrade when you&rsquo;re ready.
              </h2>
            </RevealSection>
            <div className="mt-12"><PricingTable plans={pricingPlans} /></div>
          </div>
        </section>

        {/* ─── SECURITY ─── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
            <RevealSection>
              <Shield className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <h2 className="mt-4 font-[family-name:var(--font-geist-sans)] text-2xl font-semibold text-foreground sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>Your documents are encrypted and access-controlled.</h2>
              <p className="mt-4 max-w-md text-base text-muted-foreground leading-relaxed">Wisebox is built with secure APIs, role-based permissions, and audit-friendly status tracking. Your property records are private by default and shared only with people you authorize.</p>
              <Link href="/assessment/start" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">Run Free Assessment <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} /></Link>
            </RevealSection>
            <RevealSection delay={200}>
              <img src="/images/landing/woman-couch.jpg" alt="Woman relaxing at home" className="rounded-2xl object-cover shadow-2xl dark:shadow-none ring-1 ring-black/10 dark:ring-white/5 aspect-[4/3]" />
            </RevealSection>
          </div>
        </section>

        {/* ─── [06] FAQ ─── */}
        <section id="faq-section" className="scroll-mt-16 py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-[1fr_1.5fr]">
            <RevealSection>
              <p className="text-xs font-medium uppercase text-primary" style={{ letterSpacing: '0.2em' }}>[06]&ensp;FAQ</p>
              <h2 className="mt-6 font-[family-name:var(--font-geist-sans)] text-2xl font-semibold text-foreground sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>Frequently asked questions</h2>
            </RevealSection>
            <RevealSection delay={100}>
              <FaqAccordion faqs={marketingFaqs} />
            </RevealSection>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat block dark:hidden" style={{ backgroundImage: "url('/images/gradients/gradient-12-light.png')" }} />
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden dark:block" style={{ backgroundImage: "url('/images/gradients/gradient-12-dark.png')" }} />
          {/* Fix #1: lighter dark overlay */}
          <div className="absolute inset-0 bg-white/10 dark:bg-black/15" />
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-background to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-background" />

          <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-32 sm:py-40 lg:grid-cols-2">
            <div>
              <h2 className="font-[family-name:var(--font-geist-sans)] text-3xl font-semibold leading-[1.15] text-foreground dark:text-white sm:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.02em' }}>Start with clarity. Everything else follows.</h2>
              <p className="mt-4 max-w-md text-muted-foreground dark:text-white/70 leading-relaxed">Run a free assessment to see where your property stands. No payment required. No commitment.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/assessment/start" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]">
                  Get Free Assessment <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
                <a href="#pricing-section" className="inline-flex items-center justify-center gap-2 rounded-xl border px-8 py-4 text-base font-medium transition-all duration-200 border-foreground/20 text-foreground hover:bg-foreground/5 dark:border-white/30 dark:text-white dark:hover:bg-white/10">See Our Plans</a>
              </div>
            </div>
            <div className="hidden lg:block">
              <img src="/images/landing/woman-armchair-phone.jpg" alt="Woman using Wisebox" className="rounded-2xl object-cover shadow-2xl dark:shadow-none ring-1 ring-black/10 dark:ring-white/5 aspect-[4/5] w-full max-w-sm ml-auto" />
            </div>
          </div>
        </section>
      </main>

      {/* Fix #10: footer with contact email inline */}
      <MarketingFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
