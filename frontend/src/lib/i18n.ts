import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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

// Static file backend — loads translations from /locales/{lang}/{ns}.json
// The API-based admin CMS backend can be re-enabled once translations are
// populated in the database. For go-live, static files are the source of truth.
const StaticBackend = {
  type: 'backend' as const,
  init() {},
  read(language: string, namespace: string, callback: (err: unknown, data: Record<string, string> | null) => void) {
    fetch(`/locales/${language}/${namespace}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Not found: /locales/${language}/${namespace}.json`);
        return res.json();
      })
      .then((data) => callback(null, data))
      .catch((err) => {
        console.warn(`Failed to load ${language}/${namespace} translations`);
        callback(err, null);
      });
  },
};

i18n
  .use(StaticBackend)
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
