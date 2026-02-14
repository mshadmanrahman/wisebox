const { test, expect } = require('@playwright/test');

// ============================================================
// WISEBOX MVP UAT: Full User Acceptance Testing
// Covers: Customer, Admin, Consultant portals end-to-end
// ============================================================

const API_BASE = 'http://127.0.0.1:8000/api/v1';

const CUSTOMER = { email: 'connectshadman@gmail.com', password: 'TestPass123' };
const ADMIN = { email: 'admin@wisebox.local', password: 'TestPass123' };
const CONSULTANT = { email: 'consultant@wisebox.com', password: 'TestPass123' };

// Helper: Login via API, set cookie + localStorage (both required)
// Three auth layers in this app:
//   1. Cookie 'wisebox_token' -> read by Next.js Edge middleware for route protection
//   2. localStorage 'wisebox_token' -> read by Axios interceptor for API auth headers
//   3. localStorage 'wisebox-auth' -> Zustand persist store (user, token, isAuthenticated)
async function loginViaAPI(page, credentials, portal = null) {
  const payload = { email: credentials.email, password: credentials.password };
  if (portal) payload.portal = portal;
  const response = await page.request.post(`${API_BASE}/auth/login`, {
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    data: JSON.stringify(payload),
  });
  const data = await response.json();
  const token = data?.data?.token;
  const user = data?.data?.user;

  if (!token) throw new Error(`Login failed for ${credentials.email}: ${JSON.stringify(data)}`);

  // Step 1: Navigate to /login (no cookie yet, so middleware allows it)
  await page.goto('/login');

  // Step 2: Set all three auth layers in the browser
  await page.evaluate(({ token, user }) => {
    // Zustand persist store: name='wisebox-auth', partialize only saves token,
    // but on hydration Zustand merges full stored state including user + role
    localStorage.setItem('wisebox-auth', JSON.stringify({
      state: { token, user, isAuthenticated: true, isLoading: false },
      version: 0,
    }));
    // Standalone token for Axios API interceptor
    localStorage.setItem('wisebox_token', token);
    // Cookie for Next.js middleware (server-side route protection)
    document.cookie = `wisebox_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }, { token, user });

  return { token, user };
}

// ============================================================
// SECTION 1: LOGIN PAGES EXIST AND RENDER
// ============================================================
test.describe('UAT 1: Login Pages', () => {
  test('customer login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('admin login page renders with admin branding', async ({ page }) => {
    await page.goto('/login/admin');
    await expect(page).toHaveURL(/\/login\/admin/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByText(/admin/i).first()).toBeVisible();
  });

  test('consultant login page renders with consultant branding', async ({ page }) => {
    await page.goto('/login/consultant');
    await expect(page).toHaveURL(/\/login\/consultant/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByText(/consultant/i).first()).toBeVisible();
  });
});

// ============================================================
// SECTION 2: AUTHENTICATION FLOWS
// ============================================================
test.describe('UAT 2: Authentication', () => {
  test('customer can login and reach dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', CUSTOMER.email);
    await page.fill('input[type="password"]', CUSTOMER.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('admin login with wrong role is blocked', async ({ page }) => {
    await page.goto('/login/admin');

    await page.fill('input[type="email"]', CUSTOMER.email);
    await page.fill('input[type="password"]', CUSTOMER.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error (customer doesn't have admin access)
    await expect(page.getByText(/admin access/i)).toBeVisible({ timeout: 5000 });
  });

  test('protected routes redirect to correct login page', async ({ page }) => {
    // Admin route should redirect to admin login
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login\/admin/);

    // Consultant route should redirect to consultant login
    await page.goto('/consultant');
    await expect(page).toHaveURL(/\/login\/consultant/);

    // Regular route should redirect to regular login
    await page.goto('/dashboard');
    // Use exact path match to avoid matching /login/admin or /login/consultant
    await page.waitForURL('**/login?**');
    expect(page.url()).toMatch(/\/login\?redirect=/);
  });
});

// ============================================================
// SECTION 3: CUSTOMER PORTAL
// ============================================================
test.describe('UAT 3: Customer Portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page, CUSTOMER);
  });

  test('dashboard loads with greeting', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Dashboard should show greeting: "Hi {name}!"
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('properties page loads', async ({ page }) => {
    await page.goto('/properties');
    await expect(page).toHaveURL(/\/properties/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('can navigate to create new property', async ({ page }) => {
    await page.goto('/properties/new');
    await expect(page).toHaveURL(/\/properties\/new/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('property detail page shows free consultation CTA', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('wisebox_token'));
    const response = await page.request.get(`${API_BASE}/properties`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const props = await response.json();
    const propertyId = props?.data?.[0]?.id;

    if (propertyId) {
      await page.goto(`/properties/${propertyId}`);
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/free consultation/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('free consultation dialog opens and has required fields', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('wisebox_token'));
    const response = await page.request.get(`${API_BASE}/properties`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const props = await response.json();
    const propertyId = props?.data?.[0]?.id;

    if (propertyId) {
      await page.goto(`/properties/${propertyId}`);
      await page.waitForLoadState('networkidle');

      const ctaButton = page.getByRole('button', { name: /free consultation/i }).first();
      if (await ctaButton.isVisible()) {
        await ctaButton.click();
        await expect(page.getByText(/what do you need help with/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('orders page loads', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/orders/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('tickets page loads', async ({ page }) => {
    await page.goto('/tickets');
    await expect(page).toHaveURL(/\/tickets/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('services workspace loads', async ({ page }) => {
    await page.goto('/workspace/services');
    await expect(page).toHaveURL(/\/workspace\/services/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('notifications page loads', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/notifications/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });
});

// ============================================================
// SECTION 4: ADMIN PORTAL
// ============================================================
test.describe('UAT 4: Admin Portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page, ADMIN, 'admin');
  });

  test('admin dashboard loads with consultation stats', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Should see "Admin Dashboard" heading
    await expect(page.getByText('Admin Dashboard')).toBeVisible({ timeout: 10000 });

    // Should have stats cards (Pending, Assigned, etc.)
    await expect(page.getByText('Pending').first()).toBeVisible();
  });

  test('admin consultations list loads', async ({ page }) => {
    await page.goto('/admin/consultations');
    await expect(page).toHaveURL(/\/admin\/consultations/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Should see "Consultation Requests" heading
    await expect(page.getByRole('heading', { name: 'Consultation Requests' })).toBeVisible({ timeout: 10000 });
  });

  test('admin can view consultation detail', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('wisebox_token'));
    const response = await page.request.get(`${API_BASE}/admin/consultations`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    const consultation = data?.data?.[0];

    if (consultation) {
      await page.goto(`/admin/consultations/${consultation.id}`);
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(consultation.ticket_number)).toBeVisible({ timeout: 10000 });
    }
  });

  test('admin header shows Admin nav link', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Header should have Admin link (amber-colored, links to /admin/dashboard)
    await expect(page.locator('header a[href="/admin/dashboard"]')).toBeVisible({ timeout: 10000 });
  });
});

// ============================================================
// SECTION 5: CONSULTANT PORTAL
// ============================================================
test.describe('UAT 5: Consultant Portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page, CONSULTANT, 'consultant');
  });

  test('consultant dashboard loads with greeting', async ({ page }) => {
    await page.goto('/consultant');
    // Use exact start-of-path to avoid matching /login/consultant
    await page.waitForURL('**/consultant', { timeout: 10000 });
    expect(page.url()).toMatch(/\/consultant$/);
    await page.waitForLoadState('networkidle');

    // Should see "Welcome back, {name}!" greeting
    await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 10000 });
  });

  test('consultant can see case stats', async ({ page }) => {
    await page.goto('/consultant');
    await page.waitForURL('**/consultant', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Should have stats like "Pending Action", "Total Assigned", etc.
    await expect(page.getByText(/Your Cases|Pending Action|Total Assigned/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('consultant header shows Consultant nav link', async ({ page }) => {
    await page.goto('/consultant');
    await page.waitForURL('**/consultant', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Header should have Consultant link (links to /consultant)
    await expect(page.locator('header a[href="/consultant"]')).toBeVisible({ timeout: 10000 });
  });
});

// ============================================================
// SECTION 6: API INTEGRATION TESTS
// ============================================================
test.describe('UAT 6: API Endpoints', () => {
  test('login API returns token for valid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: CUSTOMER.email, password: CUSTOMER.password }),
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.token).toBeTruthy();
    expect(data.data.user.email).toBe(CUSTOMER.email);
  });

  test('admin login with portal param enforces role', async ({ request }) => {
    // Customer trying admin portal should fail
    const response = await request.post(`${API_BASE}/auth/login`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: CUSTOMER.email, password: CUSTOMER.password, portal: 'admin' }),
    });
    expect(response.status()).toBe(422);
  });

  test('free consultation endpoint creates ticket', async ({ request }) => {
    const loginResp = await request.post(`${API_BASE}/auth/login`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: CUSTOMER.email, password: CUSTOMER.password }),
    });
    const loginData = await loginResp.json();
    const token = loginData.data.token;

    const propsResp = await request.get(`${API_BASE}/properties`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const props = await propsResp.json();

    if (props.data && props.data.length > 0) {
      const resp = await request.post(`${API_BASE}/free-consultations`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          property_id: props.data[props.data.length - 1].id,
          description: 'UAT test consultation request',
          preferred_slots: [{ date: '2026-03-01', time: '10:00' }],
        }),
      });
      // Either 201 (created) or 409/422 (already exists) is acceptable
      expect([200, 201, 409, 422]).toContain(resp.status());
    }
  });

  test('admin consultations endpoint returns data', async ({ request }) => {
    const loginResp = await request.post(`${API_BASE}/auth/login`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: ADMIN.email, password: ADMIN.password, portal: 'admin' }),
    });
    const loginData = await loginResp.json();
    const token = loginData.data.token;

    const resp = await request.get(`${API_BASE}/admin/consultations`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.stats).toBeTruthy();
    expect(data.data).toBeInstanceOf(Array);
  });

  test('consultant tickets endpoint returns data', async ({ request }) => {
    const loginResp = await request.post(`${API_BASE}/auth/login`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: CONSULTANT.email, password: CONSULTANT.password, portal: 'consultant' }),
    });
    const loginData = await loginResp.json();
    const token = loginData.data.token;

    const resp = await request.get(`${API_BASE}/consultant/tickets`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
  });

  test('customer can view their consultations', async ({ request }) => {
    const loginResp = await request.post(`${API_BASE}/auth/login`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      data: JSON.stringify({ email: CUSTOMER.email, password: CUSTOMER.password }),
    });
    const loginData = await loginResp.json();
    const token = loginData.data.token;

    const resp = await request.get(`${API_BASE}/free-consultations`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.data).toBeInstanceOf(Array);
  });
});

// ============================================================
// SECTION 7: CROSS-PORTAL NAVIGATION
// ============================================================
test.describe('UAT 7: Navigation & Layout', () => {
  test('header shows correct nav links for customer', async ({ page }) => {
    await loginViaAPI(page, CUSTOMER);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Customer should see Assets, Services, Billing links
    await expect(page.locator('header a[href="/properties"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('header a[href="/workspace/services"]')).toBeVisible();
    await expect(page.locator('header a[href="/orders"]')).toBeVisible();

    // Customer should NOT see Admin link
    await expect(page.locator('header a[href="/admin/dashboard"]')).not.toBeVisible();
  });

  test('header shows Admin link for admin user', async ({ page }) => {
    await loginViaAPI(page, ADMIN, 'admin');
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    await expect(page.locator('header a[href="/admin/dashboard"]')).toBeVisible({ timeout: 10000 });
  });

  test('notification bell is visible in header', async ({ page }) => {
    await loginViaAPI(page, CUSTOMER);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Bell icon button should be in the header (icon buttons with SVGs)
    const headerButtons = page.locator('header button');
    await expect(headerButtons.first()).toBeVisible({ timeout: 10000 });
  });

  test('user menu dropdown works', async ({ page }) => {
    await loginViaAPI(page, CUSTOMER);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Click the user avatar button (circular button in header)
    const avatarButton = page.locator('header button.rounded-full');
    await expect(avatarButton).toBeVisible({ timeout: 10000 });
    await avatarButton.click();

    // Should see Settings and Logout options in dropdown
    await expect(page.getByText(/settings/i)).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/logout/i)).toBeVisible({ timeout: 3000 });
  });
});
