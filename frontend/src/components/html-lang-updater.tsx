'use client';

import { useEffect } from 'react';
import { useI18nStore } from '@/stores/i18n';

export function HtmlLangUpdater() {
  const language = useI18nStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr'; // Both EN and BN are LTR
  }, [language]);

  return null;
}
