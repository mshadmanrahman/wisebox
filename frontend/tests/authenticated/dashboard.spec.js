/**
 * Dashboard E2E Tests (Authenticated)
 *
 * Tests for authenticated dashboard functionality.
 * Covers: hero banner, CTAs, properties preview, tickets preview, notifications.
 */

const { test, expect } = require('../helpers/auth-helpers');
const { mockNotificationEndpoints, mockDashboardSummary } = require('../helpers/api-mocks');
const { PropertyBuilder, TicketBuilder, NotificationBuilder } = require('../helpers/test-data');

test.describe('Dashboard (authenticated)', () => {
  test('unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
  });

  test('dashboard loads with hero banner and CTAs', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, {
      hero_slides: [
        {
          id: 1,
          title: 'Secure your property records',
          subtitle: 'One dashboard for every property file',
          image_path: '/slide.jpg',
          cta_text: 'Add New Property',
          cta_url: '/properties/new',
          is_active: true,
          sort_order: 1,
        },
      ],
      counts: {
        properties_total: 0,
        tickets_total: 0,
        tickets_open: 0,
      },
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Wisebox Dashboard')).toBeVisible();
    await expect(page.getByText('Secure your property records')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add New Property' })).toBeVisible();
  });

  test('dashboard displays properties preview', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const property = new PropertyBuilder()
      .withUserId(user.id)
      .withName('Family Home')
      .withCompletion(70, 'yellow')
      .asActive()
      .build();

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, {
      properties_preview: [property],
      counts: {
        properties_total: 1,
        tickets_total: 0,
        tickets_open: 0,
      },
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Family Home')).toBeVisible();
    await expect(page.getByText('70%')).toBeVisible();
    await expect(page.getByRole('link', { name: /View all properties/i })).toBeVisible();
  });

  test('dashboard displays tickets preview', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const ticket = new TicketBuilder()
      .forCustomer(user.id, user.name, user.email)
      .withTitle('Need title verification')
      .asAssigned(14, 'Consultant One')
      .build();

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, {
      tickets_preview: [
        {
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          title: ticket.title,
          status: ticket.status,
          updated_at: ticket.updated_at,
        },
      ],
      counts: {
        properties_total: 0,
        tickets_total: 1,
        tickets_open: 1,
      },
    });

    await page.goto('/dashboard');

    await expect(page.getByText(ticket.ticket_number)).toBeVisible();
    await expect(page.getByText('Need title verification')).toBeVisible();
    await expect(page.getByRole('link', { name: /View all tickets/i })).toBeVisible();
  });

  test('dashboard displays notifications preview', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const notifications = [
      new NotificationBuilder()
        .forUser(user.id)
        .ofType('ticket.assigned')
        .withTitle('Ticket assigned')
        .withBody('A consultant has been assigned')
        .asUnread()
        .build(),
      new NotificationBuilder()
        .forUser(user.id)
        .ofType('order.paid')
        .withTitle('Payment successful')
        .withBody('Your order payment has been processed')
        .asUnread()
        .build(),
    ];

    await mockNotificationEndpoints(page, notifications);
    await mockDashboardSummary(page, {
      notifications_preview: notifications.slice(0, 3),
      unread_notifications_count: 2,
      counts: {
        properties_total: 0,
        tickets_total: 0,
        tickets_open: 0,
      },
    });

    await page.goto('/dashboard');

    await expect(page.getByText('2 unread')).toBeVisible();
    await expect(page.getByText('Ticket assigned')).toBeVisible();
    await expect(page.getByText('Payment successful')).toBeVisible();
  });

  test('dashboard CTAs navigate to correct pages', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, {
      hero_slides: [
        {
          id: 1,
          title: 'Get started',
          subtitle: 'Add your first property',
          cta_text: 'Add Property',
          cta_url: '/properties/new',
          is_active: true,
        },
      ],
    });

    // Mock property form page
    await page.route('**/api/v1/reference-data/property-types', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'Add Property' }).click();

    await expect(page).toHaveURL(/\/properties\/new/);
  });

  test('dashboard shows empty state when no data', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await mockDashboardSummary(page, {
      hero_slides: [],
      properties_preview: [],
      tickets_preview: [],
      notifications_preview: [],
      unread_notifications_count: 0,
      counts: {
        properties_total: 0,
        tickets_total: 0,
        tickets_open: 0,
      },
    });

    await page.goto('/dashboard');

    await expect(page.getByText(/No properties|Get started/i)).toBeVisible();
  });

  test('dashboard summary handles API errors with retry', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    let attempts = 0;
    await page.route('**/api/v1/dashboard/summary', async (route) => {
      attempts += 1;
      if (attempts <= 2) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Dashboard temporarily unavailable.',
          }),
        });
      } else {
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
      }
    });

    await page.goto('/dashboard');

    // Should show error
    await expect(page.getByText(/Could not load|error/i)).toBeVisible();

    // Click retry
    await page.getByRole('button', { name: 'Retry' }).click();

    // Should succeed after retry
    await expect(page.getByText('Wisebox Dashboard')).toBeVisible();
  });

  test('dashboard notification badge updates in real-time', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const notifications = [
      new NotificationBuilder()
        .forUser(user.id)
        .ofType('ticket.comment.added')
        .withTitle('New comment')
        .asUnread()
        .build(),
    ];

    const notificationManager = await mockNotificationEndpoints(page, notifications);
    await mockDashboardSummary(page, {
      notifications_preview: notifications,
      unread_notifications_count: 1,
      counts: { properties_total: 0, tickets_total: 0, tickets_open: 0 },
    });

    await page.goto('/dashboard');

    // Should show 1 unread
    await expect(page.getByText('1 unread')).toBeVisible();

    // Mark notification as read
    await page.route(`**/api/v1/notifications/${notifications[0].id}/read`, async (route) => {
      notifications[0].read_at = new Date().toISOString();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: notifications[0] }),
      });
    });

    // Navigate to notifications and mark as read
    await page.goto('/notifications');
    await page.getByRole('button', { name: /Mark as read/i }).first().click();

    // Badge should update
    await expect(page.getByText('0 unread')).toBeVisible();
  });
});
