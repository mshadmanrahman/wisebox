/**
 * API Mocks for E2E Testing
 *
 * Centralized mocking for external services (Stripe, Calendly, OTP).
 * Backend API uses real endpoints, external services are mocked.
 */

const { buildPaginated } = require('./test-data');

/**
 * Mock Stripe payment intent creation
 *
 * @param {Page} page - Playwright page instance
 * @param {Object} options - Mock options
 */
async function mockStripePayment(page, options = {}) {
  const {
    shouldSucceed = true,
    clientSecret = 'pi_test_secret_abc123',
    errorMessage = 'Payment failed',
  } = options;

  await page.route('**/api/v1/orders/*/payment-intent', async (route) => {
    if (shouldSucceed) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            client_secret: clientSecret,
            publishable_key: 'pk_test_fake',
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: errorMessage,
        }),
      });
    }
  });

  // Mock Stripe.js SDK (intercepted via page.addInitScript if needed)
  await page.addInitScript(() => {
    window.mockStripeConfirmPayment = async () => {
      return {
        error: null,
        paymentIntent: {
          id: 'pi_test_abc123',
          status: 'succeeded',
        },
      };
    };
  });
}

/**
 * Mock Calendly scheduling link generation
 *
 * @param {Page} page - Playwright page instance
 * @param {Object} options - Mock options
 */
async function mockCalendlyScheduling(page, options = {}) {
  const {
    shouldSucceed = true,
    schedulingUrl = 'https://calendly.com/wisebox-consultant/30min?invitee_email=customer@wisebox.test',
    errorMessage = 'Consultant calendar is not configured.',
  } = options;

  await page.route('**/api/v1/tickets/*/schedule-link', async (route) => {
    if (shouldSucceed) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            scheduling_url: schedulingUrl,
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: errorMessage,
        }),
      });
    }
  });
}

/**
 * Mock OTP verification (bypass with test code)
 *
 * @param {Page} page - Playwright page instance
 * @param {Object} options - Mock options
 */
async function mockOTPVerification(page, options = {}) {
  const {
    testCode = '000000',
    shouldBypass = true,
  } = options;

  // Mock OTP send endpoint
  await page.route('**/api/v1/auth/otp/send', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: shouldBypass
          ? `OTP sent (test mode: use code ${testCode})`
          : 'OTP sent successfully',
      }),
    });
  });

  // Mock OTP verify endpoint
  await page.route('**/api/v1/auth/otp/verify', async (route) => {
    const payload = route.request().postDataJSON();
    const isTestCode = payload.code === testCode;

    if (shouldBypass && isTestCode) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            verified: true,
            token: 'e2e-auth-token',
          },
          message: 'OTP verified successfully',
        }),
      });
    } else if (shouldBypass && !isTestCode) {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: `Invalid OTP. Use test code ${testCode} in E2E mode.`,
        }),
      });
    } else {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Invalid OTP code',
        }),
      });
    }
  });
}

/**
 * Mock notification endpoints with state management
 *
 * @param {Page} page - Playwright page instance
 * @param {Array} initialNotifications - Initial notification array
 * @returns {Object} Notification state manager
 */
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

  return {
    getNotifications: () => notifications,
    addNotification: (notification) => notifications.push(notification),
    clearNotifications: () => { notifications = []; },
  };
}

/**
 * Mock file upload to S3 (bypass actual S3, use local storage mock)
 *
 * @param {Page} page - Playwright page instance
 */
async function mockFileUpload(page) {
  await page.route('**/api/v1/properties/*/documents', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    // Simulate successful upload
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: Math.floor(Math.random() * 10000),
          property_id: 1,
          document_type_id: 1,
          file_name: 'test-document.pdf',
          file_path: '/storage/testing/documents/test-document.pdf',
          file_size: 1024 * 100,
          mime_type: 'application/pdf',
          is_primary: false,
          status: 'uploaded',
          created_at: new Date().toISOString(),
        },
        message: 'Document uploaded successfully',
      }),
    });
  });
}

/**
 * Mock email sending (log driver in test mode)
 *
 * @param {Page} page - Playwright page instance
 */
async function mockEmailSending(page) {
  // Emails are logged to backend/storage/logs/laravel.log in test mode
  // No frontend mock needed, but we can track sent emails if needed
  const sentEmails = [];

  page.on('response', async (response) => {
    if (response.url().includes('/api/v1/') && response.ok()) {
      // Track any API responses that might trigger emails
      // This is informational only
    }
  });

  return {
    getSentEmails: () => sentEmails,
  };
}

/**
 * Mock dashboard summary endpoint
 *
 * @param {Page} page - Playwright page instance
 * @param {Object} data - Dashboard data
 */
async function mockDashboardSummary(page, data) {
  const defaultData = {
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
    ...data,
  };

  await page.route('**/api/v1/dashboard/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: defaultData,
      }),
    });
  });
}

module.exports = {
  mockStripePayment,
  mockCalendlyScheduling,
  mockOTPVerification,
  mockNotificationEndpoints,
  mockFileUpload,
  mockEmailSending,
  mockDashboardSummary,
};
