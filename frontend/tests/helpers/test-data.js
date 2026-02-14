/**
 * Test Data Builders for E2E Testing
 *
 * Fluent API for creating test data with sensible defaults.
 * Uses builder pattern for composable, readable test setup.
 */

let propertyIdCounter = 1;
let orderIdCounter = 1;
let ticketIdCounter = 1;
let notificationIdCounter = 1;

/**
 * Reset all counters (useful for test isolation)
 */
function resetCounters() {
  propertyIdCounter = 1;
  orderIdCounter = 1;
  ticketIdCounter = 1;
  notificationIdCounter = 1;
}

/**
 * Property Builder
 *
 * Usage:
 * const property = new PropertyBuilder()
 *   .withName('Family Home')
 *   .asActive()
 *   .withDocuments(5)
 *   .build();
 */
class PropertyBuilder {
  constructor() {
    this.property = {
      id: propertyIdCounter++,
      user_id: 999,
      property_name: `Property ${propertyIdCounter}`,
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
      upazila: null,
      mouza: null,
      co_owners: [],
      documents: [],
    };
  }

  withId(id) {
    this.property.id = id;
    return this;
  }

  withUserId(userId) {
    this.property.user_id = userId;
    return this;
  }

  withName(name) {
    this.property.property_name = name;
    return this;
  }

  withType(typeId, typeName) {
    this.property.property_type_id = typeId;
    this.property.property_type = { id: typeId, name: typeName };
    return this;
  }

  withOwnershipStatus(statusId, displayLabel) {
    this.property.ownership_status_id = statusId;
    this.property.ownership_status = { id: statusId, display_label: displayLabel };
    return this;
  }

  withAddress(address) {
    this.property.address = address;
    return this;
  }

  withSize(value, unit) {
    this.property.size_value = value;
    this.property.size_unit = unit;
    return this;
  }

  withDescription(description) {
    this.property.description = description;
    return this;
  }

  withCompletion(percentage, status) {
    this.property.completion_percentage = percentage;
    this.property.completion_status = status; // red, yellow, green
    return this;
  }

  asActive() {
    this.property.status = 'active';
    this.property.completion_percentage = 100;
    this.property.completion_status = 'green';
    return this;
  }

  asDraft() {
    this.property.status = 'draft';
    return this;
  }

