/**
 * Language Persistence E2E Tests
 *
 * Verifies that the selected language persists across page refreshes
 * and navigation between different routes.
 */

const { expect } = require('@playwright/test');
const { test } = require('../../helpers/auth-helpers');
const { mockNotificationEndpoints, mockDashboardSummary } = require('../../helpers/api-mocks');
const { mockTranslationEndpoints, setI18nLanguage } = require('../../helpers/i18n-mocks');

test.describe('Language persistence', () => {
  test.beforeEach(async ({ page }) => {
    await mockTranslationEndpoints(page);
  });

  test('language persists after page refresh', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    // Set language to BN before navigating
    await setI18nLanguage(page, 'bn');

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, { hero_slides: [] });

    await page.goto('/dashboard');

    // Verify BN is active
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');

    // Refresh the page
    await page.reload();

    // Language should still be BN after refresh
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  });

  test('language persists when navigating between pages', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    // Set language to BN
    await setI18nLanguage(page, 'bn');

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, { hero_slides: [] });

    // Mock properties list
    await page.route('**/api/v1/properties?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 10,
        }),
      });
    });

    // Mock tickets list
    await page.route('**/api/v1/tickets?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 10,
        }),
      });
    });

    // Start on dashboard
    await page.goto('/dashboard');
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');

    // Navigate to properties
    await page.goto('/properties');
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');

    // Navigate to tickets
    await page.goto('/tickets');
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');

    // Navigate back to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  });

  test('language is stored in localStorage', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await setI18nLanguage(page, 'bn');

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, { hero_slides: [] });

    await page.goto('/dashboard');

    // Check localStorage has the correct value
    const storedValue = await page.evaluate(() => {
      const raw = localStorage.getItem('wisebox-i18n');
      return raw ? JSON.parse(raw) : null;
    });

    expect(storedValue).toBeTruthy();
    expect(storedValue.state.language).toBe('bn');
  });

  test('English is the default when no language is stored', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    // Explicitly clear the i18n store
    await page.addInitScript(() => {
      localStorage.removeItem('wisebox-i18n');
    });

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, { hero_slides: [] });

    await page.goto('/dashboard');

    // Default should be English
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('language syncs from user profile on login', async ({ authenticatedCustomerWithProfile }) => {
    const { page, user } = authenticatedCustomerWithProfile;

    // The customerWithProfile fixture has preferred_language: 'en' in profile
    // Mock the auth/me endpoint to return a profile with BN preference
    await page.route('**/api/v1/auth/me', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              ...user,
              profile: {
                ...user.profile,
                preferred_language: 'bn',
              },
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, { hero_slides: [] });

    await page.goto('/dashboard');

    // After the profile loads, language should sync to BN
    await page.waitForTimeout(1000);
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  });
});
