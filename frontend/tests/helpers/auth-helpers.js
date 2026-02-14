/**
 * Auth Helpers for E2E Testing
 *
 * Provides reusable authentication fixtures with automatic cleanup.
 * Uses hybrid approach: real backend API + mocked external services.
 */

const { test as base } = require('@playwright/test');

const AUTH_TOKEN = 'e2e-auth-token';

/**
 * Base E2E user fixtures
 */
const E2E_USERS = {
  customer: {
    id: 999,
    name: 'E2E Customer',
    email: 'e2e-customer@wisebox.test',
    phone: null,
    country_of_residence: 'USA',
    avatar_url: null,
    role: 'customer',
    email_verified_at: '2026-02-10T00:00:00.000000Z',
    phone_verified_at: null,
    status: 'active',
    last_login_at: null,
    created_at: '2026-02-10T00:00:00.000000Z',
    updated_at: '2026-02-10T00:00:00.000000Z',
  },
  customerWithProfile: {
    id: 999,
    name: 'E2E Customer',
    email: 'e2e-customer@wisebox.test',
    phone: null,
    country_of_residence: 'USA',
    avatar_url: null,
    role: 'customer',
    email_verified_at: '2026-02-10T00:00:00.000000Z',
    phone_verified_at: null,
    status: 'active',
    last_login_at: null,
    created_at: '2026-02-10T00:00:00.000000Z',
    updated_at: '2026-02-10T00:00:00.000000Z',
    profile: {
      preferred_language: 'en',
      timezone: 'UTC',
      notification_preferences: {
        order_updates: true,
        ticket_updates: true,
        consultant_updates: true,
        marketing_updates: false,
      },
    },
  },
  consultant: {
    id: 1200,
    name: 'E2E Consultant',
    email: 'e2e-consultant@wisebox.test',
    phone: null,
    country_of_residence: 'USA',
    avatar_url: null,
    role: 'consultant',
    email_verified_at: '2026-02-10T00:00:00.000000Z',
    phone_verified_at: null,
    status: 'active',
    last_login_at: null,
    created_at: '2026-02-10T00:00:00.000000Z',
    updated_at: '2026-02-10T00:00:00.000000Z',
  },
};

/**
 * Apply authenticated session by setting cookies and localStorage
 *
 * @param {Page} page - Playwright page instance
 * @param {Object} user - User object to authenticate
 */
async function applyAuthSession(page, user = E2E_USERS.customer) {
  await page.context().addCookies([
    {
      name: 'wisebox_token',
      value: AUTH_TOKEN,
      domain: '127.0.0.1',
      path: '/',
      sameSite: 'Lax',
    },
  ]);

  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('wisebox_token', token);
    localStorage.setItem(
      'wisebox-auth',
      JSON.stringify({
        state: { token, user, isAuthenticated: true },
        version: 0,
      })
    );
  }, { token: AUTH_TOKEN, user });
}

/**
 * Clear authentication state
 *
 * @param {Page} page - Playwright page instance
 */
async function clearAuthSession(page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.removeItem('wisebox_token');
    localStorage.removeItem('wisebox-auth');
  });
}

/**
 * Extended test with authenticatedCustomer fixture
 *
 * Usage:
 * test('my test', async ({ authenticatedCustomer }) => {
 *   const { page, user } = authenticatedCustomer;
 *   // Test with authenticated customer
 * });
 */
const test = base.extend({
  authenticatedCustomer: async ({ page }, use) => {
    await applyAuthSession(page, E2E_USERS.customer);
    await use({ page, user: E2E_USERS.customer });
    await clearAuthSession(page);
  },

  authenticatedCustomerWithProfile: async ({ page }, use) => {
    await applyAuthSession(page, E2E_USERS.customerWithProfile);
    await use({ page, user: E2E_USERS.customerWithProfile });
    await clearAuthSession(page);
  },

  authenticatedConsultant: async ({ page }, use) => {
    await applyAuthSession(page, E2E_USERS.consultant);
    await use({ page, user: E2E_USERS.consultant });
    await clearAuthSession(page);
  },
});

module.exports = {
  test,
  E2E_USERS,
  AUTH_TOKEN,
  applyAuthSession,
  clearAuthSession,
};
