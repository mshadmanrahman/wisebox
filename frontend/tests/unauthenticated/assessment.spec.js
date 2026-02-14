/**
 * Free Assessment Flow E2E Tests (Unauthenticated)
 *
 * Tests for the free property assessment tool.
 * Users can submit property info and get instant assessment.
 */

const { test, expect } = require('@playwright/test');

test.describe('Free assessment flow (unauthenticated)', () => {
  test('assessment page loads and displays form', async ({ page }) => {
    const response = await page.goto('/assessment/start');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/assessment\/start/);
    await expect(page.getByText('Free Property Assessment')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
  });

  test('assessment form validates required fields', async ({ page }) => {
    await page.goto('/assessment/start');

    // Try submitting empty form
    await page.getByRole('button', { name: /Submit|Get Assessment/i }).click();

    // Should show validation errors
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test('assessment form accepts valid input and shows results', async ({ page }) => {
    await page.goto('/assessment/start');

    // Mock assessment API response
    await page.route('**/api/v1/assessments/free', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            overall_score: 75,
            score_status: 'yellow',
            document_score: 40,
            ownership_score: 35,
            risk_factors: ['missing_title_deed'],
            recommendations: [
              'Upload title deed for verification',
              'Consider legal consultation',
            ],
            summary: 'Your property has moderate documentation coverage.',
          },
        }),
      });
    });

    // Fill out the form
    await page.getByLabel(/Property Name/i).fill('Family Home');
    await page.getByLabel(/Country/i).click();
    await page.getByRole('option', { name: 'Bangladesh' }).click();
    await page.getByLabel(/Property Type/i).click();
    await page.getByRole('option', { name: 'Residential' }).click();
    await page.getByLabel(/Ownership Status/i).click();
    await page.getByRole('option', { name: 'Purchased' }).click();

    // Submit form
    await page.getByRole('button', { name: /Submit|Get Assessment/i }).click();

    // Wait for results
    await expect(page.getByText('Assessment Results')).toBeVisible();
    await expect(page.getByText('75')).toBeVisible(); // Score
    await expect(page.getByText('moderate documentation coverage')).toBeVisible();
    await expect(page.getByText('Upload title deed')).toBeVisible();
  });

  test('assessment results show CTA to create account', async ({ page }) => {
    await page.goto('/assessment/start');

    // Mock assessment API response
    await page.route('**/api/v1/assessments/free', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            overall_score: 85,
            score_status: 'green',
            document_score: 45,
            ownership_score: 40,
            risk_factors: [],
            recommendations: ['Continue maintaining documentation'],
            summary: 'Your property is well documented.',
          },
        }),
      });
    });

    // Fill and submit form
    await page.getByLabel(/Property Name/i).fill('Test Property');
    await page.getByLabel(/Country/i).click();
    await page.getByRole('option', { name: 'Bangladesh' }).click();
    await page.getByLabel(/Property Type/i).click();
    await page.getByRole('option', { name: 'Residential' }).click();
    await page.getByLabel(/Ownership Status/i).click();
    await page.getByRole('option', { name: 'Purchased' }).click();
    await page.getByRole('button', { name: /Submit|Get Assessment/i }).click();

    // Check for CTA
    await expect(page.getByRole('link', { name: /Create Account|Sign Up|Register/i })).toBeVisible();
  });

  test('assessment form handles API errors gracefully', async ({ page }) => {
    await page.goto('/assessment/start');

    // Mock API error
    await page.route('**/api/v1/assessments/free', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Assessment service temporarily unavailable',
        }),
      });
    });

    // Fill and submit form
    await page.getByLabel(/Property Name/i).fill('Test Property');
    await page.getByLabel(/Country/i).click();
    await page.getByRole('option', { name: 'Bangladesh' }).click();
    await page.getByLabel(/Property Type/i).click();
    await page.getByRole('option', { name: 'Residential' }).click();
    await page.getByLabel(/Ownership Status/i).click();
    await page.getByRole('option', { name: 'Purchased' }).click();
    await page.getByRole('button', { name: /Submit|Get Assessment/i }).click();

    // Should show error message
    await expect(page.getByText(/temporarily unavailable|error/i)).toBeVisible();
  });
});
