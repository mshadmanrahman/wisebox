'use client';

import Link from 'next/link';
import { WiseboxLogo } from '@/components/ui/wisebox-logo';

const OFFICES = [
  { abbr: 'DC', city: 'Washington, D.C.', country: 'United States' },
  { abbr: 'UPP', city: 'Uppsala', country: 'Sweden' },
  { abbr: 'DHK', city: 'Dhaka', country: 'Bangladesh' },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">

        {/* Top section: brand + nav left | offices right */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">

          {/* Left: logo + nav */}
          <div className="flex flex-col gap-10">
            <WiseboxLogo variant="auto" size="sm" />

            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <Link href="/about" className="text-sm font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
                About
              </Link>
              <a href="#faq-section" className="text-sm font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
                FAQ
              </a>
              <a href="#contact-section" className="text-sm font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
                Contact
              </a>
              <Link href="/assessment/start" className="text-sm font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
                Free Assessment
              </Link>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Property operations for Bangladeshi families abroad.
              </p>
              <a
                href="mailto:support@mywisebox.com"
                className="mt-1 inline-block text-sm text-primary hover:underline"
              >
                support@mywisebox.com
              </a>
            </div>
          </div>

          {/* Right: offices */}
          <div>
            <p className="mb-8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Our Global Offices
            </p>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {OFFICES.map(({ abbr, city, country }) => (
                <div key={abbr}>
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {abbr}
                  </p>
                  <p className="mt-2 text-sm text-foreground">{city}</p>
                  <p className="text-xs text-muted-foreground">{country}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Wisebox. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="cursor-default">Terms of Service</span>
            <span className="cursor-default">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
