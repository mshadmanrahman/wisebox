import Link from 'next/link';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export const metadata = {
  title: 'Terms of Service | Wisebox',
  description: 'Terms of Service for using the Wisebox property management platform.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <>
      <MarketingHeader />
      <main className="bg-background">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <Link href="/" className="text-sm text-primary hover:underline mb-8 inline-block">
            &larr; Back to home
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: February 2, 2026</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3">
            <p>
              Welcome to WiseBox. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of
              the WiseBox website, mobile applications, and related services (collectively, the
              &ldquo;Services&rdquo;).
            </p>
            <p>
              By accessing or using WiseBox, you agree to be bound by these Terms. If you do not agree,
              you must not use the Services.
            </p>

            <h2>1. About WiseBox</h2>
            <p>
              WiseBox is a digital land and property management platform designed primarily for
              Non-Resident Bangladeshis (NRBs), Indians (NRIs), and Pakistanis (NRPs) residing in the
              United Kingdom, enabling them to manage, monitor, and obtain advisory services for
              properties located abroad.
            </p>
            <p>
              WiseBox does not itself provide legal representation, financial advice, or government
              authority decisions unless explicitly stated.
            </p>

            <h2>2. Eligibility</h2>
            <p>You may use WiseBox if:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are 18 years or older</li>
              <li>You have the legal capacity to enter into a binding agreement</li>
              <li>You provide accurate and complete registration information</li>
            </ul>
            <p>
              WiseBox reserves the right to suspend or terminate accounts that breach these
              requirements.
            </p>

            <h2>3. Account Registration &amp; Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide true, accurate, and up-to-date information</li>
              <li>Keep your login credentials confidential</li>
              <li>Be responsible for all activity under your account</li>
            </ul>
            <p>
              You must notify WiseBox immediately of any unauthorised use of your account.
            </p>

            <h2>4. Scope of Services</h2>
            <p>WiseBox may provide:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Property information management tools</li>
              <li>Document storage and tracking</li>
              <li>Service packages for advisory, verification, and coordination</li>
              <li>Communication facilitation with third-party professionals (e.g., lawyers, surveyors)</li>
            </ul>
            <p>
              WiseBox acts as a facilitator and is not responsible for the independent actions, advice,
              or outcomes provided by third-party professionals.
            </p>

            <h2>5. Fees &amp; Payments</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Some Services are offered on a paid subscription or service-based fee</li>
              <li>Prices are displayed clearly before purchase</li>
              <li>All payments are non-refundable unless explicitly stated otherwise</li>
              <li>WiseBox reserves the right to change pricing with prior notice</li>
            </ul>

            <h2>6. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use WiseBox for unlawful or fraudulent purposes</li>
              <li>Upload false, misleading, or infringing content</li>
              <li>Attempt to breach system security or access other users&apos; data</li>
              <li>Misuse WiseBox services to impersonate others</li>
            </ul>
            <p>Violation may result in suspension or termination without notice.</p>

            <h2>7. Intellectual Property</h2>
            <p>
              All content, branding, software, and materials on WiseBox are owned by or licensed to
              WiseBox and protected under UK intellectual property laws. You may not reproduce,
              distribute, or commercially exploit any part of WiseBox without written permission.
            </p>

            <h2>8. Data Protection &amp; Privacy</h2>
            <p>WiseBox processes personal data in accordance with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>UK GDPR</li>
              <li>Data Protection Act 2018</li>
            </ul>
            <p>
              Details are set out in our{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              , which forms part of these Terms.
            </p>

            <h2>9. Disclaimers</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                WiseBox does not guarantee outcomes related to property disputes, approvals, or
                government actions
              </li>
              <li>Information provided is for general guidance only</li>
              <li>Services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;</li>
            </ul>

            <h2>10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by UK law:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                WiseBox shall not be liable for indirect, incidental, or consequential losses
              </li>
              <li>
                WiseBox&apos;s total liability shall not exceed the fees paid by you in the preceding
                12 months
              </li>
            </ul>
            <p>
              This does not exclude liability for death or personal injury caused by negligence or
              fraud.
            </p>

            <h2>11. Termination</h2>
            <p>WiseBox may suspend or terminate your access:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>For breach of these Terms</li>
              <li>For legal or regulatory reasons</li>
              <li>At its discretion with reasonable notice</li>
            </ul>
            <p>You may terminate your account at any time.</p>

            <h2>12. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms are governed by the laws of England and Wales. Any disputes shall be subject
              to the exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h2>13. Changes to These Terms</h2>
            <p>
              WiseBox may update these Terms from time to time. Continued use of the Services
              constitutes acceptance of the updated Terms.
            </p>

            <h2>Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a href="mailto:hello@wiseboxinc.com" className="text-primary hover:underline">
                hello@wiseboxinc.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
