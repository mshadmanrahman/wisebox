'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { WiseboxLogo } from '@/components/ui/wisebox-logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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
    <>
      {/* Header bar — always on top */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[60] h-16 transition-all duration-500',
          mobileOpen
            ? 'bg-background'
            : scrolled
              ? 'bg-background border-b border-border shadow-sm'
              : 'bg-transparent border-b border-transparent',
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
            <WiseboxLogo variant="auto" size="sm" className="transition-all duration-200 hover:opacity-80" />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-8 md:flex">
            {marketingNavLinks.map((item) => (
              <a
                key={item.href + item.label}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden items-center gap-4 md:flex">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile right: CTA pill + hamburger/close */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/register"
              className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm"
            >
              Get Started
            </Link>
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 text-foreground transition-colors duration-200"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {/* Animated hamburger → X */}
              <div className="relative w-5 h-4 flex flex-col justify-center">
                <span className={cn('absolute left-0 w-5 h-[1.5px] bg-current transition-all duration-300', mobileOpen ? 'rotate-45 top-[7px]' : 'rotate-0 top-[2px]')} />
                <span className={cn('absolute left-0 w-5 h-[1.5px] bg-current transition-all duration-300', mobileOpen ? '-rotate-45 top-[7px]' : 'rotate-0 top-[12px]')} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Mobile full-screen overlay — behind the header bar */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-background transition-all duration-500 md:hidden',
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
      >
        {/* Spacer for header */}
        <div className="h-16 shrink-0" />

        {/* Centered nav items */}
        <nav className="flex-1 flex flex-col items-center justify-center gap-6 px-6 -mt-16">
          {marketingNavLinks.map((item, i) => (
            <a
              key={item.href + item.label}
              href={item.href}
              onClick={(e) => handleAnchorClick(e, item.href)}
              className={cn(
                'heading-display text-3xl font-bold text-foreground transition-all duration-500',
                mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
              )}
              style={{ transitionDelay: mobileOpen ? `${150 + i * 75}ms` : '0ms' }}
            >
              {item.label}
            </a>
          ))}

          {/* Sign In */}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'heading-display text-3xl font-bold text-foreground transition-all duration-500',
              mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            )}
            style={{ transitionDelay: mobileOpen ? `${150 + marketingNavLinks.length * 75}ms` : '0ms' }}
          >
            Sign In
          </Link>
        </nav>

        {/* Bottom: CTA button + theme toggle */}
        <div
          className={cn(
            'shrink-0 px-6 pb-10 flex flex-col items-center gap-5 transition-all duration-500',
            mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          )}
          style={{ transitionDelay: mobileOpen ? '500ms' : '0ms' }}
        >
          <Link
            href="/register"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center gap-2 w-full max-w-xs rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/90"
          >
            Sign up for free <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
