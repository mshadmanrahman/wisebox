import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Wisebox',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-primary hover:underline mb-8 inline-block">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>
            Wisebox is committed to protecting your privacy. This policy describes how we collect,
            use, and safeguard your personal information.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8">1. Information We Collect</h2>
          <p>
            We collect information you provide directly: name, email, country of residence,
            property details, and uploaded documents.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8">2. How We Use Your Information</h2>
          <p>
            Your information is used to provide our services, including property assessment,
            document management, and connecting you with consultants.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8">3. Document Security</h2>
          <p>
            All documents are stored using encrypted cloud storage (Cloudflare R2) with
            access controls. Documents are only accessible to you and authorized consultants
            you explicitly engage.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8">4. Data Sharing</h2>
          <p>
            We do not sell your personal data. Information is shared only with consultants
            you engage and payment processors for transactions.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8">5. Contact</h2>
          <p>
            For privacy inquiries, contact us at{' '}
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
