/**
 * Authentication Flow E2E Tests (Unauthenticated)
 *
 * Tests for login, registration, password reset, and OTP flows.
 * Uses OTP bypass (test code 000000) for E2E testing.
 */

const { test, expect } = require('@playwright/test');
const { mockOTPVerification } = require('../helpers/api-mocks');
const { E2E_USERS, AUTH_TOKEN } = require('../helpers/auth-helpers');

test.describe('Authentication flows (unauthenticated)', () => {
  test('login page is accessible', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      const payload = route.request().postDataJSON();
      if (payload.email === E2E_USERS.customer.email && payload.password === 'Password123!') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              user: E2E_USERS.customer,
              token: AUTH_TOKEN,
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Invalid credentials',
          }),
        });
      }
    });

    await page.route('**/api/v1/dashboard/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            hero_slides: [],
            properties_preview: [],
            tickets_preview: [],
            notifications_preview: [],
            unread_notifications_count: 0,
            counts: { properties_total: 0, tickets_total: 0, tickets_open: 0 },
          },
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(E2E_USERS.customer.email);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Invalid credentials',
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
  });

  test('register page is accessible', async ({ page }) => {
    const response = await page.goto('/register');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('registration with valid data creates account', async ({ page }) => {
    await page.route('**/api/v1/auth/register', async (route) => {
      const payload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              ...E2E_USERS.customer,
              email: payload.email,
              name: payload.name,
            },
            token: AUTH_TOKEN,
          },
          message: 'Registration successful',
        }),
      });
    });

    await page.route('**/api/v1/dashboard/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            hero_slides: [],
            properties_preview: [],
            tickets_preview: [],
            notifications_preview: [],
            unread_notifications_count: 0,
            counts: { properties_total: 0, tickets_total: 0, tickets_open: 0 },
          },
        }),
      });
    });

    await page.goto('/register');
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('newuser@wisebox.test');
    await page.getByLabel('Password', { exact: true }).fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('registration validates password strength', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('test@wisebox.test');
    await page.getByLabel('Password', { exact: true }).fill('weak');
    await page.getByLabel('Confirm Password').fill('weak');
    await page.getByRole('button', { name: 'Create account' }).click();

    // Should show password strength error
    await expect(page.getByText(/password.*strong|at least 8 characters/i)).toBeVisible();
  });

  test('forgot password page is accessible', async ({ page }) => {
    const response = await page.goto('/forgot-password');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('forgot password sends reset link', async ({ page }) => {
    await page.route('**/api/v1/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Password reset link sent to your email',
        }),
      });
    });

    await page.goto('/forgot-password');
    await page.locator('input[type="email"]').fill('user@wisebox.test');
    await page.getByRole('button', { name: /Send|Reset/i }).click();

    await expect(page.getByText(/reset link sent|check your email/i)).toBeVisible();
  });

  test('OTP verification uses bypass code in test mode', async ({ page }) => {
    await mockOTPVerification(page, { testCode: '000000', shouldBypass: true });

    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: E2E_USERS.customer,
            token: AUTH_TOKEN,
            requires_otp: true,
          },
        }),
      });
    });

    await page.route('**/api/v1/dashboard/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            hero_slides: [],
            properties_preview: [],
            tickets_preview: [],
            notifications_preview: [],
            unread_notifications_count: 0,
            counts: { properties_total: 0, tickets_total: 0, tickets_open: 0 },
          },
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(E2E_USERS.customer.email);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Should show OTP input
    await expect(page.getByText(/enter.*code|verify/i)).toBeVisible();

    // Enter test OTP code
    await page.locator('input[type="text"]').first().fill('000000');
    await page.getByRole('button', { name: /Verify|Submit/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('OTP verification rejects invalid code', async ({ page }) => {
    await mockOTPVerification(page, { testCode: '000000', shouldBypass: true });

    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: E2E_USERS.customer,
            token: AUTH_TOKEN,
            requires_otp: true,
          },
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(E2E_USERS.customer.email);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Enter wrong OTP code
    await page.locator('input[type="text"]').first().fill('123456');
    await page.getByRole('button', { name: /Verify|Submit/i }).click();

    // Should show error
    await expect(page.getByText(/Invalid OTP/i)).toBeVisible();
  });

  test('login preserves redirect parameter', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: E2E_USERS.customer,
            token: AUTH_TOKEN,
          },
        }),
      });
    });

    await page.route('**/api/v1/properties**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: {
            current_page: 1,
            total: 0,
            per_page: 15,
          },
        }),
      });
    });

    await page.goto('/login?redirect=%2Fproperties');
    await page.getByLabel('Email').fill(E2E_USERS.customer.email);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Should redirect to properties page
    await expect(page).toHaveURL(/\/properties/);
  });
});
