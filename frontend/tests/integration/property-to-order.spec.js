/**
 * Integration E2E Test: Complete Customer Journey
 *
 * Tests the full user flow from registration through ticket scheduling.
 * Flow: Register → Create Property → Upload Documents → Order Service → Ticket → Schedule
 */

const { test, expect } = require('@playwright/test');
const {
  mockOTPVerification,
  mockStripePayment,
  mockCalendlyScheduling,
  mockNotificationEndpoints,
  mockFileUpload
} = require('../helpers/api-mocks');
const { PropertyBuilder, OrderBuilder, TicketBuilder, NotificationBuilder } = require('../helpers/test-data');

test.describe('Integration: Complete customer journey', () => {
  test('registration → property → documents → order → ticket → schedule', async ({ page }) => {
    const timestamp = Date.now();
    const testUser = {
      id: 9999,
      name: `E2E Integration User ${timestamp}`,
      email: `integration-${timestamp}@wisebox.test`,
      phone: null,
      country_of_residence: 'USA',
      avatar_url: null,
      role: 'customer',
      email_verified_at: new Date().toISOString(),
      phone_verified_at: null,
      status: 'active',
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const authToken = 'integration-test-token';
    let propertyId = null;
    let orderId = null;
    let ticketId = null;
    const notifications = [];

    // ========================================
    // STEP 1: Register new customer
    // ========================================

    await mockOTPVerification(page, { testCode: '000000', shouldBypass: true });

    await page.route('**/api/v1/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: testUser,
            token: authToken,
          },
          message: 'Registration successful',
        }),
      });
    });

    await page.route('**/api/v1/dashboard/summary', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            hero_slides: [],
            properties_preview: [],
            tickets_preview: [],
            notifications_preview: notifications.slice(0, 3),
            unread_notifications_count: notifications.filter(n => !n.read_at).length,
            counts: { properties_total: 0, tickets_total: 0, tickets_open: 0 },
          },
        }),
      });
    });

    await mockNotificationEndpoints(page, notifications);

    await page.goto('/register');
    await page.getByLabel('Name').fill(testUser.name);
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password', { exact: true }).fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('button', { name: 'Create account' }).click();

    // Verify registration success
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Wisebox Dashboard')).toBeVisible();

    // ========================================
    // STEP 2: Create property (2-step flow)
    // ========================================

    const property = new PropertyBuilder()
      .withId(1)
      .withUserId(testUser.id)
      .withName('Integration Test Property')
      .withAddress('123 Integration Street, Dhaka')
      .withType(1, 'Residential')
      .withOwnershipStatus(1, 'Purchased')
      .withCompletion(30, 'red') // Initial incomplete status
      .asDraft()
      .build();

    propertyId = property.id;

    // Mock reference data
    await page.route('**/api/v1/reference-data/property-types', async (route) => {
      await route.fulfill({
        status: 200,
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
        body: JSON.stringify({
          data: [{ id: 1, name: 'Single', slug: 'single' }],
        }),
      });
    });

    await page.route('**/api/v1/reference-data/countries', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [{ code: 'BGD', name: 'Bangladesh' }],
        }),
      });
    });

    await page.route('**/api/v1/properties', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            data: property,
            message: 'Property created successfully',
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: [property],
            meta: { current_page: 1, total: 1, per_page: 15 },
          }),
        });
      }
    });

    await page.goto('/properties/new');

    // Step 1: Basic Information
    await page.getByLabel('Property Name').fill('Integration Test Property');
    await page.getByRole('button', { name: /Residential/i }).click();
    await page.getByRole('button', { name: /Purchased/i }).click();
    await page.getByRole('button', { name: /Single/i }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 2: Location
    await page.getByLabel(/Country/i).click();
    await page.getByRole('option', { name: 'Bangladesh' }).click();
    await page.getByLabel(/Address/i).fill('123 Integration Street, Dhaka');
    await page.getByRole('button', { name: /Create|Submit/i }).click();

    // Verify property created (red status - incomplete)
    await expect(page).toHaveURL(/\/properties\/1$/);
    await expect(page.getByText('Integration Test Property')).toBeVisible();
    await expect(page.getByText('30%')).toBeVisible();

    // ========================================
    // STEP 3: Upload documents
    // ========================================

    await mockFileUpload(page);

    property.documents = [];

    await page.route(`**/api/v1/properties/${propertyId}`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: property }),
      });
    });

    await page.route(`**/api/v1/properties/${propertyId}/documents`, async (route) => {
      if (route.request().method() === 'POST') {
        const newDoc = {
          id: property.documents.length + 1,
          property_id: propertyId,
          document_type_id: 1,
          file_name: `document-${property.documents.length + 1}.pdf`,
          file_path: `/storage/testing/document-${property.documents.length + 1}.pdf`,
          file_size: 1024 * 100,
          mime_type: 'application/pdf',
          is_primary: property.documents.length < 2, // First 2 are primary
          status: 'uploaded',
          created_at: new Date().toISOString(),
        };
        property.documents.push(newDoc);

        // Update completion status based on documents
        if (property.documents.length === 1) {
          property.completion_percentage = 50;
          property.completion_status = 'yellow'; // In progress
        } else if (property.documents.length >= 3) {
          property.completion_percentage = 100;
          property.completion_status = 'green'; // Complete
          property.status = 'active';
        }

        await route.fulfill({
          status: 201,
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
                { id: 2, name: 'Khatian', slug: 'khatian', is_required: true },
                { id: 3, name: 'Mutation Copy', slug: 'mutation-copy', is_required: false },
              ],
              uploaded: property.documents,
            },
          }),
        });
      }
    });

    await page.route(`**/api/v1/properties/${propertyId}/assessments**`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ current_page: 1, data: [], total: 0 }),
      });
    });

    // Upload first primary document (Title Deed)
    await page.getByRole('button', { name: /Upload.*document/i }).click();
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Title Deed' }).click();
    const fileInput1 = page.locator('input[type="file"]');
    await fileInput1.setInputFiles({
      name: 'title-deed.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content'),
    });
    await page.getByRole('button', { name: /Upload|Submit/i }).click();
    await expect(page.getByText(/uploaded successfully/i)).toBeVisible();

    // Verify status changed to yellow (in-progress)
    await page.reload();
    await expect(page.getByText('50%')).toBeVisible();

    // Upload second primary document (Khatian)
    await page.getByRole('button', { name: /Upload.*document/i }).click();
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Khatian' }).click();
    const fileInput2 = page.locator('input[type="file"]');
    await fileInput2.setInputFiles({
      name: 'khatian.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content 2'),
    });
    await page.getByRole('button', { name: /Upload|Submit/i }).click();
    await expect(page.getByText(/uploaded successfully/i)).toBeVisible();

    // Upload third document (Mutation Copy - optional)
    await page.getByRole('button', { name: /Upload.*document/i }).click();
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Mutation Copy' }).click();
    const fileInput3 = page.locator('input[type="file"]');
    await fileInput3.setInputFiles({
      name: 'mutation.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content 3'),
    });
    await page.getByRole('button', { name: /Upload|Submit/i }).click();
    await expect(page.getByText(/uploaded successfully/i)).toBeVisible();

    // Verify status changed to green (complete)
    await page.reload();
    await expect(page.getByText('100%')).toBeVisible();

    // ========================================
    // STEP 4: Browse services catalog
    // ========================================

    const services = [
      { id: 1, name: 'Property Verification', price: 150, currency: 'USD', pricing_type: 'paid' },
      { id: 2, name: 'Legal Consultation', price: 200, currency: 'USD', pricing_type: 'paid' },
    ];

    await page.route('**/api/v1/service-categories', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [{ id: 1, name: 'Legal Services', slug: 'legal', active_services_count: 2 }],
        }),
      });
    });

    await page.route('**/api/v1/services**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          current_page: 1,
          data: services,
          per_page: 6,
          total: services.length,
          last_page: 1,
        }),
      });
    });

    await page.goto('/workspace/services');
    await expect(page.getByRole('heading', { name: 'Choose Services' })).toBeVisible();
    await expect(page.getByText('Property Verification')).toBeVisible();

    // ========================================
    // STEP 5: Create order and checkout
    // ========================================

    const order = new OrderBuilder()
      .withId(501)
      .forUser(testUser.id)
      .forProperty(propertyId)
      .withService(1, 'Property Verification', 150)
      .asPending()
      .build();

    orderId = order.id;

    await page.route('**/api/v1/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({ data: order }),
        });
      }
    });

    await page.route(`**/api/v1/orders/${orderId}`, async (route) => {
      if (route.request().method() === 'PUT') {
        order.payment_status = 'paid';
        order.status = 'processing';
      }
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: order }),
      });
    });

    await mockStripePayment(page, { shouldSucceed: true });

    // Select property
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Integration Test Property' }).click();

    // Add service to cart
    await page.getByRole('button', { name: /Property Verification/i }).click();
    await expect(page.getByText('USD 150.00')).toBeVisible();

    // Proceed to checkout
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();
    await expect(page).toHaveURL(/\/orders\/501$/);

    // Complete Stripe payment
    await page.getByRole('button', { name: /Pay with Stripe/i }).click();

    // Mock Stripe payment completion
    await page.evaluate(() => {
      if (window.mockStripeConfirmPayment) {
        window.mockStripeConfirmPayment();
      }
    });

    // Verify order status updated
    await page.reload();
    await expect(page.getByText(/processing|paid/i)).toBeVisible();

    // ========================================
    // STEP 6: View ticket created from order
    // ========================================

    const ticket = new TicketBuilder()
      .withId(1)
      .forCustomer(testUser.id, testUser.name, testUser.email)
      .forProperty(propertyId, 'Integration Test Property')
      .forService(1, 'Property Verification')
      .withTitle('Property Verification Request')
      .withDescription('Automatically created from order')
      .asOpen()
      .build();

    ticketId = ticket.id;

    await page.route('**/api/v1/tickets**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          current_page: 1,
          data: [ticket],
          per_page: 15,
          total: 1,
          last_page: 1,
        }),
      });
    });

    await page.route(`**/api/v1/tickets/${ticketId}`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: ticket }),
      });
    });

    await page.goto('/tickets');
    await expect(page.getByText(ticket.ticket_number)).toBeVisible();
    await expect(page.getByText('Property Verification Request')).toBeVisible();

    // Navigate to ticket detail
    await page.getByRole('link', { name: /Open ticket/i }).first().click();
    await expect(page).toHaveURL(/\/tickets\/1$/);

    // ========================================
    // STEP 7: Add comment to ticket
    // ========================================

    await page.route(`**/api/v1/tickets/${ticketId}/comments`, async (route) => {
      const payload = route.request().postDataJSON();
      const newComment = {
        id: ticket.comments.length + 1,
        ticket_id: ticketId,
        user_id: testUser.id,
        body: payload.body,
        is_internal: false,
        attachments: [],
        created_at: new Date().toISOString(),
        user: { id: testUser.id, name: testUser.name },
      };
      ticket.comments.push(newComment);

      await route.fulfill({
        status: 201,
        body: JSON.stringify({ data: newComment }),
      });
    });

    await page.getByPlaceholder('Write a message...').fill('Looking forward to the verification results!');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText('Looking forward to the verification results!')).toBeVisible();

    // ========================================
    // STEP 8: Schedule consultation
    // ========================================

    await mockCalendlyScheduling(page, {
      shouldSucceed: true,
      schedulingUrl: `https://calendly.com/wisebox/30min?invitee_email=${testUser.email}`,
    });

    await page.getByRole('button', { name: 'Get scheduling link' }).click();
    await expect(page.getByText(/calendly\.com|schedule/i)).toBeVisible();

    // ========================================
    // STEP 9: Verify final state on dashboard
    // ========================================

    // Add notification for order completion
    notifications.push(
      new NotificationBuilder()
        .forUser(testUser.id)
        .ofType('order.paid')
        .withTitle('Payment successful')
        .withBody('Your order has been processed')
        .asUnread()
        .build()
    );

    // Update dashboard summary
    await page.route('**/api/v1/dashboard/summary', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            hero_slides: [],
            properties_preview: [property],
            tickets_preview: [{
              id: ticket.id,
              ticket_number: ticket.ticket_number,
              title: ticket.title,
              status: ticket.status,
              updated_at: ticket.updated_at,
            }],
            notifications_preview: notifications.slice(0, 3),
            unread_notifications_count: notifications.filter(n => !n.read_at).length,
            counts: {
              properties_total: 1,
              tickets_total: 1,
              tickets_open: 1,
            },
          },
        }),
      });
    });

    await page.goto('/dashboard');

    // Verify property (green status)
    await expect(page.getByText('Integration Test Property')).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();

    // Verify ticket preview
    await expect(page.getByText(ticket.ticket_number)).toBeVisible();

    // Verify notification
    await expect(page.getByText('1 unread')).toBeVisible();
    await expect(page.getByText('Payment successful')).toBeVisible();

    // Final assertion: Complete journey successful
    await expect(page.getByText('Wisebox Dashboard')).toBeVisible();
  });
});
