import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  FileCheck,
  Globe,
  Heart,
  Lock,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { RevealSection } from '@/components/marketing/landing-sections';

export const metadata: Metadata = {
  title: 'About Wisebox | Built for Diaspora Families',
  description:
    'Wisebox is a US-incorporated property technology company building secure cross-border property operations infrastructure for diaspora families worldwide.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Wisebox | Built for Diaspora Families',
    description:
      'Wisebox is a US-incorporated property technology company building secure cross-border property operations infrastructure for diaspora families worldwide.',
    type: 'website',
    url: 'https://mywisebox.com/about',
  },
};

/* ─── Data ─────────────────────────────────────────────────────────── */

const TRUST_BADGES = [
  {
    Icon: Building2,
    title: 'Delaware C-Corp',
    subtitle: 'US incorporated entity',
  },
  {
    Icon: ShieldCheck,
    title: 'Encrypted & Secure',
    subtitle: 'Data encrypted at rest and in transit',
  },
  {
    Icon: Globe,
    title: 'Global Operations',
    subtitle: 'US · Sweden · Bangladesh',
  },
  {
    Icon: FileCheck,
    title: 'Compliance First',
    subtitle: 'SOC 2 readiness roadmap',
  },
];

const COMPANY_DETAILS = [
  { label: 'Legal name', value: 'Wisebox Inc.' },
  { label: 'Incorporation', value: 'Delaware C-Corporation, USA' },
  { label: 'Founded', value: '2025' },
  { label: 'Headquarters', value: 'Washington, D.C., United States' },
  { label: 'Industry', value: 'Property Technology (PropTech)' },
  {
    label: 'Focus',
    value: 'Cross-border property operations for diaspora families',
  },
];

const OFFICES = [
  { city: 'Washington, D.C.', country: 'United States', role: 'Headquarters' },
  { city: 'Uppsala', country: 'Sweden', role: 'Engineering' },
  { city: 'Dhaka', country: 'Bangladesh', role: 'Operations & Consulting' },
];

const VALUES = [
  {
    Icon: Eye,
    title: 'Transparency over opacity',
    body: 'Every document, every status update, every consultant interaction is tracked and visible. No black boxes. No guesswork.',
  },
  {
    Icon: Lock,
    title: 'Security by default',
    body: "Your property records are encrypted, access-controlled, and private. We don't share data with third parties. Your documents are yours.",
  },
  {
    Icon: Heart,
    title: 'Families first',
    body: 'We are building for real families with real property concerns. Every feature, every workflow, every decision is shaped by the needs of diaspora property owners.',
  },
];

const SECURITY_INFRASTRUCTURE = [
  '256-bit AES encryption at rest',
  'TLS 1.3 encryption in transit',
  'Role-based access control (RBAC)',
  'Audit-friendly status logging',
  'Hosted on SOC 2 certified infrastructure',
];

const SECURITY_POLICIES = [
  'No third-party data sharing',
  'GDPR-aligned data handling practices',
  'Permissioned document access only',
  'Regular security reviews',
  'Data retention and deletion controls',
];

