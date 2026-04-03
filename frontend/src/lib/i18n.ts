import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import api from '@/lib/api';

const NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'properties',
  'tickets',
  'orders',
  'settings',
  'notifications',
  'consultant',
  'admin',
  'forms',
] as const;

export type I18nNamespace = (typeof NAMESPACES)[number];

// Custom backend that fetches translations from the API
// instead of static JSON files. This enables the admin panel
// to manage translations at runtime via the database.
const ApiBackend = {
  type: 'backend' as const,
  init() {},
  read(language: string, namespace: string, callback: (err: unknown, data: Record<string, string> | null) => void) {
    const loadStatic = () =>
      fetch(`/locales/${language}/${namespace}.json`)
        .then((res) => {
          if (!res.ok) throw new Error(`Static file not found: ${language}/${namespace}`);
          return res.json();
        })
        .then((data) => callback(null, data))
        .catch((staticErr) => {
          console.warn(`Failed to load ${language}/${namespace} translations from both API and static files`);
          callback(staticErr, null);
        });

    api
      .get('/translations', { params: { locale: language, ns: namespace } })
      .then((res) => {
        const data = res.data;
        // If API returns empty/null/non-object, fall back to static files
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
          loadStatic();
        } else {
          callback(null, data);
        }
      })
      .catch(() => loadStatic());
  },
};

i18n
  .use(ApiBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'bn'],
    defaultNS: 'common',
    ns: [...NAMESPACES],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
