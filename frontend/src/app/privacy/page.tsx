import Link from 'next/link';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export const metadata = {
  title: 'Privacy Policy | Wisebox',
  description: 'How Wisebox collects, uses, and protects your personal data under UK GDPR.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <MarketingHeader />
      <main className="bg-background">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <Link href="/" className="text-sm text-primary hover:underline mb-8 inline-block">
            &larr; Back to home
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: February 2, 2026</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3">
            <p>
              WiseBox is committed to protecting your privacy and handling your personal data
              transparently and securely.
            </p>

            <h2>1. Data Controller</h2>
            <p>
              WiseBox is the data controller responsible for your personal data under the UK GDPR.
            </p>

            <h2>2. Personal Data We Collect</h2>
            <p>We may collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Identity information (name, date of birth)</li>
              <li>Contact details (email, phone number, address)</li>
              <li>Account credentials</li>
              <li>Property-related information</li>
              <li>Uploaded documents</li>
              <li>Payment and transaction details</li>
              <li>Technical data (IP address, device type, log data)</li>
            </ul>

            <h2>3. How We Use Your Data</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and manage WiseBox services</li>
              <li>Verify identity and prevent fraud</li>
              <li>Communicate service updates and notices</li>
              <li>Process payments</li>
              <li>Improve platform performance</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Legal Basis for Processing</h2>
            <p>Under UK GDPR, we process data based on:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Contractual necessity</li>
              <li>Legal obligations</li>
              <li>Legitimate interests</li>
              <li>User consent (where applicable)</li>
            </ul>

            <h2>5. Data Sharing</h2>
            <p>We may share data with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Trusted service providers (IT, hosting, payment processors)</li>
              <li>Legal or professional partners (with user authorisation)</li>
              <li>Regulatory authorities where legally required</li>
            </ul>
            <p>We do not sell personal data.</p>

            <h2>6. International Data Transfers</h2>
            <p>Where data is transferred outside the UK:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Appropriate safeguards are applied</li>
              <li>Transfers comply with UK GDPR requirements</li>
            </ul>

            <h2>7. Data Retention</h2>
            <p>We retain personal data only as long as necessary for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Service provision</li>
              <li>Legal and regulatory compliance</li>
              <li>Dispute resolution</li>
            </ul>

            <h2>8. Your Rights</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your data</li>
              <li>Rectify inaccurate data</li>
              <li>Request erasure (&ldquo;right to be forgotten&rdquo;)</li>
              <li>Restrict or object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>
              Requests can be made via{' '}
              <a href="mailto:hello@wiseboxinc.com" className="text-primary hover:underline">
                hello@wiseboxinc.com
              </a>
            </p>

            <h2>9. Security Measures</h2>
            <p>WiseBox uses:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encryption</li>
              <li>Access controls</li>
              <li>Secure servers</li>
              <li>Regular security monitoring</li>
            </ul>
            <p>
              However, no system is completely secure, and users share information at their own risk.
            </p>

            <h2>10. Cookies</h2>
            <p>WiseBox uses cookies to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Improve user experience</li>
              <li>Analyse usage patterns</li>
            </ul>
            <p>You can manage cookie preferences through your browser settings.</p>

            <h2>11. Children&apos;s Data</h2>
            <p>WiseBox does not knowingly collect data from individuals under 18.</p>

            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Updates will be posted on our
              platform.
            </p>

            <h2>Contact Us</h2>
            <p>
              For privacy or data protection queries, contact us at{' '}
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
