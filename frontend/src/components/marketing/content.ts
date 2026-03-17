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
  priceSuffix?: string;
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
    title: 'Documents live in too many places',
    description:
      'Deeds, mutation records, tax receipts, utility bills. Spread across family members, filing cabinets, and old email threads. When you need them urgently, they\u2019re never in one place.',
  },
  {
    title: 'You can\u2019t see what\u2019s happening on the ground',
    description:
      'Municipal deadlines, encroachment risks, tenant issues, legal notices. By the time you hear about a problem, it has already compounded.',
  },
  {
    title: 'Most families only act during a crisis',
    description:
      'A boundary dispute. A forged deed. A missed tax payment. Without a system, every property issue becomes an emergency.',
  },
  {
    title: 'Inheritance is complicated without structure',
    description:
      'Who owns what? Which documents are current? What happens if something changes? Most families don\u2019t have clear answers, and the cost of ambiguity grows with time.',
  },
];

export const marketingHowItWorks: MarketingStep[] = [
  {
    step: '1',
    title: 'Create your property profile',
    description:
      'Capture location, ownership details, and baseline context in a single digital record. One property, one source of truth.',
  },
  {
    step: '2',
    title: 'Assess your document readiness',
    description:
      'Upload what you have. Wisebox scores your documentation against what\u2019s required, flags what\u2019s missing, and gives you a prioritized action list.',
  },
  {
    step: '3',
    title: 'Coordinate support as needed',
    description:
      'Book legal consultations, property valuations, or document retrieval. Every request becomes a tracked ticket with status updates and consultant notes.',
  },
];

export const marketingFeatures: MarketingFeature[] = [
  {
    title: 'Document Management',
    description:
      'Organize deeds, tax records, legal correspondence, and ownership evidence in a secure, searchable timeline.',
  },
  {
    title: 'Property Monitoring',
    description:
      'Track property status, action items, and updates from consultants and contacts on the ground.',
  },
  {
    title: 'Legal Consultations',
    description:
      'Connect with licensed consultants for legal guidance, dispute resolution, and compliance questions. Every interaction is linked to your property record.',
  },
  {
    title: 'Ticket Tracking',
    description:
      'Every service request, from document retrieval to property inspection, becomes a tracked ticket with status history and consultant notes.',
  },
  {
    title: 'Notification Center',
    description:
      'Receive targeted alerts for comments, assignments, status changes, and deadlines. Stay informed without checking in constantly.',
  },
  {
    title: 'Assessment Scoring',
    description:
      'Get a clarity score for each property based on document completeness, ownership structure, and operational readiness. Know where you stand.',
  },
  {
    title: 'Digital Will Creation',
    description:
      'Plan inheritance with structured guidance and document readiness paths. Ensure your family has clarity, not confusion.',
    comingSoon: true,
  },
  {
    title: 'Family Collaboration',
    description:
      'Invite co-owners and family stakeholders into a shared workspace. Coordinate decisions without scattered WhatsApp threads.',
    comingSoon: true,
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    subtitle: 'For getting started',
    description:
      'Establish your baseline. See where your property stands before committing to anything.',
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
    price: '$29',
    priceSuffix: '/mo',
    subtitle: 'For active property management',
    description:
      'For families who need ongoing coordination, priority support, and deeper document tracking.',
    ctaLabel: 'Start Managing Properties',
    ctaHref: '/register',
    highlighted: true,
    features: [
      'Everything in Free',
      'Priority ticket workflows',
      'Consultant assignment visibility',
      'Advanced document tracking',
      'Status history and audit trail',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: 'For families and portfolios',
    description:
      'For larger property portfolios requiring tailored workflows, dedicated onboarding, and governance support.',
    ctaLabel: 'Contact Us',
    ctaHref: '/contact',
    features: [
      'Everything in Premium',
      'Multi-property portfolio support',
      'Custom workflow and SLA configuration',
      'Dedicated onboarding support',
      'Expanded reporting',
    ],
  },
];

export const marketingFaqs: MarketingFaq[] = [
  {
    question: 'Is Wisebox only for people living outside Bangladesh?',
    answer:
      'No. Wisebox is built for anyone managing property in Bangladesh, whether you live in Dhaka or Dallas. That said, the platform is especially designed for diaspora families who need visibility and coordination from a distance.',
  },
  {
    question: 'Do I need all my documents before I can start?',
    answer:
      'Not at all. Start with what you have. The assessment will identify what\u2019s missing and help you prioritize what to gather next.',
  },
  {
    question: 'Can I invite family members to collaborate?',
    answer:
      'Family collaboration is on our near-term roadmap. Today, you can manage your properties individually and share updates manually. Shared workspaces are coming soon.',
  },
  {
    question: 'How secure are my documents?',
    answer:
      'All documents are encrypted at rest and in transit. Access is role-based and permission-controlled. We do not share your data with third parties.',
  },
  {
    question: 'Can I speak to a consultant before placing a paid order?',
    answer:
      'Yes. You can submit a consultation request through the platform and discuss your needs before committing to any paid service.',
  },
  {
    question: 'What types of properties does Wisebox support?',
    answer:
      'Residential, agricultural, and commercial properties in Bangladesh. Whether it\u2019s ancestral land, a family home, or a rental property, Wisebox can help you organize and manage it.',
  },
];

export const marketingNavLinks = [
  { href: '#process-section', label: 'How It Works' },
  { href: '#features-section', label: 'Features' },
  { href: '#pricing-section', label: 'Pricing' },
  { href: '#faq-section', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];
