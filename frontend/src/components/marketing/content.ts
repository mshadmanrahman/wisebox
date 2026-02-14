export interface MarketingPainPoint {
  title: string;
  description: string;
}

export interface MarketingStep {
  step: string;
  title: string;
  description: string;
}

export interface MarketingFeature {
  title: string;
  description: string;
  comingSoon?: boolean;
}

export interface PricingPlan {
  name: string;
  price: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
  features: string[];
}

export interface MarketingFaq {
  question: string;
  answer: string;
}

export const marketingPainPoints: MarketingPainPoint[] = [
  {
    title: 'Scattered records across family members',
    description:
      'Documents are often stored in multiple homes and inboxes, making legal or emergency access difficult.',
  },
  {
    title: 'No visibility into property status',
    description:
      'Diaspora owners cannot easily track pending issues, legal updates, or municipal requirements from abroad.',
  },
  {
    title: 'Reactive support instead of proactive planning',
    description:
      'Most owners only act when there is a crisis, causing delays, stress, and avoidable legal costs.',
  },
  {
    title: 'Unclear ownership and inheritance documentation',
    description:
      'Lack of structured records creates confusion for families and makes succession planning much harder.',
  },
];

export const marketingHowItWorks: MarketingStep[] = [
  {
    step: '01',
    title: 'Add your property profile',
    description:
      'Capture location, ownership details, and baseline context in a single digital record.',
  },
  {
    step: '02',
    title: 'Upload and assess documents',
    description:
      'Get a clarity score with actionable recommendations for missing or weak documentation.',
  },
  {
    step: '03',
    title: 'Use services as needed',
    description:
      'Book legal, valuation, or retrieval support and track every ticket from the same workspace.',
  },
];

export const marketingFeatures: MarketingFeature[] = [
  {
    title: 'Smart Document Management',
    description: 'Track required documents, upload history, and ownership evidence in one secure timeline.',
  },
  {
    title: 'Property Monitoring',
    description: 'Stay updated on property progress, status changes, and action items from anywhere.',
  },
  {
    title: 'Legal Consultations',
    description: 'Connect with consultants for legal and process guidance linked directly to your ticket thread.',
  },
  {
    title: 'Digital Will Creation',
    description: 'Plan inheritance with structured guidance and guided document readiness paths.',
    comingSoon: true,
  },
  {
    title: 'Smart Notifications',
    description: 'Receive targeted alerts for comments, assignments, order updates, and workflow changes.',
  },
  {
    title: 'Flexible Payments',
    description: 'Use free and paid service flows with transparent status tracking and receipts.',
  },
  {
    title: 'Property Valuation',
    description: 'Request valuation support and keep reports linked to each property profile.',
  },
  {
    title: 'Family Collaboration',
    description: 'Coordinate with co-owners and family stakeholders without scattered messaging.',
    comingSoon: true,
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    subtitle: 'For getting started',
    description: 'Best for baseline readiness checks and initial organization.',
    ctaLabel: 'Get Free Assessment',
    ctaHref: '/assessment/start',
    features: [
      'Property profile setup',
      'Baseline assessment score',
      'Notification center',
      'Basic ticket support',
    ],
  },
  {
    name: 'Premium',
    price: '$29/mo',
    subtitle: 'For active property management',
    description: 'For users who need ongoing support and frequent service coordination.',
    ctaLabel: 'Start Managing Properties',
    ctaHref: '/register',
    highlighted: true,
    features: [
      'Everything in Free',
      'Priority ticket workflows',
      'Consultant assignment visibility',
      'Advanced document tracking',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: 'For families and portfolios',
    description: 'For larger portfolios requiring tailored processes and governance.',
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact',
    features: [
      'Multi-property portfolio support',
      'Custom workflow and SLA',
      'Dedicated onboarding support',
      'Expanded reporting roadmap',
    ],
  },
];

export const marketingFaqs: MarketingFaq[] = [
  {
    question: 'Is Wisebox only for people living outside Bangladesh?',
    answer:
      'No. Wisebox is built for any property owner who wants structured recordkeeping and service coordination, with special attention to diaspora needs.',
  },
  {
    question: 'Do I need all documents before I start?',
    answer:
      'No. You can begin with what you have. Wisebox highlights missing items and suggests next actions based on your profile.',
  },
  {
    question: 'Can I invite family members to collaborate?',
    answer:
      'Collaboration features are on the roadmap. Current workflows already support co-owner details and shared context in tickets.',
  },
  {
    question: 'How secure are my documents?',
    answer:
      'Uploads are handled through secure API flows and designed for encrypted storage and controlled access paths.',
  },
  {
    question: 'Can I speak to a consultant before placing a paid order?',
    answer:
      'Yes. Start from the assessment flow and create a support ticket; our team can guide the recommended service path.',
  },
];

export const marketingNavLinks = [
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];
