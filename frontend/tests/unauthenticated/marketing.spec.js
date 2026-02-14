/**
 * Marketing Pages E2E Tests (Unauthenticated)
 *
 * Tests for public-facing marketing pages.
 * Covers: home, about, FAQ, contact, services.
 */

const { test, expect } = require('@playwright/test');

test.describe('Marketing pages (unauthenticated)', () => {
  test('home page loads and displays hero content', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('Manage Your Ancestral Properties From Anywhere in the World')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
  });

  test('home page CTA redirects to registration', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Get Started' }).first().click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('about page displays company information', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole('heading', { name: 'About Wisebox' })).toBeVisible();
    await expect(page.getByText(/property management platform/i)).toBeVisible();
  });

  test('FAQ page displays frequently asked questions', async ({ page }) => {
    const response = await page.goto('/faq');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/faq/);
    await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible();

    // Check for accordion/expandable sections
    const questions = page.locator('[role="button"]').filter({ hasText: /What is|How do|Can I/i });
    await expect(questions.first()).toBeVisible();
  });

  test('contact page displays contact form', async ({ page }) => {
    const response = await page.goto('/contact');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole('heading', { name: 'Contact Wisebox' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('services page lists available services', async ({ page }) => {
    const response = await page.goto('/services');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/services/);
    await expect(page.getByRole('heading', { name: 'Wisebox Services' })).toBeVisible();
    await expect(page.getByText(/property verification|document review|legal support/i)).toBeVisible();
  });

  test('services workspace CTA redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/services');
    await page.getByRole('link', { name: 'Open Services Workspace' }).click();
    await expect(page).toHaveURL(/\/login\?redirect=%2Fworkspace%2Fservices/);
  });

  test('footer links are accessible from all pages', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check key footer links
    await expect(footer.getByRole('link', { name: /About/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Contact/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Privacy/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Terms/i })).toBeVisible();
  });
});
