/**
 * i18n Mocks for E2E Testing
 *
 * Provides translation API mocking with EN/BN fixture data.
 * Used by i18n E2E tests to simulate backend translation responses.
 */

/** Sample EN translations per namespace */
const EN_TRANSLATIONS = {
  common: {
    'nav.dashboard': 'Dashboard',
    'nav.properties': 'Properties',
    'nav.tickets': 'Tickets',
    'nav.orders': 'Orders',
    'nav.settings': 'Settings',
    'loading': 'Loading...',
    'retry': 'Retry',
    'error.generic': 'Something went wrong',
    'copyright': '2026 Wisebox. All rights reserved.',
  },
  dashboard: {
    'greeting': 'Welcome back',
    'heroBanner.label': 'Wisebox Dashboard',
    'heroBanner.defaultTitle': 'Manage Your Properties',
    'addNewProperty': 'Add New Property',
    'getFreeAssessment': 'Get Free Assessment',
  },
  auth: {
    'login.title': 'Welcome back',
    'login.subtitle': 'Sign in to your account',
    'login.submit': 'Sign In',
    'login.noAccount': "Don't have an account?",
    'login.register': 'Sign up',
  },
  settings: {
    'tabs.profile': 'Profile',
    'tabs.security': 'Security',
    'tabs.preferences': 'Preferences',
    'language.label': 'Language',
    'language.description': 'Choose your preferred language',
  },
};

/** Sample BN translations per namespace */
const BN_TRANSLATIONS = {
  common: {
    'nav.dashboard': '\u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1',
    'nav.properties': '\u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF',
    'nav.tickets': '\u099F\u09BF\u0995\u09C7\u099F',
    'nav.orders': '\u0985\u09B0\u09CD\u09A1\u09BE\u09B0',
    'nav.settings': '\u09B8\u09C7\u099F\u09BF\u0982\u09B8',
    'loading': '\u09B2\u09CB\u09A1 \u09B9\u099A\u09CD\u099B\u09C7...',
    'retry': '\u09AA\u09C1\u09A8\u09B0\u09BE\u09AF\u09BC \u099A\u09C7\u09B7\u09CD\u099F\u09BE',
    'error.generic': '\u0995\u09BF\u099B\u09C1 \u09AD\u09C1\u09B2 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7',
    'copyright': '\u09E8\u09E6\u09E8\u09EC \u09A4\u09CD\u09AF\u09BE\u09B8\u09AC\u0995\u09CD\u09B8\u0964 \u09B8\u09B0\u09CD\u09AC\u09B8\u09CD\u09AC \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4\u0964',
  },
  dashboard: {
    'greeting': '\u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE',
    'heroBanner.label': '\u0993\u09AF\u09BC\u09BE\u0987\u09B8\u09AC\u0995\u09CD\u09B8 \u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1',
    'heroBanner.defaultTitle': '\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C1\u09A8',
    'addNewProperty': '\u09A8\u09A4\u09C1\u09A8 \u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8',
    'getFreeAssessment': '\u09AC\u09BF\u09A8\u09BE\u09AE\u09C2\u09B2\u09CD\u09AF\u09C7 \u09AE\u09C2\u09B2\u09CD\u09AF\u09BE\u09AF\u09BC\u09A8 \u09AA\u09BE\u09A8',
  },
  auth: {
    'login.title': '\u0986\u09AC\u09BE\u09B0 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE',
    'login.subtitle': '\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09C7 \u09B8\u09BE\u0987\u09A8 \u0987\u09A8 \u0995\u09B0\u09C1\u09A8',
    'login.submit': '\u09B8\u09BE\u0987\u09A8 \u0987\u09A8',
    'login.noAccount': '\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A8\u09C7\u0987?',
    'login.register': '\u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09BE\u09B0',
  },
  settings: {
    'tabs.profile': '\u09AA\u09CD\u09B0\u09CB\u09AB\u09BE\u0987\u09B2',
    'tabs.security': '\u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE',
    'tabs.preferences': '\u09AA\u099B\u09A8\u09CD\u09A6',
    'language.label': '\u09AD\u09BE\u09B7\u09BE',
    'language.description': '\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0 \u09AD\u09BE\u09B7\u09BE \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8',
  },
};

