'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { WiseboxLogo } from '@/components/ui/wisebox-logo';
import { marketingNavLinks } from '@/components/marketing/content';
import { cn } from '@/lib/utils';

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setMobileOpen(false);
    }
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="shrink-0">
          <WiseboxLogo variant="auto" size="sm" className="transition-all duration-200 hover:opacity-80" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {marketingNavLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleAnchorClick(e, item.href)}
              className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground"
          >
            Sign In
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 rounded-full"
          >
            <Link href="/assessment/start">Get Free Assessment</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-all duration-200 hover:text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {marketingNavLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground"
                onClick={(e) => handleAnchorClick(e, item.href)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">Toggle theme</span>
            </div>
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
              <Link href="/assessment/start" onClick={() => setMobileOpen(false)}>
                Get Free Assessment
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
