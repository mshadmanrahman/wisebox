'use client';

import Link from 'next/link';
import { WiseboxLogo } from '@/components/ui/wisebox-logo';

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <WiseboxLogo variant="auto" size="sm" />
            <p className="mt-2 text-xs text-muted-foreground">
              Property operations for Bangladeshi families abroad.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Questions? <a href="mailto:support@mywisebox.com" className="text-primary hover:underline">support@mywisebox.com</a>
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-6">
            <Link href="/about" className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground">About</Link>
            <a href="#faq-section" className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground">FAQ</a>
            <a href="#contact-section" className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground">Contact</a>
            <Link href="/assessment/start" className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground">Free Assessment</Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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