const TEAM_PLACEHOLDERS = [
  { name: 'Team Member', role: 'Co-Founder & CEO', location: 'Washington, D.C.' },
  { name: 'Team Member', role: 'Co-Founder & CTO', location: 'Uppsala, Sweden' },
  { name: 'Team Member', role: 'Head of Operations', location: 'Dhaka, Bangladesh' },
  { name: 'Team Member', role: 'Product Designer', location: 'Washington, D.C.' },
  { name: 'Team Member', role: 'Lead Engineer', location: 'Uppsala, Sweden' },
  { name: 'Team Member', role: 'Legal Advisor', location: 'Dhaka, Bangladesh' },
];

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <>
      <MarketingHeader />
      <main>

        {/* ── 1. HERO ── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 text-center sm:px-8">
            <RevealSection>
              <p className="text-xs font-medium uppercase tracking-widest text-primary">
                About Wisebox
              </p>
              <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
                Built by families who understand what it means to own property across borders.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Wisebox is a US-incorporated technology company building secure property operations infrastructure for diaspora families worldwide.
              </p>
            </RevealSection>
          </div>
        </section>

        {/* ── 2. TRUST BADGES ── */}
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <RevealSection>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {TRUST_BADGES.map(({ Icon, title, subtitle }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-border bg-card p-5 text-center"
                  >
                    <Icon className="mx-auto h-6 w-6 text-primary" strokeWidth={1.5} />
                    <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ── 3. MISSION ── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <RevealSection>
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Our mission
                  </h2>
                  <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>
                      Millions of Bangladeshi families living abroad own property back home. Land passed down through generations. Homes built by parents and grandparents. Agricultural plots that have been in the family for decades.
                    </p>
                    <p>
                      Managing these properties from thousands of miles away has always meant scattered documents, unreliable local contacts, and reactive crisis management. There has never been a proper system for it.
                    </p>
                    <p>
                      Wisebox exists to change that. We are building the operating system for cross-border property management — a secure, structured platform where families can organize documents, track property status, coordinate legal support, and plan succession. All from one place, anywhere in the world.
                    </p>
                    <p>
                      We are not a law firm. We are not a brokerage. We are an infrastructure company that gives property-owning families the tools, visibility, and professional support they need to protect what matters most.
                    </p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 dark:shadow-none dark:ring-white/5">
                  <img
                    src="/images/landing/hero-family.jpg"
                    alt="Family discussing property"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ── 4. COMPANY DETAILS + OFFICES ── */}
        <section className="bg-muted/30 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <RevealSection>
              <h2 className="text-2xl font-semibold text-foreground">Company details</h2>
              <div className="mt-8">
                {COMPANY_DETAILS.map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={`flex justify-between py-3 ${i < COMPANY_DETAILS.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="max-w-[60%] text-right text-sm font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              <h2 className="mt-16 text-2xl font-semibold text-foreground">Our offices</h2>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {OFFICES.map(({ city, country, role }) => (
                  <div key={city} className="rounded-2xl border border-border bg-card p-6">
                    <MapPin className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    <p className="mt-3 text-lg font-semibold text-foreground">{city}</p>
                    <p className="text-sm text-muted-foreground">{country}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wider text-primary">{role}</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ── 5. VALUES ── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <RevealSection>
              <h2 className="mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                What we stand for
              </h2>
              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {VALUES.map(({ Icon, title, body }) => (
                  <div key={title} className="rounded-2xl border border-border bg-card p-8">
                    <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
                    <p className="mt-4 text-lg font-semibold text-foreground">{title}</p>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ── 6. TEAM ── */}
        <section className="bg-muted/30 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <RevealSection>
              <div className="text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  The team behind Wisebox
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                  A global team of product builders, property experts, and engineers.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
                {TEAM_PLACEHOLDERS.map(({ name, role, location }, i) => (
                  <div key={i} className="text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                      <User className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                    <p className="text-xs text-muted-foreground/60">{location}</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ── 7. SECURITY & COMPLIANCE ── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <RevealSection>
              <h2 className="mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                How we protect your data
              </h2>
              <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">Infrastructure</p>
                  <ul className="mt-6 space-y-4">
                    {SECURITY_INFRASTRUCTURE.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                        <span className="text-base text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border bg-card p-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">Policies</p>
                  <ul className="mt-6 space-y-4">
                    {SECURITY_POLICIES.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                        <span className="text-base text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ── 8. CTA ── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <RevealSection>
              <div className="text-center">
                <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Start with a free readiness check
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  Run the free assessment to understand your current documentation status and next best actions.
                </p>
                <div className="mt-8">
                  <Link
                    href="/assessment/start"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-lg font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                  >
                    Get Free Assessment <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

      </main>
      <MarketingFooter />
    </>
  );
}
