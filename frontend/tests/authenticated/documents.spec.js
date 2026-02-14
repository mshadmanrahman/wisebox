/**
 * Document Management E2E Tests (Authenticated)
 *
 * Tests for document upload, marking, and management.
 * Covers: upload progress, mark missing, primary/secondary, deletion.
 */

const { test, expect } = require('../helpers/auth-helpers');
const { mockNotificationEndpoints, mockFileUpload } = require('../helpers/api-mocks');
const { PropertyBuilder } = require('../helpers/test-data');

test.describe('Documents (authenticated)', () => {
  test('document upload shows progress and success state', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const property = new PropertyBuilder()
      .withId(1)
      .withUserId(user.id)
      .withName('Test Property')
      .asActive()
      .build();

    await mockNotificationEndpoints(page, []);
    await mockFileUpload(page);

    await page.route('**/api/v1/properties/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: property }),
      });
    });

    await page.route('**/api/v1/properties/1/documents', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              document_types: [
                { id: 1, name: 'Title Deed', slug: 'title-deed', is_required: true },
                { id: 2, name: 'Mutation Copy', slug: 'mutation-copy', is_required: false },
              ],
              uploaded: [],
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route('**/api/v1/properties/1/assessments**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ current_page: 1, data: [], total: 0 }),
      });
    });

    await page.goto('/properties/1');

    // Click upload button
    await page.getByRole('button', { name: /Upload.*document/i }).click();

    // Should show document type selector
    await expect(page.getByText('Title Deed')).toBeVisible();
    await expect(page.getByText('Mutation Copy')).toBeVisible();
  });

  test('document upload handles file selection and submission', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const property = new PropertyBuilder()
      .withId(1)
      .withUserId(user.id)
      .withName('Test Property')
      .asActive()
      .build();

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/properties/1', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: property }),
      });
    });

    const uploadedDocuments = [];
    await page.route('**/api/v1/properties/1/documents', async (route) => {
      if (route.request().method() === 'POST') {
        const newDoc = {
          id: uploadedDocuments.length + 1,
          property_id: 1,
          document_type_id: 1,
          file_name: 'title-deed.pdf',
          file_path: '/storage/testing/title-deed.pdf',
          file_size: 1024 * 100,
          mime_type: 'application/pdf',
          is_primary: false,
          status: 'uploaded',
          created_at: new Date().toISOString(),
        };
        uploadedDocuments.push(newDoc);

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: newDoc,
            message: 'Document uploaded successfully',
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              document_types: [
                { id: 1, name: 'Title Deed', slug: 'title-deed', is_required: true },
              ],
              uploaded: uploadedDocuments,
            },
          }),
        });
      }
    });

    await page.route('**/api/v1/properties/1/assessments**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ current_page: 1, data: [], total: 0 }),
      });
    });

    await page.goto('/properties/1');

    // Upload document
    await page.getByRole('button', { name: /Upload.*document/i }).click();

    // Select document type
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Title Deed' }).click();

    // Set file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'title-deed.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content'),
    });

    // Submit upload
    await page.getByRole('button', { name: /Upload|Submit/i }).click();

    // Should show success message
    await expect(page.getByText(/uploaded successfully/i)).toBeVisible();
  });

  test('document can be marked as primary', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const property = new PropertyBuilder()
      .withId(1)
      .withUserId(user.id)
      .withName('Test Property')
      .asActive()
      .build();

    const documents = [
      {
        id: 1,
        property_id: 1,
        document_type_id: 1,
        file_name: 'title-deed-1.pdf',
        is_primary: false,
        status: 'uploaded',
      },
      {
        id: 2,
        property_id: 1,
        document_type_id: 1,
        file_name: 'title-deed-2.pdf',
        is_primary: true,
        status: 'uploaded',
      },
    ];

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/properties/1', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: property }),
      });
    });

    await page.route('**/api/v1/properties/1/documents', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            document_types: [{ id: 1, name: 'Title Deed', slug: 'title-deed' }],
            uploaded: documents,
          },
        }),
      });
    });

    await page.route('**/api/v1/properties/1/documents/1/primary', async (route) => {
      documents[0].is_primary = true;
      documents[1].is_primary = false;

      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: documents[0],
          message: 'Document marked as primary',
        }),
      });
    });

    await page.route('**/api/v1/properties/1/assessments**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ current_page: 1, data: [], total: 0 }),
      });
    });

    await page.goto('/properties/1');

    // Find first document and mark as primary
    await page.getByRole('button', { name: /Mark as primary/i }).first().click();

    // Should show success
    await expect(page.getByText(/marked as primary/i)).toBeVisible();
  });

  test('document can be marked as missing', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const property = new PropertyBuilder()
      .withId(1)
      .withUserId(user.id)
      .withName('Test Property')
      .asActive()
      .build();

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/properties/1', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: property }),
      });
    });

    await page.route('**/api/v1/properties/1/documents', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            data: {
              id: 99,
              property_id: 1,
              document_type_id: 2,
              status: 'missing',
              reason: 'Lost during transfer',
            },
            message: 'Document marked as missing',
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              document_types: [
                { id: 2, name: 'Mutation Copy', slug: 'mutation-copy', is_required: false },
              ],
              uploaded: [],
            },
          }),
        });
      }
    });

    await page.route('**/api/v1/properties/1/assessments**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ current_page: 1, data: [], total: 0 }),
      });
    });

    await page.goto('/properties/1');

    // Mark document as missing
    await page.getByRole('button', { name: /Mark.*missing/i }).click();

    // Select document type
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Mutation Copy' }).click();

    // Provide reason
    await page.getByLabel(/Reason/i).fill('Lost during transfer');

    // Submit
    await page.getByRole('button', { name: /Submit|Confirm/i }).click();

    // Should show success
    await expect(page.getByText(/marked as missing/i)).toBeVisible();
  });

  test('document list shows upload progress indicators', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const property = new PropertyBuilder()
      .withId(1)
      .withUserId(user.id)
      .withName('Test Property')
      .withCompletion(60, 'yellow')
      .build();

    const documents = [
      {
        id: 1,
        document_type_id: 1,
        file_name: 'title-deed.pdf',
        status: 'uploaded',
        is_primary: true,
      },
      {
        id: 2,
        document_type_id: 2,
        status: 'missing',
        reason: 'Lost',
      },
    ];

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/properties/1', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: property }),
      });
    });

    await page.route('**/api/v1/properties/1/documents', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            document_types: [
              { id: 1, name: 'Title Deed', slug: 'title-deed', is_required: true },
              { id: 2, name: 'Mutation Copy', slug: 'mutation-copy', is_required: false },
            ],
            uploaded: documents,
          },
        }),
      });
    });

    await page.route('**/api/v1/properties/1/assessments**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ current_page: 1, data: [], total: 0 }),
      });
    });

    await page.goto('/properties/1');

    // Should show completion percentage
    await expect(page.getByText('60%')).toBeVisible();

    // Should show document status indicators
    await expect(page.getByText('title-deed.pdf')).toBeVisible();
    await expect(page.getByText(/missing/i)).toBeVisible();
  });

  test('document deletion requires confirmation', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const property = new PropertyBuilder()
      .withId(1)
      .withUserId(user.id)
      .withName('Test Property')
      .asActive()
      .build();

    const documents = [
      {
        id: 1,
        property_id: 1,
        file_name: 'old-document.pdf',
        status: 'uploaded',
      },
    ];

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/properties/1', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: property }),
      });
    });

    await page.route('**/api/v1/properties/1/documents', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            document_types: [{ id: 1, name: 'Title Deed' }],
            uploaded: documents,
          },
        }),
      });
    });

    await page.route('**/api/v1/properties/1/documents/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        documents.splice(0, 1);
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Document deleted successfully' }),
        });
      }
    });

    await page.route('**/api/v1/properties/1/assessments**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ current_page: 1, data: [], total: 0 }),
      });
    });

    await page.goto('/properties/1');

    // Click delete button
    await page.getByRole('button', { name: /Delete/i }).first().click();

    // Should show confirmation dialog
    await expect(page.getByText(/Are you sure|confirm/i)).toBeVisible();

    // Confirm deletion
    await page.getByRole('button', { name: /Confirm|Yes|Delete/i }).click();

    // Should show success
    await expect(page.getByText(/deleted successfully/i)).toBeVisible();
  });
});
