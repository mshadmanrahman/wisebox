---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Wisebox E2E Test Suite

Comprehensive end-to-end testing for Wisebox frontend using Playwright with hybrid approach (real backend + mocked external services).

## Test Structure

```
tests/
├── e2e/
│   ├── smoke.spec.js (legacy - 10 tests)
│   └── authenticated-workflows.spec.js (legacy - 30 tests)
├── unauthenticated/
│   ├── marketing.spec.js (7 tests)
│   ├── assessment.spec.js (5 tests)
│   └── auth.spec.js (10 tests)
├── authenticated/
│   ├── dashboard.spec.js (9 tests)
│   ├── properties.spec.js (5 tests)
│   ├── documents.spec.js (TODO)
│   ├── orders.spec.js (TODO)
│   └── tickets.spec.js (TODO)
├── integration/
│   └── property-to-order.spec.js (TODO - full flow)
└── helpers/
    ├── auth-helpers.js (auth fixtures)
    ├── test-data.js (data builders)
    └── api-mocks.js (external service mocks)
```

## Helper Modules

### Auth Helpers (`helpers/auth-helpers.js`)

Provides reusable authentication fixtures with automatic cleanup:

```javascript
const { test } = require('./helpers/auth-helpers');

test('my test', async ({ authenticatedCustomer }) => {
  const { page, user } = authenticatedCustomer;
  // Test with authenticated customer
  // Cleanup happens automatically
});
```

**Available Fixtures**:
- `authenticatedCustomer` - Basic customer user
- `authenticatedCustomerWithProfile` - Customer with full profile
- `authenticatedConsultant` - Consultant user

### Test Data Builders (`helpers/test-data.js`)

Fluent API for creating test data:

```javascript
const { PropertyBuilder, OrderBuilder, TicketBuilder } = require('./helpers/test-data');

// Build property with fluent API
const property = new PropertyBuilder()
  .withName('Family Home')
  .asActive()
  .withDocuments(5)
  .withCompletion(90, 'green')
  .build();

// Build order
const order = new OrderBuilder()
  .forUser(userId)
  .forProperty(propertyId)
  .withService(serviceId, 'Title Search', 150)
  .asPaid()
  .build();

// Build ticket
const ticket = new TicketBuilder()
  .forCustomer(customerId, 'John Doe')
  .forProperty(propertyId, 'Property Name')
  .withTitle('Need help')
  .asAssigned(consultantId, 'Consultant Name')
  .withComments(3)
  .build();
```

### API Mocks (`helpers/api-mocks.js`)

Centralized mocking for external services:

```javascript
const {
  mockStripePayment,
  mockCalendlyScheduling,
  mockOTPVerification,
  mockNotificationEndpoints,
  mockFileUpload,
} = require('./helpers/api-mocks');

// Mock Stripe payment
await mockStripePayment(page, { shouldSucceed: true });

// Mock Calendly scheduling
await mockCalendlyScheduling(page, {
  schedulingUrl: 'https://calendly.com/...',
});

// Mock OTP with bypass code
await mockOTPVerification(page, {
  testCode: '000000',
  shouldBypass: true,
});

// Mock notifications with state management
const notificationManager = await mockNotificationEndpoints(page, [
  // initial notifications
]);
```

## Mock Strategy

### What's Real
- **Backend API**: All Laravel API endpoints (`/api/v1/*`)
- **Database**: SQLite in-memory (fast, isolated)
- **Frontend**: Actual Next.js app on `localhost:3000`

### What's Mocked
- **Stripe**: Payment intent creation and confirmation
- **Calendly**: Scheduling link generation and webhooks
- **OTP/SMS**: Bypass with test code `000000`
- **Email**: Log driver (no actual emails sent)
- **File Storage**: Local storage instead of S3

## Running Tests

### Prerequisites
```bash
# Use Node 22
nvm use 22

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Suite
```bash
# Unauthenticated tests only
npx playwright test tests/unauthenticated

# Authenticated tests only
npx playwright test tests/authenticated

# Single file
npx playwright test tests/unauthenticated/auth.spec.js
```

### Debug Mode
```bash
# Run with headed browser
npx playwright test --headed

