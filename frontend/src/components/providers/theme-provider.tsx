'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="wisebox-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
