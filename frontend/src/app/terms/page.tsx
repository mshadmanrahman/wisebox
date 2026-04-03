import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Wisebox',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-primary hover:underline mb-8 inline-block">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>
            Welcome to Wisebox. By using our platform, you agree to the following terms and conditions.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8">1. Service Description</h2>
          <p>
            Wisebox provides a digital platform for managing property documentation, assessments,
            and connecting with licensed property consultants for the Bangladeshi diaspora community.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8">2. User Accounts</h2>
          <p>
            You are responsible for maintaining the security of your account credentials.
            You must provide accurate information during registration.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8">3. Document Storage</h2>
          <p>
            Documents uploaded to Wisebox are stored securely using encrypted cloud storage.
            Wisebox does not claim ownership of your documents.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8">4. Consultation Services</h2>
          <p>
            Consultations are provided by independent licensed consultants. Wisebox facilitates
            the connection but does not provide legal advice directly.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8">5. Contact</h2>
          <p>
            For questions about these terms, contact us at{' '}
            <a href="mailto:support@mywisebox.com" className="text-primary hover:underline">
              support@mywisebox.com
            </a>
          </p>
          <p className="text-sm mt-12">Last updated: April 2026</p>
        </div>
      </div>
    </div>
  );
}
