/**
 * Admin Translation Management E2E Tests
 *
 * Verifies the admin translation panel at /admin/translations:
 * - Table renders with EN and BN columns
 * - Namespace filtering works
 * - Search filtering works
 * - Inline editing saves changes
 */

const { expect } = require('@playwright/test');
const { test, E2E_USERS } = require('../../helpers/auth-helpers');
const { mockNotificationEndpoints } = require('../../helpers/api-mocks');
const {
  mockTranslationEndpoints,
  mockAdminTranslationsEndpoint,
  ADMIN_TRANSLATIONS_LIST,
} = require('../../helpers/i18n-mocks');

// Admin user fixture (reuses auth helpers but with admin role)
const ADMIN_USER = {
  ...E2E_USERS.customer,
  id: 1,
  name: 'E2E Admin',
  email: 'admin@wisebox.test',
  role: 'admin',
};

test.describe('Admin translation management', () => {
  test.beforeEach(async ({ page }) => {
    await mockTranslationEndpoints(page);
  });

  test('admin translations page loads with table', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockAdminTranslationsEndpoint(page);

    await page.goto('/admin/translations');

    // Page header
    await expect(page.getByRole('heading', { name: /Translations/i })).toBeVisible();

    // Table headers
    await expect(page.getByText('Key')).toBeVisible();
    await expect(page.getByText('English')).toBeVisible();
    await expect(page.getByText('Bangla')).toBeVisible();
    await expect(page.getByText('Last Updated')).toBeVisible();

    // Translation rows
    await expect(page.getByText('nav.dashboard')).toBeVisible();
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('namespace filter narrows results', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockAdminTranslationsEndpoint(page);

    await page.goto('/admin/translations');

    // Initially all namespaces are shown
    await expect(page.getByText('nav.dashboard')).toBeVisible();
    await expect(page.getByText('login.title')).toBeVisible();

    // Open the namespace select and filter to 'auth'
    const namespaceSelect = page.locator('button[role="combobox"]').first();
    await namespaceSelect.click();
    await page.getByRole('option', { name: 'auth' }).click();

    // Wait for filtered results
    await page.waitForTimeout(300);

    // Auth keys should remain visible
    await expect(page.getByText('login.title')).toBeVisible();

    // Common keys should be gone (or the mock will filter them)
    // The nav.dashboard key belongs to 'common' namespace
    await expect(page.getByText('nav.dashboard')).not.toBeVisible();
  });

  test('search box filters by key', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockAdminTranslationsEndpoint(page);

    await page.goto('/admin/translations');

    // Type in search box
    const searchInput = page.getByPlaceholder(/Search by key or value/i);
    await searchInput.fill('login');

    // Wait for debounced search
    await page.waitForTimeout(500);

    // login.title and login.submit should appear
    await expect(page.getByText('login.title')).toBeVisible();

    // Non-matching keys should not appear
    await expect(page.getByText('nav.dashboard')).not.toBeVisible();
  });

  test('inline edit saves translation on Enter', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockAdminTranslationsEndpoint(page);

    await page.goto('/admin/translations');

    // Find the 'Dashboard' EN value and click to edit
    const dashboardCell = page.getByText('Dashboard').first();
    await dashboardCell.click();

    // An input should appear
    const editInput = page.locator('input[type="text"]').last();
    await expect(editInput).toBeVisible();

    // Clear and type new value
    await editInput.fill('Dashboard (Updated)');

    // Press Enter to save
    await editInput.press('Enter');

    // The new value should be reflected (optimistic update)
    await expect(page.getByText('Dashboard (Updated)')).toBeVisible();
  });

  test('inline edit cancels on Escape', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockAdminTranslationsEndpoint(page);

    await page.goto('/admin/translations');

    // Click to edit 'Dashboard'
    const dashboardCell = page.getByText('Dashboard').first();
    await dashboardCell.click();

    const editInput = page.locator('input[type="text"]').last();
    await editInput.fill('Something else');

    // Press Escape to cancel
    await editInput.press('Escape');

    // Original value should remain
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Something else')).not.toBeVisible();
  });

  test('total key count is displayed', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockAdminTranslationsEndpoint(page);

    await page.goto('/admin/translations');

    // Should show the count
    await expect(page.getByText(`${ADMIN_TRANSLATIONS_LIST.length} keys`)).toBeVisible();
  });

  test('namespace badges are visible on each row', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockAdminTranslationsEndpoint(page);

    await page.goto('/admin/translations');

    // Each row should have a namespace badge
    const commonBadges = page.locator('text=common').all();
    const authBadges = page.locator('text=auth').all();

    // There should be at least one 'common' and one 'auth' badge
    expect((await commonBadges).length).toBeGreaterThan(0);
    expect((await authBadges).length).toBeGreaterThan(0);
  });
});