/** Admin translations list (used by admin panel tests) */
const ADMIN_TRANSLATIONS_LIST = [
  {
    key: 'nav.dashboard',
    namespace: 'common',
    en: { id: 1, value: 'Dashboard', updated_at: '2026-02-10T00:00:00.000000Z' },
    bn: { id: 2, value: '\u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1', updated_at: '2026-02-10T00:00:00.000000Z' },
  },
  {
    key: 'nav.properties',
    namespace: 'common',
    en: { id: 3, value: 'Properties', updated_at: '2026-02-10T00:00:00.000000Z' },
    bn: { id: 4, value: '\u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF', updated_at: '2026-02-10T00:00:00.000000Z' },
  },
  {
    key: 'loading',
    namespace: 'common',
    en: { id: 5, value: 'Loading...', updated_at: '2026-02-10T00:00:00.000000Z' },
    bn: { id: 6, value: '\u09B2\u09CB\u09A1 \u09B9\u099A\u09CD\u099B\u09C7...', updated_at: '2026-02-10T00:00:00.000000Z' },
  },
  {
    key: 'login.title',
    namespace: 'auth',
    en: { id: 7, value: 'Welcome back', updated_at: '2026-02-10T00:00:00.000000Z' },
    bn: { id: 8, value: '\u0986\u09AC\u09BE\u09B0 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE', updated_at: '2026-02-10T00:00:00.000000Z' },
  },
  {
    key: 'login.submit',
    namespace: 'auth',
    en: { id: 9, value: 'Sign In', updated_at: '2026-02-10T00:00:00.000000Z' },
    bn: { id: 10, value: '\u09B8\u09BE\u0987\u09A8 \u0987\u09A8', updated_at: '2026-02-10T00:00:00.000000Z' },
  },
];

/**
 * Mock translation API endpoints for the public translations endpoint.
 *
 * @param {Page} page - Playwright page instance
 * @param {Object} options - { locale?: string } restrict to a single locale, or serve both
 */
async function mockTranslationEndpoints(page, options = {}) {
  const { failForLocale } = options;

  await page.route('**/api/v1/translations?*', async (route) => {
    const url = new URL(route.request().url());
    const locale = url.searchParams.get('locale');
    const ns = url.searchParams.get('ns');

    if (failForLocale && locale === failForLocale) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Translation service unavailable' }),
      });
      return;
    }

    const translations = locale === 'bn'
      ? (BN_TRANSLATIONS[ns] || {})
      : (EN_TRANSLATIONS[ns] || {});

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(translations),
    });
  });
}

/**
 * Mock the admin translations listing endpoint.
 *
 * @param {Page} page - Playwright page instance
 * @param {Array} items - Translation rows to return
 */
async function mockAdminTranslationsEndpoint(page, items = ADMIN_TRANSLATIONS_LIST) {
  await page.route('**/api/v1/admin/translations?*', async (route) => {
    const url = new URL(route.request().url());
    const ns = url.searchParams.get('ns');
    const search = (url.searchParams.get('search') || '').toLowerCase();

    let filtered = [...items];
    if (ns) {
      filtered = filtered.filter((item) => item.namespace === ns);
    }
    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.key.toLowerCase().includes(search) ||
          item.en.value.toLowerCase().includes(search)
      );
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: filtered,
        current_page: 1,
        last_page: 1,
        total: filtered.length,
        per_page: 50,
      }),
    });
  });

  // Mock the PUT update endpoint
  await page.route(/.*\/api\/v1\/admin\/translations\/\d+$/, async (route) => {
    if (route.request().method() !== 'PUT') {
      await route.continue();
      return;
    }

    const payload = route.request().postDataJSON();
    const id = Number(route.request().url().split('/').pop());

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id,
          value: payload.value,
          updated_at: new Date().toISOString(),
        },
      }),
    });
  });
}

/**
 * Set the i18n language in localStorage before page navigation.
 *
 * @param {Page} page - Playwright page instance
 * @param {string} lang - Language code ('en' or 'bn')
 */
async function setI18nLanguage(page, lang) {
  await page.addInitScript((language) => {
    localStorage.setItem(
      'wisebox-i18n',
      JSON.stringify({
        state: { language },
        version: 0,
      })
    );
  }, lang);
}

module.exports = {
  EN_TRANSLATIONS,
  BN_TRANSLATIONS,
  ADMIN_TRANSLATIONS_LIST,
  mockTranslationEndpoints,
  mockAdminTranslationsEndpoint,
  setI18nLanguage,
};
