// ==========================================
// Wisebox TypeScript Type Definitions
// Matches the API contract from implementation plan
// ==========================================

// === Auth ===
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  country_of_residence: string | null;
  avatar_url: string | null;
  role: 'customer' | 'consultant' | 'admin' | 'super_admin';
  email_verified_at: string | null;
  phone_verified_at: string | null;
  status: 'active' | 'inactive' | 'suspended';
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: number;
  user_id: number;
  date_of_birth: string | null;
  nationality: string | null;
  nid_number: string | null;
  passport_number: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  preferred_language: 'en' | 'bn';
  timezone: string;
}

export interface ConsultantProfile {
  id: number;
  user_id: number;
  specialization: string[];
  credentials: string | null;
  years_experience: number | null;
  languages: string[];
  calendly_url: string | null;
  hourly_rate: number | null;
  is_available: boolean;
  rating: number;
  total_reviews: number;
  max_concurrent_tickets: number;
}

export interface AuthResponse {
  data: {
    user: User;
    token: string;
    otp_required?: boolean;
    is_new_user?: boolean;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  country_of_residence: string;
  terms_accepted: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

// === Property ===
export interface Property {
  id: number;
  user_id: number;
  property_name: string;
  property_type_id: number;
  ownership_status_id: number;
  ownership_type_id: number;
  property_type?: PropertyType;
  ownership_status?: OwnershipStatus;
  ownership_type?: OwnershipType;
  country_code: string;
  division_id: number | null;
  district_id: number | null;
  upazila_id: number | null;
  mouza_id: number | null;
  division?: Division;
  district?: District;
  upazila?: Upazila;
  mouza?: Mouza;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  size_value: number | null;
  size_unit: SizeUnit | null;
  description: string | null;
  completion_percentage: number;
  completion_status: 'red' | 'yellow' | 'green';
  status: PropertyStatus;
  draft_data: Record<string, unknown> | null;
  last_draft_at: string | null;
  co_owners?: CoOwner[];
  documents?: PropertyDocument[];
  created_at: string;
  updated_at: string;
}

export type SizeUnit = 'sqft' | 'katha' | 'bigha' | 'acre' | 'decimal' | 'shotangsho';
export type PropertyStatus = 'draft' | 'active' | 'under_review' | 'verified' | 'archived';

export interface PropertyType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface OwnershipStatus {
  id: number;
  name: string;
  slug: string;
  display_label: string;
  bengali_label: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface OwnershipType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  requires_co_owners: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface CoOwner {
  id: number;
  property_id: number;
  name: string;
  relationship: string | null;
  ownership_percentage: number;
  phone: string | null;
  email: string | null;
  nid_number: string | null;
}

export interface CreatePropertyData {
  property_name: string;
  property_type_id: number;
  ownership_status_id: number;
  ownership_type_id: number;
  division_id?: number;
  district_id?: number;
  upazila_id?: number;
  mouza_id?: number;
  address?: string;
  size_value?: number;
  size_unit?: SizeUnit;
  description?: string;
  co_owners?: Omit<CoOwner, 'id' | 'property_id'>[];
}

// === Documents ===
export interface DocumentType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: 'primary' | 'secondary';
  is_required: boolean;
  guidance_text: string | null;
  missing_guidance: string | null;
  accepted_formats: string[];
  max_file_size_mb: number;
  score_weight: number;
  conditional_on_ownership: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface PropertyDocument {
  id: number;
  property_id: number;
  document_type_id: number;
  document_type?: DocumentType;
  user_id: number;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: 'uploaded' | 'under_review' | 'verified' | 'rejected';
  has_document: boolean;
  review_notes: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// === Services ===
export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Service {
  id: number;
  category_id: number | null;
  category?: ServiceCategory;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  pricing_type: 'free' | 'paid' | 'physical';
  price: number;
  currency: string;
  stripe_price_id: string | null;
  estimated_duration_minutes: number | null;
  requires_meeting: boolean;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  icon: string | null;
}

// === Orders ===
export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  property_id: number | null;
  property?: Property;
  items?: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  paid_at: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  service_id: number;
  service?: Service;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateOrderData {
  property_id: number;
  items: { service_id: number }[];
}

export interface CheckoutResponse {
  data: {
    checkout_url: string;
    session_id: string;
  };
}

// === Tickets ===
export interface Ticket {
  id: number;
  ticket_number: string;
  order_id: number | null;
  property_id: number;
  property?: Property;
  customer_id: number;
  consultant_id: number | null;
  consultant?: User;
  service_id: number | null;
  service?: Service;
  title: string;
  description: string | null;
  calendly_event_id: string | null;
  calendly_event_url: string | null;
  meeting_url: string | null;
  scheduled_at: string | null;
  meeting_duration_minutes: number | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: TicketStatus;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  comments?: TicketComment[];
}

export type TicketStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_customer'
  | 'awaiting_consultant'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  user?: User;
  body: string;
  is_internal: boolean;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
}

// === Locations ===
export interface Division {
  id: number;
  name: string;
  bn_name: string | null;
}

export interface District {
  id: number;
  division_id: number;
  name: string;
  bn_name: string | null;
}

export interface Upazila {
  id: number;
  district_id: number;
  name: string;
  bn_name: string | null;
}

export interface Mouza {
  id: number;
  upazila_id: number;
  name: string;
  bn_name: string | null;
  jl_number: string | null;
}

// === Assessment ===
export interface PropertyAssessment {
  id: number;
  property_id: number;
  assessed_by: number | null;
  overall_score: number;
  score_status: 'red' | 'yellow' | 'green';
  document_score: number;
  ownership_score: number;
  risk_factors: string[] | null;
  recommendations: RecommendedService[] | null;
  summary: string | null;
  detailed_report: string | null;
  created_at: string;
}

export interface RecommendedService {
  id: number;
  name: string;
  price: number;
}

export interface FreeAssessmentData {
  email: string;
  answers: { question_id: number; answer: boolean }[];
}

export interface FreeAssessmentResult {
  data: {
    score: number;
    status: 'red' | 'yellow' | 'green';
    summary: string;
    gaps: string[];
    recommended_services: RecommendedService[];
  };
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  weight: number;
  doc_type: string | null;
}

// === Notifications ===
export interface Notification {
  id: string;
  user_id: number;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

// === Sliders ===
export interface Slider {
  id: number;
  title: string;
  subtitle: string | null;
  image_path: string;
  cta_text: string | null;
  cta_url: string | null;
  is_active: boolean;
  sort_order: number;
}

// === FAQs ===
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  is_active: boolean;
  sort_order: number;
}

// === API Response Wrappers ===
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}
