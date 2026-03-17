'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { I18nProvider } from '@/components/providers/i18n-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </I18nProvider>
  );
}