  withDocuments(count) {
    this.property.documents = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      property_id: this.property.id,
      document_type_id: 1,
      file_name: `document-${i + 1}.pdf`,
      file_path: `/documents/document-${i + 1}.pdf`,
      file_size: 1024 * 100,
      mime_type: 'application/pdf',
      is_primary: i === 0,
      status: 'uploaded',
      created_at: '2026-02-10T08:00:00.000000Z',
    }));
    return this;
  }

  withCoOwners(count) {
    this.property.co_owners = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Co-Owner ${i + 1}`,
      relationship: 'family',
      ownership_percentage: 100 / (count + 1),
    }));
    return this;
  }

  build() {
    return this.property;
  }
}

/**
 * Order Builder
 *
 * Usage:
 * const order = new OrderBuilder()
 *   .forUser(userId)
 *   .forProperty(propertyId)
 *   .withService(serviceId, serviceName, price)
 *   .asPending()
 *   .build();
 */
class OrderBuilder {
  constructor() {
    this.order = {
      id: orderIdCounter++,
      order_number: `WB-2026-${String(orderIdCounter).padStart(5, '0')}`,
      property_id: 1,
      user_id: 999,
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      currency: 'USD',
      payment_status: 'pending',
      status: 'pending',
      created_at: '2026-02-10T08:00:00.000000Z',
      updated_at: '2026-02-10T08:00:00.000000Z',
      items: [],
    };
  }

  withId(id) {
    this.order.id = id;
    return this;
  }

  forUser(userId) {
    this.order.user_id = userId;
    return this;
  }

  forProperty(propertyId) {
    this.order.property_id = propertyId;
    return this;
  }

  withService(serviceId, serviceName, price, quantity = 1) {
    const itemTotal = price * quantity;
    this.order.items.push({
      id: this.order.items.length + 1,
      order_id: this.order.id,
      service_id: serviceId,
      quantity,
      unit_price: price,
      total_price: itemTotal,
      service: {
        id: serviceId,
        name: serviceName,
      },
    });
    this.order.subtotal += itemTotal;
    this.order.total += itemTotal;
    return this;
  }

  withTax(tax) {
    this.order.tax = tax;
    this.order.total = this.order.subtotal + tax - this.order.discount;
    return this;
  }

  withDiscount(discount) {
    this.order.discount = discount;
    this.order.total = this.order.subtotal + this.order.tax - discount;
    return this;
  }

  asPending() {
    this.order.payment_status = 'pending';
    this.order.status = 'pending';
    return this;
  }

  asPaid() {
    this.order.payment_status = 'paid';
    this.order.status = 'processing';
    return this;
  }

  asCompleted() {
    this.order.payment_status = 'paid';
    this.order.status = 'completed';
    return this;
  }

  build() {
    return this.order;
  }
}

/**
 * Ticket Builder
 *
 * Usage:
 * const ticket = new TicketBuilder()
 *   .forCustomer(customerId)
 *   .forProperty(propertyId)
 *   .forService(serviceId, serviceName)
 *   .withTitle('Need help')
 *   .asAssigned(consultantId)
 *   .build();
 */
class TicketBuilder {
  constructor() {
    this.ticket = {
      id: ticketIdCounter++,
      ticket_number: `TK-2026-${String(ticketIdCounter).padStart(5, '0')}`,
      property_id: 1,
      customer_id: 999,
      consultant_id: null,
      service_id: 1,
      title: `Ticket ${ticketIdCounter}`,
      description: 'Default description',
      priority: 'medium',
      status: 'open',
      scheduled_at: null,
      meeting_duration_minutes: null,
      meeting_url: null,
      resolution_notes: null,
      created_at: '2026-02-10T08:00:00.000000Z',
      updated_at: '2026-02-10T08:00:00.000000Z',
      property: { id: 1, property_name: 'Default Property' },
      service: { id: 1, name: 'Default Service' },
      customer: { id: 999, name: 'E2E Customer', email: 'e2e-customer@wisebox.test' },
      consultant: null,
      comments: [],
    };
  }

  withId(id) {
    this.ticket.id = id;
    return this;
  }

  forCustomer(customerId, customerName = 'Customer', customerEmail = 'customer@wisebox.test') {
    this.ticket.customer_id = customerId;
    this.ticket.customer = { id: customerId, name: customerName, email: customerEmail };
    return this;
  }

  forProperty(propertyId, propertyName = 'Property') {
    this.ticket.property_id = propertyId;
    this.ticket.property = { id: propertyId, property_name: propertyName };
    return this;
  }

  forService(serviceId, serviceName) {
    this.ticket.service_id = serviceId;
    this.ticket.service = { id: serviceId, name: serviceName };
    return this;
  }

  withTitle(title) {
    this.ticket.title = title;
    return this;
  }

  withDescription(description) {
    this.ticket.description = description;
    return this;
  }

  withPriority(priority) {
    this.ticket.priority = priority; // low, medium, high, urgent
    return this;
  }

  asOpen() {
    this.ticket.status = 'open';
    this.ticket.consultant_id = null;
    this.ticket.consultant = null;
    return this;
  }

  asAssigned(consultantId, consultantName = 'Consultant', consultantEmail = 'consultant@wisebox.test') {
    this.ticket.status = 'assigned';
    this.ticket.consultant_id = consultantId;
    this.ticket.consultant = { id: consultantId, name: consultantName, email: consultantEmail };
    return this;
  }

  asInProgress(consultantId, consultantName = 'Consultant', consultantEmail = 'consultant@wisebox.test') {
    this.ticket.status = 'in_progress';
    this.ticket.consultant_id = consultantId;
    this.ticket.consultant = { id: consultantId, name: consultantName, email: consultantEmail };
    return this;
  }

  asCompleted(resolutionNotes = 'Resolved successfully') {
    this.ticket.status = 'completed';
    this.ticket.resolution_notes = resolutionNotes;
    return this;
  }

  withSchedule(scheduledAt, meetingUrl, durationMinutes = 30) {
    this.ticket.scheduled_at = scheduledAt;
    this.ticket.meeting_url = meetingUrl;
    this.ticket.meeting_duration_minutes = durationMinutes;
    return this;
  }

  withComments(count) {
    this.ticket.comments = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      ticket_id: this.ticket.id,
      user_id: this.ticket.customer_id,
      body: `Comment ${i + 1}`,
      is_internal: false,
      attachments: [],
      created_at: '2026-02-10T09:00:00.000000Z',
      user: { id: this.ticket.customer_id, name: this.ticket.customer.name },
    }));
    return this;
  }

  build() {
    return this.ticket;
  }
}

/**
 * Notification Builder
 *
 * Usage:
 * const notification = new NotificationBuilder()
 *   .forUser(userId)
 *   .ofType('ticket.assigned')
 *   .withTitle('Ticket assigned')
 *   .asUnread()
 *   .build();
 */
class NotificationBuilder {
  constructor() {
    this.notification = {
      id: `notif-${notificationIdCounter++}`,
      user_id: 999,
      type: 'general',
      title: 'Notification',
      body: null,
      data: null,
      read_at: null,
      created_at: '2026-02-10T10:00:00.000000Z',
    };
  }

  forUser(userId) {
    this.notification.user_id = userId;
    return this;
  }

  ofType(type) {
    this.notification.type = type;
    return this;
  }

  withTitle(title) {
    this.notification.title = title;
    return this;
  }

  withBody(body) {
    this.notification.body = body;
    return this;
  }

  withData(data) {
    this.notification.data = data;
    return this;
  }

  asRead() {
    this.notification.read_at = '2026-02-10T11:00:00.000000Z';
    return this;
  }

  asUnread() {
    this.notification.read_at = null;
    return this;
  }

  build() {
    return this.notification;
  }
}

/**
 * Build paginated response
 *
 * @param {Array} items - Array of items
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @returns {Object} Paginated response
 */
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
    first_page_url: `/api/v1/?page=1`,
    from: data.length ? offset + 1 : null,
    last_page: lastPage,
    last_page_url: `/api/v1/?page=${lastPage}`,
    links: [],
    next_page_url: currentPage < lastPage ? `/api/v1/?page=${currentPage + 1}` : null,
    path: '/api/v1/',
    per_page: safePerPage,
    prev_page_url: currentPage > 1 ? `/api/v1/?page=${currentPage - 1}` : null,
    to: data.length ? offset + data.length : null,
    total,
  };
}

module.exports = {
  PropertyBuilder,
  OrderBuilder,
  TicketBuilder,
  NotificationBuilder,
  buildPaginated,
  resetCounters,
};