# Debug specific test
npx playwright test --debug tests/unauthenticated/auth.spec.js
```

### Watch Mode
```bash
# Re-run tests on file changes
npx playwright test --watch
```

## Performance Targets

- **Full E2E suite**: <15 minutes
- **Smoke tests**: <2 minutes
- **Individual test**: <30 seconds avg
- **Test database setup**: <1 second per test

## Writing New Tests

### 1. Unauthenticated Test Example

```javascript
const { test, expect } = require('@playwright/test');

test.describe('My feature (unauthenticated)', () => {
  test('feature works', async ({ page }) => {
    await page.goto('/my-page');
    await expect(page.getByText('Hello')).toBeVisible();
  });
});
```

### 2. Authenticated Test Example

```javascript
const { test, expect } = require('../helpers/auth-helpers');
const { mockNotificationEndpoints } = require('../helpers/api-mocks');

test.describe('My feature (authenticated)', () => {
  test('feature works', async ({ authenticatedCustomer }) => {
    const { page, user } = authenticatedCustomer;

    await mockNotificationEndpoints(page, []);
    await page.goto('/my-page');

    await expect(page.getByText(`Hello ${user.name}`)).toBeVisible();
  });
});
```

### 3. Using Data Builders

```javascript
const { PropertyBuilder } = require('../helpers/test-data');

test('property list displays properties', async ({ authenticatedCustomer }) => {
  const { page, user } = authenticatedCustomer;

  const property = new PropertyBuilder()
    .withUserId(user.id)
    .withName('Test Property')
    .asActive()
    .build();

  // Mock API to return this property
  await page.route('**/api/v1/properties', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ data: [property] }),
    });
  });

  await page.goto('/properties');
  await expect(page.getByText('Test Property')).toBeVisible();
});
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use data builders for fresh test data
- Auth fixtures auto-cleanup after tests

### 2. Waiting for Elements
```javascript
// ✅ Good - explicit wait
await expect(page.getByText('Loaded')).toBeVisible();

// ❌ Bad - arbitrary timeout
await page.waitForTimeout(1000);
```

### 3. API Mocking
```javascript
// ✅ Good - specific route matching
await page.route('**/api/v1/properties/1', async (route) => {
  await route.fulfill({ status: 200, body: JSON.stringify(data) });
});

// ❌ Bad - overly broad pattern
await page.route('**/*', async (route) => { /* ... */ });
```

### 4. Error Handling
```javascript
// ✅ Good - test error states
test('shows error on API failure', async ({ page }) => {
  await page.route('**/api/v1/data', async (route) => {
    await route.fulfill({ status: 500 });
  });

  await page.goto('/page');
  await expect(page.getByText(/error/i)).toBeVisible();
});
```

## Debugging Tips

### 1. View Test in Browser
```bash
npx playwright test --headed --debug
```

### 2. Trace Viewer
```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### 3. Screenshot on Failure
Tests automatically capture screenshots on failure in `test-results/`.

### 4. Console Logs
```javascript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E tests
  run: |
    nvm use 22
    npm ci
    npx playwright install --with-deps
    npm run test:e2e
```

## Test Coverage Goals

- **Unauthenticated**: 100% (22 tests) ✅
- **Authenticated**: 50% (14/28 tests) 🟡
- **Integration**: 0% (0/5 tests) ⚠️
- **Overall Target**: 80%+ coverage

## Roadmap

### Phase 1: Foundation (✅ Complete)
- [x] Helper infrastructure
- [x] Auth fixtures
- [x] Data builders
- [x] API mocks
- [x] Unauthenticated tests

### Phase 2: Authenticated (🟡 In Progress)
- [x] Dashboard tests (9 tests)
- [x] Properties tests (5 tests)
- [ ] Documents tests (6 tests)
- [ ] Orders tests (7 tests)
- [ ] Tickets tests (8 tests)

### Phase 3: Integration (⚠️ Pending)
- [ ] Property → Order → Ticket flow
- [ ] Document upload → Assessment flow
- [ ] Multi-page checkout flow

## Maintenance

### Updating Test Data
- Modify builders in `helpers/test-data.js`
- Builders are versioned with the API schema

### Updating Mocks
- External service mocks in `helpers/api-mocks.js`
- Update when external API contracts change

### Performance Monitoring
- Run `npm run test:e2e -- --reporter=html`
- Check `playwright-report/index.html` for timing

---

**Last Updated**: 2026-02-11
**Test Count**: 61 tests (22 unauthenticated, 14 authenticated, 25 legacy)
**Maintainer**: E2E Testing Team

## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
