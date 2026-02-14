/**
 * Tickets E2E Tests (Authenticated)
 *
 * Tests for support ticket viewing, commenting, and scheduling.
 * Covers: ticket list, detail view, commenting, Calendly scheduling mock.
 */

const { test, expect } = require('../helpers/auth-helpers');
const { mockNotificationEndpoints, mockCalendlyScheduling } = require('../helpers/api-mocks');
const { TicketBuilder, PropertyBuilder } = require('../helpers/test-data');

test.describe('Tickets (authenticated)', () => {
  test('tickets list displays user tickets', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const tickets = [
      new TicketBuilder()
        .forCustomer(user.id, user.name, user.email)
        .withTitle('Need title verification')
        .asAssigned(14, 'Consultant One')
        .build(),
      new TicketBuilder()
        .forCustomer(user.id, user.name, user.email)
        .withTitle('Document review request')
        .asInProgress(14, 'Consultant One')
        .build(),
    ];

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/tickets**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current_page: 1,
          data: tickets,
          per_page: 15,
          total: tickets.length,
          last_page: 1,
        }),
      });
    });

    await page.goto('/tickets');

    await expect(page.getByRole('heading', { name: 'Tickets' })).toBeVisible();
    await expect(page.getByText(tickets[0].ticket_number)).toBeVisible();
    await expect(page.getByText('Need title verification')).toBeVisible();
    await expect(page.getByText(tickets[1].ticket_number)).toBeVisible();
  });

  test('ticket detail shows status timeline and comments', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const ticket = new TicketBuilder()
      .withId(1)
      .forCustomer(user.id, user.name, user.email)
      .forProperty(1, 'Test Property')
      .forService(1, 'Title Search')
      .withTitle('Need help with documents')
      .withDescription('Please review my documents')
      .asAssigned(14, 'Consultant One', 'consultant@wisebox.test')
      .withComments(2)
      .build();

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/tickets/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: ticket }),
      });
    });

    await page.goto('/tickets/1');

    await expect(page.getByText(ticket.ticket_number)).toBeVisible();
    await expect(page.getByText('Need help with documents')).toBeVisible();
    await expect(page.getByText('Status Timeline')).toBeVisible();
    await expect(page.getByText('Comment 1')).toBeVisible();
    await expect(page.getByText('Comment 2')).toBeVisible();
  });

  test('customer can submit ticket comment', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const ticket = new TicketBuilder()
      .withId(1)
      .forCustomer(user.id, user.name, user.email)
      .withTitle('Test ticket')
      .asAssigned(14, 'Consultant One')
      .build();

    const comments = [];

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/tickets/1', async (route) => {
      ticket.comments = comments;
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: ticket }),
      });
    });

    await page.route('**/api/v1/tickets/1/comments', async (route) => {
      const payload = route.request().postDataJSON();
      const newComment = {
        id: comments.length + 1,
        ticket_id: 1,
        user_id: user.id,
        body: payload.body,
        is_internal: false,
        attachments: [],
        created_at: new Date().toISOString(),
        user: { id: user.id, name: user.name },
      };
      comments.push(newComment);

      await route.fulfill({
        status: 201,
        body: JSON.stringify({ data: newComment }),
      });
    });

    await page.goto('/tickets/1');

    // Write comment
    await page.getByPlaceholder('Write a message...').fill('Customer follow-up message');
    await page.getByRole('button', { name: 'Send message' }).click();

    // Should show new comment
    await expect(page.getByText('Customer follow-up message')).toBeVisible();
  });

  test('ticket scheduling shows Calendly link', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const ticket = new TicketBuilder()
      .withId(1)
      .forCustomer(user.id, user.name, user.email)
      .withTitle('Need consultation')
      .asAssigned(14, 'Consultant One')
      .build();

    await mockNotificationEndpoints(page, []);
    await mockCalendlyScheduling(page, {
      shouldSucceed: true,
      schedulingUrl: 'https://calendly.com/wisebox-consultant/30min?invitee_email=' + user.email,
    });

    await page.route('**/api/v1/tickets/1', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: ticket }),
      });
    });

    await page.goto('/tickets/1');

    // Click scheduling button
    await page.getByRole('button', { name: 'Get scheduling link' }).click();

    // Should show Calendly URL or redirect
    await expect(page.getByText(/calendly\.com|schedule|appointment/i)).toBeVisible();
  });

  test('ticket scheduling handles consultant calendar not configured', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const ticket = new TicketBuilder()
      .withId(1)
      .forCustomer(user.id, user.name, user.email)
      .withTitle('Need consultation')
      .asAssigned(14, 'Consultant One')
      .build();

    await mockNotificationEndpoints(page, []);
    await mockCalendlyScheduling(page, {
      shouldSucceed: false,
      errorMessage: 'Consultant calendar is not configured.',
    });

    await page.route('**/api/v1/tickets/1', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: ticket }),
      });
    });

    await page.goto('/tickets/1');

    // Click scheduling button
    await page.getByRole('button', { name: 'Get scheduling link' }).click();

    // Should show error
    await expect(page.getByText('Consultant calendar is not configured.')).toBeVisible();
  });

  test('ticket comment submission shows validation errors', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const ticket = new TicketBuilder()
      .withId(1)
      .forCustomer(user.id, user.name, user.email)
      .withTitle('Test ticket')
      .asAssigned(14, 'Consultant One')
      .build();

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/tickets/1', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: ticket }),
      });
    });

    await page.route('**/api/v1/tickets/1/comments', async (route) => {
      await route.fulfill({
        status: 422,
        body: JSON.stringify({
          message: 'Comment body is required.',
        }),
      });
    });

    await page.goto('/tickets/1');

    // Try to submit empty comment
    await page.getByRole('button', { name: 'Send message' }).click();

    // Should show validation error
    await expect(page.getByText(/required|empty/i)).toBeVisible();
  });

  test('ticket list shows empty state when no tickets', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/tickets**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          current_page: 1,
          data: [],
          per_page: 15,
          total: 0,
        }),
      });
    });

    await page.goto('/tickets');

    await expect(page.getByText('No tickets found')).toBeVisible();
    await expect(page.getByRole('link', { name: /create.*ticket|browse services/i })).toBeVisible();
  });

  test('ticket detail shows scheduled meeting information', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    const ticket = new TicketBuilder()
      .withId(1)
      .forCustomer(user.id, user.name, user.email)
      .withTitle('Scheduled consultation')
      .asAssigned(14, 'Consultant One')
      .withSchedule(
        '2026-02-15T14:00:00Z',
        'https://meet.google.com/abc-defg-hij',
        30
      )
      .build();

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/tickets/1', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: ticket }),
      });
    });

    await page.goto('/tickets/1');

    // Should show meeting info
    await expect(page.getByText(/scheduled|meeting/i)).toBeVisible();
    await expect(page.getByText('30')).toBeVisible(); // duration
    await expect(page.getByRole('link', { name: /join.*meeting|meet\.google\.com/i })).toBeVisible();
  });

  test('consultant workspace is inaccessible to customer role', async ({ authenticatedCustomer }) => {
    const { page } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);

    await page.goto('/consultant/tickets');

    // Should show access denied or redirect
    await expect(page.getByText(/Consultant access required|not authorized/i)).toBeVisible();
  });
});
