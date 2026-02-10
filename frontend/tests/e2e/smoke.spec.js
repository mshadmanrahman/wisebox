const { test, expect } = require('@playwright/test');

test.describe('Wisebox smoke', () => {
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
});
