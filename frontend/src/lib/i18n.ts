import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Bundle English translations inline to prevent FOUC (WB-218).
// Bengali loads async via fetch on language switch.
import enCommon from '../../public/locales/en/common.json';
import enAuth from '../../public/locales/en/auth.json';
import enDashboard from '../../public/locales/en/dashboard.json';
import enProperties from '../../public/locales/en/properties.json';
import enTickets from '../../public/locales/en/tickets.json';
import enOrders from '../../public/locales/en/orders.json';
import enSettings from '../../public/locales/en/settings.json';
import enNotifications from '../../public/locales/en/notifications.json';
import enConsultant from '../../public/locales/en/consultant.json';
import enAdmin from '../../public/locales/en/admin.json';
import enForms from '../../public/locales/en/forms.json';

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

// Async backend for non-bundled languages (Bengali)
const StaticBackend = {
  type: 'backend' as const,
  init() {},
  read(language: string, namespace: string, callback: (err: unknown, data: Record<string, string> | null) => void) {
    // English is bundled inline, skip fetch
    if (language === 'en') {
      callback(null, null);
      return;
    }

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
    partialBundledLanguages: true,
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        dashboard: enDashboard,
        properties: enProperties,
        tickets: enTickets,
        orders: enOrders,
        settings: enSettings,
        notifications: enNotifications,
        consultant: enConsultant,
        admin: enAdmin,
        forms: enForms,
      },
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
