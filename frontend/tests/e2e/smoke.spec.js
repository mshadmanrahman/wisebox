const { test, expect } = require('@playwright/test');

test.describe('Wisebox smoke', () => {
  test('marketing home page is reachable', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('Manage Your Ancestral Properties From Anywhere in the World')).toBeVisible();
  });

  test('about page is reachable', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole('heading', { name: 'About Wisebox' })).toBeVisible();
  });

  test('faq page is reachable', async ({ page }) => {
    const response = await page.goto('/faq');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/faq/);
    await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible();
  });

  test('contact page is reachable', async ({ page }) => {
    const response = await page.goto('/contact');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole('heading', { name: 'Contact Wisebox' })).toBeVisible();
  });

  test('login page is reachable', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('input[type="email"]')).toHaveCount(1);
  });

  test('register page is reachable', async ({ page }) => {
    const response = await page.goto('/register');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/register/);
  });

  test('forgot password page is reachable', async ({ page }) => {
    const response = await page.goto('/forgot-password');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(page.locator('input[type="email"]')).toHaveCount(1);
  });

  test('free assessment page is reachable', async ({ page }) => {
    const response = await page.goto('/assessment');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/assessment/);
    await expect(page.getByText('Free Property Assessment')).toHaveCount(1);
  });
});
