import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/lib/i18n';

type Language = 'en' | 'bn';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  syncFromProfile: (preferredLanguage: Language | undefined | null) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: 'en',

      setLanguage: (lang: Language) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },

      syncFromProfile: (preferredLanguage: Language | undefined | null) => {
        const lang = preferredLanguage ?? 'en';
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
    }),
    {
      name: 'wisebox-i18n',
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        // Sync i18n instance with persisted language on hydration
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    }
  )
);
