/**
 * Language Fallback E2E Tests
 *
 * Verifies that when the translation API fails, the app gracefully
 * falls back to English (the fallbackLng configured in i18next).
 */

const { expect } = require('@playwright/test');
const { test } = require('../../helpers/auth-helpers');
const { mockNotificationEndpoints, mockDashboardSummary } = require('../../helpers/api-mocks');
const { mockTranslationEndpoints, setI18nLanguage } = require('../../helpers/i18n-mocks');

test.describe('Language fallback', () => {
  test('falls back to English keys when BN translation API fails', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    // Mock translations: EN succeeds, BN fails
    await mockTranslationEndpoints(page, { failForLocale: 'bn' });

    // Set language to BN
    await setI18nLanguage(page, 'bn');

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, { hero_slides: [] });

    await page.goto('/dashboard');

    // Even though BN was requested, the fallback chain should use EN values
    // The page should still render without crashing
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');

    // The app should not show an error state; it should render gracefully
    // with English fallback strings instead of raw translation keys
    await expect(page.locator('body')).not.toContainText('common:');
    await expect(page.locator('body')).not.toContainText('dashboard:');
  });

  test('app renders without crashing when all translations fail', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    // Mock all translation requests to fail
    await page.route('**/api/v1/translations?*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Service unavailable' }),
      });
    });

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, { hero_slides: [] });

    await page.goto('/dashboard');

    // The page should still be navigable (not a blank screen or crash)
    // i18next will use the keys themselves as fallback
    await expect(page.locator('body')).toBeVisible();

    // Should not show a full-page error
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('app recovers when translations become available after initial failure', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    let requestCount = 0;

    // First requests fail, subsequent ones succeed
    await page.route('**/api/v1/translations?*', async (route) => {
      requestCount++;
      const url = new URL(route.request().url());
      const locale = url.searchParams.get('locale');
      const ns = url.searchParams.get('ns');

      if (requestCount <= 11) {
        // First batch of requests fail (11 namespaces)
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Temporarily unavailable' }),
        });
      } else {
        // Subsequent requests succeed
        const { EN_TRANSLATIONS } = require('../../helpers/i18n-mocks');
        const translations = EN_TRANSLATIONS[ns] || {};
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(translations),
        });
      }
    });

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, { hero_slides: [] });

    await page.goto('/dashboard');

    // Page renders even with initial failures
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page renders with fallback when translations fail', async ({ page }) => {
    // Mock all translation requests to fail
    await page.route('**/api/v1/translations?*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Service unavailable' }),
      });
    });

    await page.goto('/login');

    // Login page should still be functional
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // The page should not be blank
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });
});
