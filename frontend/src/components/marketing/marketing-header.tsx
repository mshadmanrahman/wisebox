'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { marketingNavLinks } from '@/components/marketing/content';

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="shrink-0 text-base font-semibold text-foreground transition-all duration-200"
          style={{ letterSpacing: '-0.01em' }}
        >
          Wisebox
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {marketingNavLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground"
          >
            Sign In
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 rounded-lg"
          >
            <Link href="/register">Get Started</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-all duration-200 hover:text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" strokeWidth={1.5} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border px-6 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {marketingNavLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Button
              asChild
              size="sm"
              className="w-full bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 rounded-lg"
            >
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
