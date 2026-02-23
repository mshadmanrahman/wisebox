'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { marketingNavLinks } from '@/components/marketing/content';

export function MarketingHeader() {
  const { t } = useTranslation('common');
  return (
    <header className="sticky top-0 z-40 border-b border-wisebox-border bg-wisebox-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-wisebox-primary-700">
          Wisebox
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-wisebox-text-secondary md:flex">
          {marketingNavLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-wisebox-primary-700">
              {item.label}
            </Link>
          ))}
          <Link href="/assessment/start" className="transition-colors hover:text-wisebox-primary-700">
            {t('marketing.freeAssessment')}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="hidden border-wisebox-border text-wisebox-primary-400 sm:inline-flex">
            <Link href="/login">{t('marketing.signIn')}</Link>
          </Button>
          <Button asChild className="bg-wisebox-primary-600 text-white hover:bg-wisebox-primary-700">
            <Link href="/register">{t('marketing.getStarted')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
