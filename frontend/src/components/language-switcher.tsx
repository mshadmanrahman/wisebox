'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18nStore } from '@/stores/i18n';
import api from '@/lib/api';

const LANGUAGES = [
  { code: 'en' as const, label: 'EN', fullLabel: 'English' },
  { code: 'bn' as const, label: 'বাং', fullLabel: 'বাংলা' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18nStore();

  const handleLanguageChange = async (lang: 'en' | 'bn') => {
    setLanguage(lang);
    try {
      await api.put('/auth/me', { preferred_language: lang });
    } catch {
      // Language is already updated locally; backend sync is best-effort
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-wisebox-text-primary hover:bg-wisebox-background-lighter gap-1 w-auto px-2"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium">{currentLang.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 bg-wisebox-background-card border-wisebox-border"
      >
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer ${
              language === lang.code
                ? 'text-wisebox-primary'
                : 'text-wisebox-text-primary'
            } hover:bg-wisebox-background-lighter`}
          >
            <span className="font-medium">{lang.label}</span>
            <span className="ml-2 text-wisebox-text-secondary text-xs">
              {lang.fullLabel}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
