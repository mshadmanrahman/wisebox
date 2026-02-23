'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function MarketingFooter() {
  const { t } = useTranslation('common');

  return (
    <footer className="border-t border-wisebox-border bg-wisebox-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 text-sm sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold text-wisebox-primary-700">Wisebox</p>
          <p className="max-w-2xl text-wisebox-text-secondary">
            {t('marketing.tagline')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-wisebox-text-secondary">
          <Link href="/about" className="hover:text-wisebox-primary-700">
            {t('marketing.about')}
          </Link>
          <Link href="/faq" className="hover:text-wisebox-primary-700">
            {t('marketing.faq')}
          </Link>
          <Link href="/contact" className="hover:text-wisebox-primary-700">
            {t('marketing.contact')}
          </Link>
          <Link href="/assessment/start" className="hover:text-wisebox-primary-700">
            {t('marketing.freeAssessment')}
          </Link>
        </div>

        <p className="text-xs text-wisebox-text-secondary">
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
}
