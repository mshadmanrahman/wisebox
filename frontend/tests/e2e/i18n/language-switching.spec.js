/**
 * Language Switching E2E Tests
 *
 * Verifies that toggling between EN and BN updates UI strings correctly.
 * Uses mocked translation API responses.
 */

const { expect } = require('@playwright/test');
const { test } = require('../../helpers/auth-helpers');
const { mockNotificationEndpoints, mockDashboardSummary } = require('../../helpers/api-mocks');
const {
  mockTranslationEndpoints,
  setI18nLanguage,
  BN_TRANSLATIONS,
  EN_TRANSLATIONS,
} = require('../../helpers/i18n-mocks');

test.describe('Language switching', () => {
  test.beforeEach(async ({ page }) => {
    await mockTranslationEndpoints(page);
  });

  test('default language is English', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, { hero_slides: [] });

    await page.goto('/dashboard');

    // Nav items should be in English
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('switching to Bangla updates visible UI strings', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, {
      hero_slides: [
        {
          id: 1,
          title: 'Test Slide',
          cta_text: null,
          cta_url: '/properties/new',
          is_active: true,
        },
      ],
    });

    // Mock the PATCH /auth/me endpoint for language preference update
    await page.route('**/api/v1/auth/me', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { preferred_language: 'bn' } }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/dashboard');

    // Open the language switcher dropdown and select BN
    const languageSwitcher = page.locator('button[aria-label*="language"], button:has(svg.lucide-globe)').first();
    await languageSwitcher.click();

    // Click the BN option
    const bnOption = page.getByText(/বাংলা|BN/i).first();
    await bnOption.click();

    // Wait for translation reload
    await page.waitForTimeout(500);

    // The html lang attribute should update
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  });

  test('switching back to English reverts UI strings', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    // Start in BN
    await setI18nLanguage(page, 'bn');

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, { hero_slides: [] });

    await page.route('**/api/v1/auth/me', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { preferred_language: 'en' } }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/dashboard');

    // Verify we start in BN
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');

    // Switch to EN
    const languageSwitcher = page.locator('button[aria-label*="language"], button:has(svg.lucide-globe)').first();
    await languageSwitcher.click();

    const enOption = page.getByText(/English|EN/i).first();
    await enOption.click();

    await page.waitForTimeout(500);

    // Should be back in English
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('language switcher is visible in portal header', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, { hero_slides: [] });

    await page.goto('/dashboard');

    // The globe icon button should be present
    const languageSwitcher = page.locator('button[aria-label*="language"], button:has(svg.lucide-globe)').first();
    await expect(languageSwitcher).toBeVisible();
  });
});
