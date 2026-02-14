/**
 * Properties E2E Tests (Authenticated)
 *
 * Tests for property management functionality.
 * Covers: 2-step creation, edit, document management, assessment history.
 */

const { test, expect } = require('../helpers/auth-helpers');
const { mockNotificationEndpoints, mockFileUpload } = require('../helpers/api-mocks');
const { PropertyBuilder, buildPaginated } = require('../helpers/test-data');

test.describe('Properties (authenticated)', () => {
  test('properties list displays user properties', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const properties = [
      new PropertyBuilder()
        .withUserId(user.id)
        .withName('Family Home')
        .asActive()
        .build(),
      new PropertyBuilder()
        .withUserId(user.id)
        .withName('Investment Property')
        .asDraft()
        .withCompletion(50, 'red')
        .build(),
    ];

    await mockNotificationEndpoints(page, []);
    await page.route('**/api/v1/properties**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: properties,
          meta: {
            current_page: 1,
            from: 1,
            last_page: 1,
            per_page: 15,
            to: properties.length,
            total: properties.length,
          },
          links: {
            first: '/api/v1/properties?page=1',
            last: '/api/v1/properties?page=1',
            prev: null,
            next: null,
          },
        }),
      });
    });

    await page.goto('/properties');

    await expect(page.getByText('Family Home')).toBeVisible();
    await expect(page.getByText('Investment Property')).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible(); // Active property
    await expect(page.getByText('50%')).toBeVisible(); // Draft property
  });

  test('property creation - step 1 (basic info)', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);

    // Mock reference data endpoints
    await page.route('**/api/v1/reference-data/property-types', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 1, name: 'Residential', slug: 'residential' },
            { id: 2, name: 'Commercial', slug: 'commercial' },
          ],
        }),
      });
    });

    await page.route('**/api/v1/reference-data/ownership-statuses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 1, slug: 'purchased', display_label: 'Purchased' },
            { id: 2, slug: 'inherited', display_label: 'Inherited' },
          ],
        }),
      });
    });

    await page.route('**/api/v1/reference-data/ownership-types', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 1, name: 'Single', slug: 'single' },
            { id: 2, name: 'Joint', slug: 'joint' },
          ],
        }),
      });
    });

    await page.goto('/properties/new');

    // Fill Step 1: Basic Information
    await page.getByLabel('Property Name').fill('New Family Home');

    // Select property type
    await page.getByRole('button', { name: /Residential/i }).click();

    // Select ownership status
    await page.getByRole('button', { name: /Purchased/i }).click();

    // Select ownership type
    await page.getByRole('button', { name: /Single/i }).click();

    // Go to next step
    await page.getByRole('button', { name: 'Next' }).click();

    // Should be on Step 2
    await expect(page.getByText(/Location|Address/i)).toBeVisible();
  });

  test('property creation - step 2 (location) and submission', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);

    // Mock reference data
    await page.route('**/api/v1/reference-data/**', async (route) => {
      const url = route.request().url();
      if (url.includes('property-types')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: [{ id: 1, name: 'Residential' }] }),
        });
      } else if (url.includes('ownership-statuses')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: [{ id: 1, display_label: 'Purchased' }] }),
        });
      } else if (url.includes('ownership-types')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: [{ id: 1, name: 'Single' }] }),
        });
      } else if (url.includes('countries')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: [{ code: 'BGD', name: 'Bangladesh' }] }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock property creation
    await page.route('**/api/v1/properties', async (route) => {
      if (route.request().method() === 'POST') {
        const property = new PropertyBuilder()
          .withUserId(user.id)
          .withName('New Family Home')
          .asActive()
          .build();

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: property,
            message: 'Property created successfully',
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/properties/new');

    // Step 1
    await page.getByLabel('Property Name').fill('New Family Home');
    await page.getByRole('button', { name: /Residential/i }).click();
    await page.getByRole('button', { name: /Purchased/i }).click();
    await page.getByRole('button', { name: /Single/i }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 2
    await page.getByLabel(/Country/i).click();
    await page.getByRole('option', { name: 'Bangladesh' }).click();
    await page.getByLabel(/Address/i).fill('123 Test Street, Dhaka');

    // Submit
    await page.getByRole('button', { name: /Create|Submit/i }).click();

    // Should redirect to property detail
    await expect(page).toHaveURL(/\/properties\/\d+/);
    await expect(page.getByText('New Family Home')).toBeVisible();
  });

  test('property edit updates basic information', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const property = new PropertyBuilder()
      .withId(1)
      .withUserId(user.id)
      .withName('Old Name')
      .asActive()
      .build();

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/properties/1', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: property }),
        });
      } else if (route.request().method() === 'PUT') {
        const payload = route.request().postDataJSON();
        property.property_name = payload.property_name;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: property,
            message: 'Property updated successfully',
          }),
        });
      }
    });

    await page.route('**/api/v1/properties/1/documents', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: { document_types: [], uploaded: [] } }),
      });
    });

    await page.route('**/api/v1/properties/1/assessments**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(buildPaginated([], 1, 5)),
      });
    });

    await page.goto('/properties/1');

    // Click edit button
    await page.getByRole('button', { name: /Edit/i }).click();

    // Update name
    await page.getByLabel('Property Name').fill('New Name');

    // Save
    await page.getByRole('button', { name: /Save|Update/i }).click();

    // Should show success message
    await expect(page.getByText(/updated successfully|saved/i)).toBeVisible();
    await expect(page.getByText('New Name')).toBeVisible();
  });

  test('property shows empty state when no properties', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
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

    await page.goto('/properties');

    await expect(page.getByText('No properties yet')).toBeVisible();
    await expect(page.getByRole('link', { name: /Add.*property/i })).toBeVisible();
  });
});
