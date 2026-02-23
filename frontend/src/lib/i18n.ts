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
    api
      .get('/translations', { params: { locale: language, ns: namespace } })
      .then((res) => callback(null, res.data))
      .catch((err) => {
        console.warn(`Failed to load ${language}/${namespace} translations, using fallback`);
        callback(err, null);
      });
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
