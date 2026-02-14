/**
 * Orders E2E Tests (Authenticated)
 *
 * Tests for service browsing, cart management, and checkout.
 * Covers: service selection, order creation, Stripe payment mock, order history.
 */

const { test, expect } = require('../helpers/auth-helpers');
const { mockNotificationEndpoints, mockStripePayment } = require('../helpers/api-mocks');
const { OrderBuilder, PropertyBuilder } = require('../helpers/test-data');

test.describe('Orders (authenticated)', () => {
  test('orders list displays user orders', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const orders = [
      new OrderBuilder()
        .forUser(user.id)
        .withService(1, 'Title Search', 150)
        .asPending()
        .build(),
      new OrderBuilder()
        .forUser(user.id)
        .withService(2, 'Document Review', 100)
        .asPaid()
        .build(),
    ];

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current_page: 1,
          data: orders,
          per_page: 10,
          total: orders.length,
          last_page: 1,
        }),
      });
    });

    await page.goto('/orders');

    await expect(page.getByText('My Orders')).toBeVisible();
    await expect(page.getByText(orders[0].order_number)).toBeVisible();
    await expect(page.getByText(orders[1].order_number)).toBeVisible();
    await expect(page.getByText('Title Search')).toBeVisible();
    await expect(page.getByText('Document Review')).toBeVisible();
  });

  test('order detail shows items and payment option', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const order = new OrderBuilder()
      .withId(1)
      .forUser(user.id)
      .withService(1, 'Title Search', 150)
      .withService(2, 'Mutation Filing', 80)
      .asPending()
      .build();

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/orders/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: order }),
      });
    });

    await page.goto('/orders/1');

    await expect(page.getByText(order.order_number)).toBeVisible();
    await expect(page.getByText('Title Search')).toBeVisible();
    await expect(page.getByText('Mutation Filing')).toBeVisible();
    await expect(page.getByText('USD 230.00')).toBeVisible();
    await expect(page.getByRole('button', { name: /Pay with Stripe/i })).toBeVisible();
  });

  test('services workspace displays available services', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const services = [
      { id: 1, name: 'Title Search', price: 150, currency: 'USD', pricing_type: 'paid' },
      { id: 2, name: 'Document Review', price: 0, currency: 'USD', pricing_type: 'free' },
      { id: 3, name: 'Mutation Filing', price: 80, currency: 'USD', pricing_type: 'physical' },
    ];

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/service-categories', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            { id: 1, name: 'Legal', slug: 'legal', active_services_count: 3 },
          ],
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

    await page.route('**/api/v1/properties**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          current_page: 1,
          data: [
            new PropertyBuilder()
              .withUserId(user.id)
              .withName('Test Property')
              .asActive()
              .build(),
          ],
          per_page: 100,
          total: 1,
        }),
      });
    });

    await page.goto('/workspace/services');

    await expect(page.getByRole('heading', { name: 'Choose Services' })).toBeVisible();
    await expect(page.getByText('Title Search')).toBeVisible();
    await expect(page.getByText('Document Review')).toBeVisible();
    await expect(page.getByText('Mutation Filing')).toBeVisible();
  });

  test('service selection adds to cart and shows total', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const services = [
      { id: 1, name: 'Title Search', price: 150, currency: 'USD', pricing_type: 'paid' },
      { id: 2, name: 'Document Review', price: 100, currency: 'USD', pricing_type: 'paid' },
    ];

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/service-categories', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [{ id: 1, name: 'Legal', slug: 'legal' }] }),
      });
    });

    await page.route('**/api/v1/services**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          current_page: 1,
          data: services,
          per_page: 6,
          total: 2,
        }),
      });
    });

    await page.route('**/api/v1/properties**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [new PropertyBuilder().withUserId(user.id).build()],
          meta: { total: 1 },
        }),
      });
    });

    await page.goto('/workspace/services');

    // Select first service
    await page.getByRole('button', { name: /Title Search/i }).click();

    // Should show in cart
    await expect(page.getByText('USD 150.00')).toBeVisible();

    // Select second service
    await page.getByRole('button', { name: /Document Review/i }).click();

    // Should show updated total
    await expect(page.getByText('USD 250.00')).toBeVisible();
  });

  test('checkout creates order and redirects to payment', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/service-categories', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [{ id: 1, name: 'Legal', slug: 'legal' }] }),
      });
    });

    await page.route('**/api/v1/services**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [{ id: 1, name: 'Title Search', price: 150, pricing_type: 'paid' }],
          current_page: 1,
          total: 1,
        }),
      });
    });

    await page.route('**/api/v1/properties**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            new PropertyBuilder()
              .withId(9)
              .withUserId(user.id)
              .withName('Test Property')
              .build(),
          ],
          meta: { total: 1 },
        }),
      });
    });

    // Mock order creation
    await page.route('**/api/v1/orders', async (route) => {
      if (route.request().method() === 'POST') {
        const order = new OrderBuilder()
          .withId(501)
          .forUser(user.id)
          .forProperty(9)
          .withService(1, 'Title Search', 150)
          .asPending()
          .build();

        await route.fulfill({
          status: 201,
          body: JSON.stringify({ data: order }),
        });
      }
    });

    await page.route('**/api/v1/orders/501', async (route) => {
      const order = new OrderBuilder()
        .withId(501)
        .forUser(user.id)
        .withService(1, 'Title Search', 150)
        .asPending()
        .build();

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: order }),
      });
    });

    await page.goto('/workspace/services');

    // Select property
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Test Property' }).click();

    // Select service
    await page.getByRole('button', { name: /Title Search/i }).click();

    // Proceed to checkout
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    // Should redirect to order detail
    await expect(page).toHaveURL(/\/orders\/501$/);
    await expect(page.getByRole('button', { name: /Pay with Stripe/i })).toBeVisible();
  });

  test('Stripe payment succeeds and updates order status', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const order = new OrderBuilder()
      .withId(1)
      .forUser(user.id)
      .withService(1, 'Title Search', 150)
      .asPending()
      .build();

    await mockNotificationEndpoints(page, []);
    await mockStripePayment(page, { shouldSucceed: true });

    await page.route('**/api/v1/orders/1', async (route) => {
      if (route.request().method() === 'PUT') {
        order.payment_status = 'paid';
        order.status = 'processing';
      }

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: order }),
      });
    });

    await page.goto('/orders/1');

    // Click pay button
    await page.getByRole('button', { name: /Pay with Stripe/i }).click();

    // Mock Stripe payment flow
    await page.evaluate(() => {
      if (window.mockStripeConfirmPayment) {
        window.mockStripeConfirmPayment();
      }
    });

    // Should show success (this depends on frontend implementation)
    await expect(page.getByText(/payment.*successful|processing/i)).toBeVisible();
  });

  test('order cancellation requires confirmation', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const order = new OrderBuilder()
      .withId(1)
      .forUser(user.id)
      .withService(1, 'Title Search', 150)
      .asPending()
      .build();

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/orders/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Order cancelled successfully' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: order }),
        });
      }
    });

    await page.goto('/orders/1');

    // Click cancel button
    await page.getByRole('button', { name: 'Cancel Order' }).click();

    // Should show confirmation
    await expect(page.getByText(/Are you sure|confirm/i)).toBeVisible();

    // Confirm cancellation
    await page.getByRole('button', { name: /Confirm|Yes/i }).click();

    // Should show success
    await expect(page.getByText(/cancelled successfully/i)).toBeVisible();
  });

  test('orders list shows empty state when no orders', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          current_page: 1,
          data: [],
          per_page: 10,
          total: 0,
        }),
      });
    });

    await page.goto('/orders');

    await expect(page.getByText('No orders yet')).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse services/i })).toBeVisible();
  });
});
