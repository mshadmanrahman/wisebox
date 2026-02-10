const { test, expect } = require('@playwright/test');

const AUTH_TOKEN = 'e2e-auth-token';

const E2E_USER = {
  id: 999,
  name: 'E2E User',
  email: 'e2e-user@wisebox.test',
  phone: null,
  country_of_residence: 'USA',
  avatar_url: null,
  role: 'customer',
  email_verified_at: '2026-02-10T00:00:00.000000Z',
  phone_verified_at: null,
  status: 'active',
  last_login_at: null,
  created_at: '2026-02-10T00:00:00.000000Z',
  updated_at: '2026-02-10T00:00:00.000000Z',
};

const E2E_USER_WITH_PROFILE = {
  ...E2E_USER,
  profile: {
    preferred_language: 'en',
    timezone: 'UTC',
    notification_preferences: {
      order_updates: true,
      ticket_updates: true,
      consultant_updates: true,
      marketing_updates: false,
    },
  },
};

const E2E_CONSULTANT = {
  ...E2E_USER,
  id: 1200,
  name: 'E2E Consultant',
  email: 'e2e-consultant@wisebox.test',
  role: 'consultant',
};

function buildPaginated(items, page, perPage) {
  const total = items.length;
  const safePerPage = Math.max(1, perPage);
  const currentPage = Math.max(1, page);
  const lastPage = Math.max(1, Math.ceil(total / safePerPage));
  const offset = (currentPage - 1) * safePerPage;
  const data = items.slice(offset, offset + safePerPage);

  return {
    current_page: currentPage,
    data,
    first_page_url: '/api/v1/notifications?page=1',
    from: data.length ? offset + 1 : null,
    last_page: lastPage,
    last_page_url: `/api/v1/notifications?page=${lastPage}`,
    links: [],
    next_page_url: currentPage < lastPage ? `/api/v1/notifications?page=${currentPage + 1}` : null,
    path: '/api/v1/notifications',
    per_page: safePerPage,
    prev_page_url: currentPage > 1 ? `/api/v1/notifications?page=${currentPage - 1}` : null,
    to: data.length ? offset + data.length : null,
    total,
  };
}

async function applyAuthenticatedSession(page, user = E2E_USER) {
  await page.context().addCookies([
    {
      name: 'wisebox_token',
      value: AUTH_TOKEN,
      domain: '127.0.0.1',
      path: '/',
      sameSite: 'Lax',
    },
  ]);

  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('wisebox_token', token);
    localStorage.setItem(
      'wisebox-auth',
      JSON.stringify({
        state: { token, user, isAuthenticated: true },
        version: 0,
      })
    );
  }, { token: AUTH_TOKEN, user });
}

