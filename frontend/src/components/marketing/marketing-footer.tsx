import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="border-t border-wisebox-border bg-wisebox-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 text-sm sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold text-wisebox-primary-700">Wisebox</p>
          <p className="max-w-2xl text-wisebox-text-secondary">
            Secure property operations for families and diaspora owners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-wisebox-text-secondary">
          <Link href="/about" className="hover:text-wisebox-primary-700">
            About
          </Link>
          <Link href="/faq" className="hover:text-wisebox-primary-700">
            FAQ
          </Link>
          <Link href="/contact" className="hover:text-wisebox-primary-700">
            Contact
          </Link>
          <Link href="/assessment/start" className="hover:text-wisebox-primary-700">
            Free Assessment
          </Link>
        </div>

        <p className="text-xs text-wisebox-text-secondary">
          (c) {new Date().getFullYear()} Wisebox. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
