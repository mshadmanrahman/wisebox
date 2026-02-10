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

async function applyAuthenticatedSession(page) {
  await page.context().addCookies([
    {
      name: 'wisebox_token',
      value: AUTH_TOKEN,
      domain: '127.0.0.1',
      path: '/',
      sameSite: 'Lax',
    },
  ]);

  await page.addInitScript((token) => {
    localStorage.setItem('wisebox_token', token);
    localStorage.setItem(
      'wisebox-auth',
      JSON.stringify({
        state: { token, user: null, isAuthenticated: true },
        version: 0,
      })
    );
  }, AUTH_TOKEN);
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