async function mockNotificationEndpoints(page, initialNotifications) {
  let notifications = [...initialNotifications];

  await page.route('**/api/v1/notifications/unread-count', async (route) => {
    const unreadCount = notifications.filter((item) => !item.read_at).length;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { unread_count: unreadCount } }),
    });
  });

  await page.route(/.*\/api\/v1\/notifications\/[^/]+\/read$/, async (route) => {
    const id = route.request().url().split('/').at(-2);
    const target = notifications.find((item) => item.id === id);

    if (!target) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Notification not found.' }),
      });
      return;
    }

    if (!target.read_at) {
      target.read_at = new Date().toISOString();
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: target,
        message: 'Notification marked as read.',
      }),
    });
  });

  await page.route('**/api/v1/notifications/read-all', async (route) => {
    let marked = 0;
    notifications = notifications.map((item) => {
      if (item.read_at) {
        return item;
      }
      marked += 1;
      return {
        ...item,
        read_at: new Date().toISOString(),
      };
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { marked_count: marked },
        message: 'All notifications marked as read.',
      }),
    });
  });

  await page.route(/.*\/api\/v1\/notifications(?:\?.*)?$/, async (route) => {
    const requestUrl = new URL(route.request().url());
    const status = requestUrl.searchParams.get('status') || 'all';
    const type = requestUrl.searchParams.get('type');
    const q = (requestUrl.searchParams.get('q') || '').toLowerCase();
    const pageParam = Number(requestUrl.searchParams.get('page') || '1');
    const perPage = Number(requestUrl.searchParams.get('per_page') || '20');

    const filtered = notifications.filter((item) => {
      if (status === 'read' && !item.read_at) return false;
      if (status === 'unread' && item.read_at) return false;
      if (type && item.type !== type) return false;
      if (q && !`${item.title} ${item.body || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildPaginated(filtered, pageParam, perPage)),
    });
  });
}

test.describe('Wisebox authenticated workflows', () => {
  test('unauthenticated dashboard access redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
  });

  test('user can sign in and land on dashboard summary', async ({ page }) => {
    const notifications = [
      {
        id: 'notif-a',
        user_id: E2E_USER.id,
        type: 'ticket.assigned',
        title: 'Ticket assigned',
        body: 'A consultant has been assigned.',
        data: null,
        read_at: null,
        created_at: '2026-02-10T10:00:00.000000Z',
      },
      {
        id: 'notif-b',
        user_id: E2E_USER.id,
        type: 'order.paid',
        title: 'Order paid',
        body: 'Payment completed.',
        data: null,
        read_at: null,
        created_at: '2026-02-10T09:00:00.000000Z',
      },
    ];

    await mockNotificationEndpoints(page, notifications);

    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: E2E_USER,
            token: AUTH_TOKEN,
          },
        }),
      });
    });

    await page.route('**/api/v1/dashboard/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
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
            properties_preview: [
              {
                id: 1,
                user_id: E2E_USER.id,
                property_name: 'E2E Property',
                property_type_id: 1,
                ownership_status_id: 1,
                ownership_type_id: 1,
                country_code: 'BGD',
                division_id: null,
                district_id: null,
                upazila_id: null,
                mouza_id: null,
                address: null,
                latitude: null,
                longitude: null,
                size_value: null,
                size_unit: null,
                description: null,
                completion_percentage: 70,
                completion_status: 'yellow',
                status: 'draft',
                draft_data: null,
                last_draft_at: null,
                created_at: '2026-02-10T08:00:00.000000Z',
                updated_at: '2026-02-10T08:00:00.000000Z',
                property_type: { id: 1, name: 'Residential' },
                ownership_status: { id: 1, display_label: 'Purchased' },
                ownership_type: { id: 1, name: 'Single' },
                division: null,
                district: null,
              },
            ],
            tickets_preview: [
              {
                id: 1,
                ticket_number: 'WBX-TKT-0001',
                title: 'Initial review',
                status: 'open',
                updated_at: '2026-02-10T09:30:00.000000Z',
              },
            ],
            notifications_preview: notifications,
            unread_notifications_count: 2,
            counts: {
              properties_total: 1,
              tickets_total: 1,
              tickets_open: 1,
            },
          },
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('e2e-user@wisebox.test');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Wisebox Dashboard')).toBeVisible();
    await expect(page.getByText('2 unread')).toBeVisible();
    await expect(page.getByText('E2E Property')).toBeVisible();
  });

  test('notification center supports filter and pagination for authenticated users', async ({ page }) => {
    const notifications = Array.from({ length: 12 }, (_, index) => {
      const number = index + 1;
      const isRefund = number % 4 === 0;
      const isRead = number % 5 === 0;
      return {
        id: `notif-${number}`,
        user_id: E2E_USER.id,
        type: isRefund ? 'order.refunded' : 'ticket.comment.added',
        title: isRefund ? `Refund update ${number}` : `Ticket update ${number}`,
        body: isRefund ? 'Refund processed successfully' : 'Consultant posted an update',
        data: null,
        read_at: isRead ? '2026-02-10T11:00:00.000000Z' : null,
        created_at: `2026-02-10T10:${String(number).padStart(2, '0')}:00.000000Z`,
      };
    });

    await applyAuthenticatedSession(page);
    await mockNotificationEndpoints(page, notifications);

    await page.route('**/api/v1/dashboard/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            hero_slides: [],
            properties_preview: [],
            tickets_preview: [],
            notifications_preview: notifications.slice(0, 5),
            unread_notifications_count: notifications.filter((item) => !item.read_at).length,
            counts: { properties_total: 0, tickets_total: 0, tickets_open: 0 },
          },
        }),
      });
    });

    await page.goto('/notifications');

    await expect(page.getByText('Notification Center')).toBeVisible();
    await expect(page.getByText('Page 1 of 2')).toBeVisible();
    await expect(page.getByText('10 unread in total • 12 result(s)')).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Page 2 of 2')).toBeVisible();
    await page.getByRole('button', { name: 'Previous' }).click();
    await expect(page.getByText('Page 1 of 2')).toBeVisible();

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Unread only' }).click();
    await expect(page.getByText('Refund update 12')).toBeVisible();
    await expect(page.getByText('10 unread in total • 10 result(s)')).toBeVisible();
  });

  test('orders list and order detail render for authenticated users', async ({ page }) => {
    await applyAuthenticatedSession(page);
    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current_page: 1,
          data: [
            {
              id: 77,
              order_number: 'WB-2026-00077',
              property_id: 1,
              user_id: E2E_USER.id,
              subtotal: 250,
              tax: 0,
              discount: 0,
              total: 250,
              currency: 'USD',
              payment_status: 'pending',
              status: 'pending',
              created_at: '2026-02-10T08:00:00.000000Z',
              updated_at: '2026-02-10T08:00:00.000000Z',
            },
          ],
          per_page: 10,
          total: 1,
          last_page: 1,
        }),
      });
    });

    await page.route('**/api/v1/orders/77', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 77,
            order_number: 'WB-2026-00077',
            property_id: 1,
            user_id: E2E_USER.id,
            subtotal: 250,
            tax: 0,
            discount: 0,
            total: 250,
            currency: 'USD',
            payment_status: 'pending',
            status: 'pending',
            created_at: '2026-02-10T08:00:00.000000Z',
            updated_at: '2026-02-10T08:00:00.000000Z',
            items: [
              {
                id: 1,
                order_id: 77,
                service_id: 5,
                quantity: 1,
                unit_price: 250,
                total_price: 250,
                service: {
                  id: 5,
                  name: 'Document Review',
                },
              },
            ],
          },
        }),
      });
    });

    await page.goto('/orders');
    await expect(page.getByText('My Orders')).toBeVisible();
    await expect(page.getByText('WB-2026-00077')).toBeVisible();

    await page.getByRole('link', { name: 'View order' }).click();
    await expect(page).toHaveURL(/\/orders\/77$/);
    await expect(page.getByRole('button', { name: 'Pay with Stripe' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel Order' })).toBeVisible();
    await expect(page.getByText('Document Review')).toBeVisible();
  });

  test('tickets list and detail render for authenticated users', async ({ page }) => {
    await applyAuthenticatedSession(page);
    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/tickets', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current_page: 1,
          data: [
            {
              id: 19,
              ticket_number: 'TK-2026-00019',
              property_id: 1,
              customer_id: E2E_USER.id,
              consultant_id: 14,
              service_id: 7,
              title: 'Need title verification',
              description: 'Please review my ownership documents.',
              priority: 'medium',
              status: 'assigned',
              created_at: '2026-02-10T08:10:00.000000Z',
              updated_at: '2026-02-10T09:10:00.000000Z',
              property: { id: 1, property_name: 'North Plot' },
              service: { id: 7, name: 'Title Check' },
              customer: { id: E2E_USER.id, name: E2E_USER.name },
              consultant: { id: 14, name: 'Consultant One' },
            },
          ],
          per_page: 15,
          total: 1,
          last_page: 1,
        }),
      });
    });

    await page.route('**/api/v1/tickets/19', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 19,
            ticket_number: 'TK-2026-00019',
            property_id: 1,
            customer_id: E2E_USER.id,
            consultant_id: 14,
            service_id: 7,
            title: 'Need title verification',
            description: 'Please review my ownership documents.',
            priority: 'medium',
            status: 'assigned',
            scheduled_at: null,
            meeting_duration_minutes: null,
            meeting_url: null,
            created_at: '2026-02-10T08:10:00.000000Z',
            updated_at: '2026-02-10T09:10:00.000000Z',
            property: { id: 1, property_name: 'North Plot' },
            service: { id: 7, name: 'Title Check' },
            customer: { id: E2E_USER.id, name: E2E_USER.name, email: E2E_USER.email },
            consultant: { id: 14, name: 'Consultant One', email: 'consultant@wisebox.test' },
            comments: [
              {
                id: 900,
                ticket_id: 19,
                user_id: 14,
                body: 'Please upload your latest mutation copy.',
                is_internal: false,
                attachments: [],
                created_at: '2026-02-10T09:00:00.000000Z',
                user: { id: 14, name: 'Consultant One' },
              },
            ],
          },
        }),
      });
    });

    await page.goto('/tickets');
    await expect(page.getByRole('heading', { name: 'Tickets' })).toBeVisible();
    await expect(page.getByText('TK-2026-00019')).toBeVisible();

    await page.getByRole('link', { name: 'Open ticket' }).click();
    await expect(page).toHaveURL(/\/tickets\/19$/);
    await expect(page.getByText('Status Timeline')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get scheduling link' })).toBeVisible();
    await expect(page.getByText('Please upload your latest mutation copy.')).toBeVisible();
  });

  test('settings page saves profile preferences and password change request', async ({ page }) => {
    await applyAuthenticatedSession(page, E2E_USER_WITH_PROFILE);
    await mockNotificationEndpoints(page, []);

    let profileSaved = false;
    let passwordChanged = false;
    let profileState = { ...E2E_USER_WITH_PROFILE };

    await page.route(/.*\/api\/v1\/auth\/me$/, async (route) => {
      const method = route.request().method();

      if (method === 'PUT') {
        const payload = route.request().postDataJSON();
        profileSaved = true;
        profileState = {
          ...profileState,
          name: payload.name,
          phone: payload.phone,
          country_of_residence: payload.country_of_residence,
          profile: {
            ...profileState.profile,
            preferred_language: payload.preferred_language,
            timezone: payload.timezone,
            notification_preferences: payload.notification_preferences,
          },
        };

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: profileState }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: profileState }),
      });
    });

    await page.route('**/api/v1/auth/change-password', async (route) => {
      passwordChanged = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password updated successfully.' }),
      });
    });

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Account Settings' })).toBeVisible();

    const saveProfileRequest = page.waitForResponse(
      (response) => response.url().includes('/api/v1/auth/me') && response.request().method() === 'PUT'
    );
    await page.getByRole('button', { name: 'Marketing updates' }).click();
    await page.getByRole('button', { name: 'Save changes' }).click();
    await saveProfileRequest;
    expect(profileSaved).toBeTruthy();

    await page.getByRole('tab', { name: 'Password' }).click();
    await expect(page.getByText('Change your password securely.')).toBeVisible();
    const passwordInputs = page.locator('input[type="password"]:visible');
    await passwordInputs.nth(0).fill('CurrentPass123!');
    await passwordInputs.nth(1).fill('NewPass123!');
    await passwordInputs.nth(2).fill('NewPass123!');
    const updatePasswordRequest = page.waitForResponse(
      (response) => response.url().includes('/api/v1/auth/change-password') && response.request().method() === 'PUT'
    );
    await page.getByRole('button', { name: 'Update password' }).click();
    await updatePasswordRequest;
    expect(passwordChanged).toBeTruthy();
  });

  test('authenticated user can create order from services workspace', async ({ page }) => {
    await applyAuthenticatedSession(page, E2E_USER);
    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/services', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 31,
              name: 'Title Search',
              short_description: 'Verify ownership history',
              pricing_type: 'paid',
              price: 150,
              currency: 'USD',
              is_featured: true,
            },
          ],
        }),
      });
    });

    await page.route(/.*\/api\/v1\/properties(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current_page: 1,
          data: [
            {
              id: 9,
              user_id: E2E_USER.id,
              property_name: 'Workspace Property',
              property_type_id: 1,
              ownership_status_id: 1,
              ownership_type_id: 1,
              status: 'active',
              completion_percentage: 76,
              completion_status: 'yellow',
              created_at: '2026-02-10T00:00:00.000000Z',
              updated_at: '2026-02-10T00:00:00.000000Z',
            },
          ],
          per_page: 100,
          total: 1,
          last_page: 1,
        }),
      });
    });

    await page.route('**/api/v1/orders', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 501,
            order_number: 'WB-2026-00501',
            payment_status: 'pending',
            status: 'pending',
          },
        }),
      });
    });

    await page.route('**/api/v1/orders/501', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 501,
            order_number: 'WB-2026-00501',
            property_id: 9,
            user_id: E2E_USER.id,
            subtotal: 150,
            tax: 0,
            discount: 0,
            total: 150,
            currency: 'USD',
            payment_status: 'pending',
            status: 'pending',
            created_at: '2026-02-10T10:00:00.000000Z',
            updated_at: '2026-02-10T10:00:00.000000Z',
            items: [
              {
                id: 1,
                order_id: 501,
                service_id: 31,
                quantity: 1,
                unit_price: 150,
                total_price: 150,
                service: {
                  id: 31,
                  name: 'Title Search',
                },
              },
            ],
          },
        }),
      });
    });

    await page.goto('/workspace/services');
    await expect(page.getByRole('heading', { name: 'Choose Services' })).toBeVisible();

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Workspace Property' }).click();
    await page.getByRole('button', { name: /Title Search/ }).click();
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    await expect(page).toHaveURL(/\/orders\/501$/);
    await expect(page.getByRole('button', { name: 'Pay with Stripe' })).toBeVisible();
  });

  test('consultant user can access consultant workspace list and detail', async ({ page }) => {
    await applyAuthenticatedSession(page, E2E_CONSULTANT);
    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/consultant/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            stats: {
              open_count: 2,
              awaiting_customer_count: 1,
              upcoming_meetings_count: 1,
              completed_this_month_count: 4,
            },
            upcoming_meetings: [],
          },
        }),
      });
    });

    await page.route('**/api/v1/consultant/metrics', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            kpis: {
              window_days: 30,
              active_count: 2,
              completed_in_window_count: 4,
              awaiting_customer_count: 1,
              upcoming_meetings_count: 1,
              avg_resolution_hours: 9.4,
              capacity: {
                open_tickets_count: 2,
                max_concurrent_tickets: 8,
                utilization_percentage: 25,
              },
            },
            status_breakdown: {
              open: 1,
              in_progress: 1,
            },
          },
        }),
      });
    });

    await page.route(/.*\/api\/v1\/consultant\/tickets\/44(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 44,
            ticket_number: 'TK-2026-00044',
            property_id: 9,
            customer_id: 100,
            consultant_id: E2E_CONSULTANT.id,
            service_id: 31,
            title: 'Consultant detail test ticket',
            description: 'Review uploaded deed and mutation.',
            priority: 'high',
            status: 'in_progress',
            scheduled_at: null,
            meeting_url: null,
            meeting_duration_minutes: null,
            resolution_notes: null,
            created_at: '2026-02-10T09:00:00.000000Z',
            updated_at: '2026-02-10T10:00:00.000000Z',
            property: {
              id: 9,
              property_name: 'Workspace Property',
              documents: [],
            },
            service: {
              id: 31,
              name: 'Title Search',
            },
            customer: {
              id: 100,
              name: 'Customer Alpha',
              email: 'customer-alpha@wisebox.test',
            },
            comments: [
              {
                id: 1,
                ticket_id: 44,
                user_id: 100,
                body: 'Sharing latest update.',
                is_internal: false,
                attachments: [],
                created_at: '2026-02-10T09:30:00.000000Z',
                user: {
                  id: 100,
                  name: 'Customer Alpha',
                },
              },
            ],
          },
        }),
      });
    });

    await page.route(/.*\/api\/v1\/consultant\/tickets(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current_page: 1,
          data: [
            {
              id: 44,
              ticket_number: 'TK-2026-00044',
              property_id: 9,
              customer_id: 100,
              consultant_id: E2E_CONSULTANT.id,
              service_id: 31,
              title: 'Consultant detail test ticket',
              priority: 'high',
              status: 'in_progress',
              created_at: '2026-02-10T09:00:00.000000Z',
              updated_at: '2026-02-10T10:00:00.000000Z',
              property: { id: 9, property_name: 'Workspace Property' },
              service: { id: 31, name: 'Title Search' },
              customer: { id: 100, name: 'Customer Alpha', email: 'customer-alpha@wisebox.test' },
            },
          ],
          stats: {
            open_count: 2,
            awaiting_customer_count: 1,
            scheduled_count: 1,
            completed_count: 4,
          },
          per_page: 15,
          total: 1,
          last_page: 1,
        }),
      });
    });

    await page.goto('/consultant/tickets');
    await expect(page.getByRole('heading', { name: 'Consultant Workspace' })).toBeVisible();
    await expect(page.getByText('TK-2026-00044')).toBeVisible();

    await page.getByRole('link', { name: 'Open workspace' }).click();
    await expect(page).toHaveURL(/\/consultant\/tickets\/44$/);
    await expect(page.getByText('Update Ticket')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Comment' })).toBeVisible();
  });

  test('property detail renders assessment history', async ({ page }) => {
    await applyAuthenticatedSession(page);

    await mockNotificationEndpoints(page, []);

    await page.route('**/api/v1/properties/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 1,
            user_id: E2E_USER.id,
            property_name: 'History Ready Property',
            property_type_id: 1,
            ownership_status_id: 1,
            ownership_type_id: 1,
            property_type: { id: 1, name: 'Residential' },
            ownership_status: { id: 1, slug: 'purchased', display_label: 'Purchased' },
            ownership_type: { id: 1, name: 'Single' },
            country_code: 'BGD',
            division_id: null,
            district_id: null,
            upazila_id: null,
            mouza_id: null,
            division: null,
            district: null,
            upazila: null,
            mouza: null,
            address: '123 E2E Street',
            latitude: null,
            longitude: null,
            size_value: 1200,
            size_unit: 'sqft',
            description: 'E2E property detail test',
            completion_percentage: 82,
            completion_status: 'green',
            status: 'active',
            draft_data: null,
            last_draft_at: null,
            co_owners: [],
            documents: [],
            created_at: '2026-02-10T07:00:00.000000Z',
            updated_at: '2026-02-10T07:00:00.000000Z',
          },
        }),
      });
    });

    await page.route('**/api/v1/properties/1/assessments**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current_page: 1,
          data: [
            {
              id: 11,
              property_id: 1,
              assessed_by: E2E_USER.id,
              overall_score: 82,
              score_status: 'green',
              document_score: 44,
              ownership_score: 38,
              risk_factors: [],
              recommendations: [],
              summary: 'Most recent assessment',
              detailed_report: null,
              created_at: '2026-02-10T10:00:00.000000Z',
            },
            {
              id: 10,
              property_id: 1,
              assessed_by: E2E_USER.id,
              overall_score: 60,
              score_status: 'yellow',
              document_score: 30,
              ownership_score: 30,
              risk_factors: ['missing_docs'],
              recommendations: [],
              summary: 'Older assessment',
              detailed_report: null,
              created_at: '2026-02-08T10:00:00.000000Z',
            },
          ],
          first_page_url: '/api/v1/properties/1/assessments?page=1',
          from: 1,
          last_page: 1,
          last_page_url: '/api/v1/properties/1/assessments?page=1',
          links: [],
          next_page_url: null,
          path: '/api/v1/properties/1/assessments',
          per_page: 5,
          prev_page_url: null,
          to: 2,
          total: 2,
        }),
      });
    });

    await page.route('**/api/v1/properties/1/documents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            document_types: [],
            uploaded: [],
          },
        }),
      });
    });

    await page.goto('/properties/1');
    await expect(page.getByText('Assessment History')).toBeVisible();
    await expect(page.getByText('Most recent assessment')).toBeVisible();
    await expect(page.getByText('Older assessment')).toBeVisible();
  });
});
