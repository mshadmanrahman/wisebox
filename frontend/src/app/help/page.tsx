import Link from 'next/link';

export const metadata = {
  title: 'Help Center | Wisebox',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-primary hover:underline mb-8 inline-block">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Help Center</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>
            Need help with Wisebox? Here are the most common questions and how to get support.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">Getting Started</h2>
          <p>
            Take our <Link href="/assessment/start" className="text-primary hover:underline">free property assessment</Link> to
            understand your property readiness score. Then create an account to start managing your documents.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">Property Documents</h2>
          <p>
            Wisebox helps you organize essential property documents including deeds (dolil),
            khatian records, mutation certificates, tax receipts, and more. Upload documents
            in PDF, JPG, or PNG format.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">Consultations</h2>
          <p>
            Book a free 30-minute consultation with a licensed property expert. They can
            review your documents, assess your situation, and provide a clear action plan.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">Contact Support</h2>
          <p>
            Email us at{' '}
            <a href="mailto:support@mywisebox.com" className="text-primary hover:underline">
              support@mywisebox.com
            </a>
            {' '}and we will respond within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
