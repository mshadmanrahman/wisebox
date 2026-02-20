// ==========================================
// Wisebox Learning Center Content
// Static articles derived from Wisebox knowledge base
// ==========================================

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level: 2 | 3 }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'callout'; text: string; variant: 'info' | 'warning' | 'tip' }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'divider' }
  | { type: 'glossary'; terms: { bn: string; en: string; meaning: string }[] };

export interface LearningArticle {
  slug: string;
  title: string;
  description: string;
  category: LearningCategory;
  readTime: number; // minutes
  icon: string; // lucide icon name
  content: ContentBlock[];
}

export type LearningCategory =
  | 'ownership'
  | 'documents'
  | 'buying'
  | 'mutation'
  | 'services'
  | 'glossary';

export const CATEGORY_META: Record<LearningCategory, { label: string; description: string; color: string }> = {
  ownership: {
    label: 'Property Ownership',
    description: 'How land and property ownership works in Bangladesh',
    color: 'from-cyan-600 to-blue-700',
  },
  documents: {
    label: 'Documents & Records',
    description: 'Essential documents every property owner needs',
    color: 'from-emerald-600 to-teal-700',
  },
  buying: {
    label: 'Buying Process',
    description: 'Step-by-step guides for purchasing property',
    color: 'from-violet-600 to-purple-700',
  },
  mutation: {
    label: 'Mutation & Tax',
    description: 'Land mutation, segregation, and tax obligations',
    color: 'from-amber-600 to-orange-700',
  },
  services: {
    label: 'Wisebox Services',
    description: 'How Wisebox helps you protect your property',
    color: 'from-rose-600 to-pink-700',
  },
  glossary: {
    label: 'Glossary',
    description: 'Bengali land terminology with English translations',
    color: 'from-slate-500 to-slate-700',
  },
};

export const LEARNING_ARTICLES: LearningArticle[] = [
  // ── OWNERSHIP ──────────────────────────────────────────
  {
    slug: 'understanding-land-ownership',
    title: 'Understanding Land Ownership in Bangladesh',
    description: 'The legal framework governing land and immovable property rights.',
    category: 'ownership',
    readTime: 8,
    icon: 'Shield',
    content: [
      { type: 'callout', text: 'This guide covers the legal definition of land, immovable property, and how ownership is established under Bangladeshi law.', variant: 'info' },
      { type: 'heading', text: 'What Is "Land" Under the Law?', level: 2 },
      { type: 'paragraph', text: 'Land is defined as the part of the Earth\'s surface that is not covered by water. Under Section 2, Clause 16 of The State Acquisition and Tenancy Act, 1950, "Land" means land which is cultivated, uncultivated, or covered with water at any time of the year, and includes benefits to arise of land, houses or buildings, and also things attached to the Earth or permanently fastened to anything attached to the Earth.' },
      { type: 'heading', text: 'What Is Immovable Property?', level: 3 },
      { type: 'paragraph', text: 'Immovable property is land or anything permanently attached to it. This includes buildings, houses, trees, and any permanent structure on the land.' },
      { type: 'heading', text: 'Who Is a Land Owner?', level: 2 },
      { type: 'paragraph', text: 'A land owner is any person or organization whose name appears in the up-to-date Records of Rights (Khatian) within the government-declared ceiling, or who has acquired ownership through inheritance, purchase, or other legal means, or through a court order from a competent authority.' },
      { type: 'heading', text: 'How Can You Acquire Land Ownership?', level: 2 },
      { type: 'paragraph', text: 'There are five legal ways to acquire land ownership in Bangladesh:' },
      {
        type: 'list',
        ordered: true,
        items: [
          'Inheritance: After a person\'s death, ownership transfers according to the applicable Inheritance Law.',
          'Purchase: Through registered deeds (Sale Deed, Exchange Deed, Gift Deed, Will, or Ochitanara) under the Registration of Property Act, 1908.',
          'Settlement from Government: Agricultural landless people can receive Khas land under the Agricultural Khas Land Settlement Rules, 1997. Non-agricultural Khas land can be settled under the Non-Agriculture Settlement Rules, 1995.',
          'Acquisition: Government can acquire land for public interest under the Acquisition and Requisition of Property Act, 2017.',
          'Court Decree: A competent court can grant ownership through legal proceedings.',
        ],
      },
      { type: 'callout', text: 'Always ensure your ownership is reflected in the latest Records of Rights (Khatian) and that you have completed Mutation (Namjari) after any ownership transfer.', variant: 'tip' },
    ],
  },

  {
    slug: 'types-of-land',
    title: 'Classification of Land in Bangladesh',
    description: 'The 16 official land classifications and what they mean for property owners.',
    category: 'ownership',
    readTime: 5,
    icon: 'Map',
    content: [
      { type: 'paragraph', text: 'The Directorate of Land Records and Survey originally listed over 100 classes of land during settlement operations. In 2019, the Ministry of Land simplified this to 16 classes based on land use and location.' },
      { type: 'heading', text: 'The 16 Official Land Classes', level: 2 },
      {
        type: 'list',
        ordered: true,
        items: [
          'Forest', 'Hill', 'River', 'Wetland', 'Road', 'Terminal', 'Port', 'Agricultural',
          'Residential', 'Office', 'Commercial', 'Industrial', 'Entertainment Center',
          'Educational Institution', 'Monument', 'Religious Institution',
        ],
      },
      { type: 'heading', text: 'Key Categories Explained', level: 2 },
      { type: 'heading', text: 'Agricultural Land', level: 3 },
      { type: 'paragraph', text: 'Land that is cultivated or fit for cultivation, including gardens, animal husbandry land, natural or man-made water bodies (for fish farming), and rural homestead land used for agriculture-based cottage industries.' },
      { type: 'heading', text: 'Non-Agricultural Land', level: 3 },
      { type: 'paragraph', text: 'Under Section 2, Clause 4 of the Non-Agricultural Tenancy Act, 1949, this means land used for purposes not connected with agriculture or horticulture, including land held on lease for non-agricultural purposes.' },
      { type: 'heading', text: 'Residential Land', level: 3 },
      { type: 'paragraph', text: 'Land used exclusively for residential purposes, including personal residences and government or non-government residential buildings.' },
      { type: 'heading', text: 'Commercial Land', level: 3 },
      { type: 'paragraph', text: 'Land used for commercial purposes such as shopping malls, supermarkets, commercial spaces, business offices, and trade centers.' },
      { type: 'heading', text: 'Industrial Land', level: 3 },
      { type: 'paragraph', text: 'Land used for industry and industrial premises such as Export Processing Zones, brick fields, factories, and industrial warehouses.' },
      { type: 'callout', text: 'The classification of your land affects the Land Development Tax rate and what you can legally build on it. Always verify the classification in your Khatian before purchasing.', variant: 'warning' },
    ],
  },

  // ── DOCUMENTS ──────────────────────────────────────────
  {
    slug: 'essential-property-documents',
    title: 'Essential Documents Every Property Owner Needs',
    description: 'The complete list of documents you should collect and preserve for your property.',
    category: 'documents',
    readTime: 6,
    icon: 'FileText',
    content: [
      { type: 'callout', text: 'A land and flat owner should sequentially preserve all certified records, copies of deeds, and maps. Missing documents can cause serious legal complications.', variant: 'warning' },
      { type: 'heading', text: 'Land Documents Checklist', level: 2 },
      {
        type: 'table',
        headers: ['Document', 'Where to Get It', 'Time', 'Estimated Fee (BDT)'],
        rows: [
          ['Recorded Khatian (CS/SA/RS/BS/BRS/BDS)', 'DC Office Record Room or Online Portal', '1-7 days', '100-140'],
          ['Deed Documents & Baya Documents', 'Sub Registry Office / District Registrar Office', '~15 days', '10,000-25,000'],
          ['Mutation Khatian (Namjari)', 'AC (Land) Office', '~15 days', '5,000-10,000'],
          ['Duplicate Carbon Receipt (DCR)', 'Online (Land.gov.bd)', '~15 days', '500-1,000'],
          ['Land Development Tax / Rent Receipt', 'Online (Land.gov.bd)', '~15 days', '5,000-10,000'],
          ['Map / Plan / Pentagraph', 'Dept. of Land Records & Surveys, Tejgaon', '~7 days', '525-5,000'],
          ['Field Verification (Occupation & Location)', 'On-site inspection', '3-7 days', '2,000-10,000'],
        ],
      },
      { type: 'heading', text: 'Where to Collect Record Khatian', level: 2 },
      { type: 'paragraph', text: 'The Record Khatian can be collected from the Record Room of the Deputy Commissioner\'s (DC) Office of the concerned district. Online collection costs 100 Taka from the office counter, or 140 Taka through postal mail. Under Section 76 of The Evidence Act, 1872, the power to issue Certified Copies rests with the DC\'s Office.' },
      { type: 'heading', text: 'Where to Collect Deed Copies', level: 2 },
      { type: 'paragraph', text: 'Deed copies must be collected from the relevant Upazila Sub-Registry Office. In the Dhaka City Corporation area, most Sub-Registry Offices are located in the Registration Complex, Tejgaon Industrial Area. You will need to pay Stamp Duty, Index Book Search Fee, Inspection Fee, and Court Fee.' },
      { type: 'heading', text: 'Where to Collect Map Copies', level: 2 },
      { type: 'paragraph', text: 'A copy of the Map (Noksha) can be collected from the Department of Land Records and Surveys, Tejgaon, Dhaka, for a fee of 525 Taka.' },
      { type: 'callout', text: 'Wisebox can digitize and verify all your property documents. Use our Document Vault to store certified copies securely.', variant: 'tip' },
    ],
  },

  {
    slug: 'types-of-deeds',
    title: 'Types of Deeds in Bangladesh',
    description: 'Understanding the different deed types and when each one is used.',
    category: 'documents',
    readTime: 5,
    icon: 'ScrollText',
    content: [
      { type: 'paragraph', text: 'A deed (Dolil) is the legal document that records the transfer of property from one party to another. Under The Registration of Property Act, 1908, all property transfers must be registered through an official deed.' },
      { type: 'heading', text: 'Common Types of Deeds', level: 2 },
      {
        type: 'table',
        headers: ['Deed Type', 'Bengali Name', 'Purpose'],
        rows: [
          ['Sale Deed (Saf Kabala)', 'সাফ কবলা', 'Transfer of property through purchase/sale'],
          ['Gift Deed (Heba)', 'হেবা / দানপত্র', 'Transfer of property as a gift, typically within family'],
          ['Exchange Deed (Ewaj)', 'এওয়াজ / বিনিময়', 'Mutual exchange of properties between two parties'],
          ['Partition Deed (Bonton Nama)', 'বন্টননামা / বাটোয়ারা', 'Division of jointly-owned property among co-sharers'],
          ['Mortgage Deed', 'বন্ধকী দলিল', 'Pledging property as security for a loan'],
          ['Contract Deed (Byanapatra)', 'বায়নাপত্র / চুক্তিপত্র', 'Preliminary agreement before the final sale'],
          ['Rectification Deed', 'ভ্রম সংশোধনী দলিল', 'Correcting errors in a previously registered deed'],
          ['Power of Attorney (Irrevocable)', 'অপ্রত্যাহারযোগ্য পাওয়ার অব অ্যাটর্নী', 'Granting authority to act on behalf of the owner'],
          ['Will', 'উইল', 'Transferring property rights after death'],
          ['Ochiyat', 'অছিয়ত', 'Islamic will for property distribution (max 1/3 of estate)'],
        ],
      },
      { type: 'callout', text: 'The most common deed for property purchase is the Saf Kabala (Sale Deed). Always ensure it is registered at the Sub-Registry Office and that Mutation is completed afterward.', variant: 'tip' },
      { type: 'heading', text: 'Registration Process', level: 2 },
      { type: 'paragraph', text: 'All deeds must be registered at the Sub-Registry Office of the area where the property is located. The process involves paying Stamp Duty, Registration Fee, and other applicable charges. Deed Writers and Stamp Vendors at the Sub-Registry Office can assist with the process for a fee.' },
    ],
  },

  {
    slug: 'land-records-surveys',
    title: 'Land Records and Surveys Explained',
    description: 'Understanding CS, SA, RS, and other survey records in Bangladesh.',
    category: 'documents',
    readTime: 7,
    icon: 'MapPin',
    content: [
      { type: 'paragraph', text: 'Bangladesh\'s land record system is built on a series of surveys conducted over the past century. Understanding these surveys is essential for verifying property ownership.' },
      { type: 'heading', text: 'Timeline of Major Surveys', level: 2 },
      {
        type: 'table',
        headers: ['Survey', 'Full Name', 'Period', 'Significance'],
        rows: [
          ['CS', 'Cadastral Survey', '1910-1940', 'First-ever land survey; created initial Khatian and maps'],
          ['SA', 'State Acquisition Survey', '1960-1965', 'Created after abolition of Zamindari system; recorded tenants as owners'],
          ['RS', 'Revisional Settlement Survey', 'Varies by district', 'Updated survey reflecting current ownership changes'],
          ['BRS/BDS', 'Bangladesh Revisional/Dhaka Survey', 'Recent', 'City-specific surveys for Dhaka City Corporation area'],
          ['City Survey', 'Dhaka City Jorip', 'Recent', 'Specific to Dhaka metropolitan areas'],
        ],
      },
      { type: 'heading', text: 'Records in Greater Dhaka', level: 2 },
      { type: 'paragraph', text: 'In the districts of Dhaka, Narayanganj, Narsingdi, Munshiganj, and Gazipur, CS, SA, and RS records are available. The Dhaka City Corporation area additionally has City Survey (Dhaka City Jorip) and BRS records. Some Mouzas in Savar Upazila (Dhaka) and Palash Upazila (Narsingdi) also have BDS/BRS records.' },
      { type: 'heading', text: 'What Is a Khatian?', level: 2 },
      { type: 'paragraph', text: 'A Khatian (Record of Rights) is the government\'s official record of land ownership and possession. It is prepared under The Bengal Tenancy Rules, 1955 and includes the owner\'s name, plot numbers (Dag), land area, and classification.' },
      { type: 'callout', text: 'When verifying a property, always check the chain of records from CS through the latest survey. Any break in the chain is a red flag that needs investigation.', variant: 'warning' },
      { type: 'heading', text: 'How to Get Certified Copies', level: 2 },
      {
        type: 'list',
        items: [
          'Khatian copies: DC Office Record Room (100 BDT counter, 140 BDT postal)',
          'Deed copies: Upazila Sub-Registry Office (fees vary)',
          'Map copies: Department of Land Records and Surveys, Tejgaon, Dhaka (525 BDT)',
        ],
      },
    ],
  },

  // ── BUYING PROCESS ─────────────────────────────────────
  {
    slug: 'buying-flat-checklist',
    title: 'Complete Flat Buying Checklist',
    description: 'Everything to verify before signing an agreement with a developer.',
    category: 'buying',
    readTime: 10,
    icon: 'ClipboardCheck',
    content: [
      { type: 'callout', text: 'Buying a flat in Bangladesh involves two stages of verification: the underlying land and the flat-specific agreement. Do not skip either stage.', variant: 'warning' },
      { type: 'heading', text: 'Part 1: Land Verification', level: 2 },
      { type: 'paragraph', text: 'Before buying any flat, you must verify the land on which the building is constructed. This is the most critical step.' },
      {
        type: 'table',
        headers: ['Check', 'Verification Score', 'Where to Verify', 'Estimated Fee (BDT)'],
        rows: [
          ['Recorded Khatian (CS/SA/RS/BS/BRS/BDS)', '20 points', 'DC Office / Online Portal', '100-140'],
          ['Documents and Baya Documents', '15 points', 'Sub Registry Office', '10,000-25,000'],
          ['Mutation Khatian', '10 points', 'AC (Land) Office', '5,000-10,000'],
          ['DCR + LD Tax Receipt', '10 points', 'Online (Land.gov.bd)', '500-10,000'],
          ['Map / Plan / Pentagraph', '5 points', 'Land Records Dept', '3,500-5,000'],
          ['Field Verification (Physical Visit)', '40 points', 'On-site', '2,000-10,000'],
        ],
      },
      { type: 'callout', text: 'Field verification carries the highest weight (40 points). Never buy property without physically visiting the site and confirming boundaries with neighbors.', variant: 'tip' },
      { type: 'heading', text: 'Part 2: Flat-Specific Documents', level: 2 },
      { type: 'paragraph', text: 'Once the land checks pass, verify these documents from the developer:' },
      {
        type: 'list',
        ordered: true,
        items: [
          'Land owner\'s agreement with the developer company',
          'Photocopy of Power of Attorney',
          'Photocopy of the original document of the original land owner',
          'Registration slip as per City Survey / RS of the original land owner',
          'Baia document',
          'Photocopies of all ledgers (Dhaka Metropolitan, RS, CS, SA Ledgers)',
          'Up-to-date rent receipt',
          'City Corporation Holding Tax receipt',
          'RAJUK plan pass (building approval)',
          'The bilateral agreement (developer-buyer contract)',
        ],
      },
      { type: 'heading', text: 'Critical Agreement Checks', level: 2 },
      { type: 'paragraph', text: 'Before signing the bilateral agreement, verify every single detail:' },
      {
        type: 'list',
        items: [
          'Your name, father\'s name, address, and voter ID are correct',
          'Developer\'s official\'s details match the Power of Attorney',
          'RAJUK plan pass number and date are mentioned',
          'Total price is written clearly (flat + parking + utility, with a single total)',
          'Handover date is specific and matches the land owner\'s contract timeline',
          'Late handover penalty: flat rent should be specified if delivery is delayed',
          'Flat Owners Association fee is stated and consistent across all buyers',
          'Your flat number, floor, and side are correct in the schedule',
          '"Features & Amenities" section is included in the agreement',
          'Developer\'s brochure is referenced as "part of the agreement"',
          'Installment payment schedule is included with construction milestones',
        ],
      },
      { type: 'callout', text: 'Most developers use money from one project to fund another. This is common practice, but monitor your project\'s construction progress against the installment schedule. If construction falls behind while you\'re paying on time, escalate immediately.', variant: 'warning' },
    ],
  },

  // ── MUTATION & TAX ─────────────────────────────────────
  {
    slug: 'mutation-namjari-process',
    title: 'Land Mutation (Namjari) Process',
    description: 'How to transfer land records to your name after inheritance or purchase.',
    category: 'mutation',
    readTime: 7,
    icon: 'ArrowRightLeft',
    content: [
      { type: 'paragraph', text: 'Land Mutation (Namjari) and Segregation of Holdings (Jomavag) is the process of updating government records to reflect a change in land ownership. It is mandatory after both inheritance and purchase.' },
      { type: 'callout', text: 'Mutation does NOT establish ownership. It is an administrative process that updates records. Your deed is the proof of ownership; mutation simply reflects it in the government system.', variant: 'info' },
      { type: 'heading', text: 'Mutation After Inheritance', level: 2 },
      { type: 'paragraph', text: 'If you inherited land, you must complete Namjari-Jomavag at the Upazila Land Office or Assistant Commissioner (Land) Office. You need:' },
      {
        type: 'list',
        items: [
          'Certificate of inheritance of the latest published record holder',
          'The Khatian (Record of Rights) in the deceased\'s name',
          'OR a Deed of Partition (Bonton Nama Dolil) if co-inheritors have divided the property',
        ],
      },
      { type: 'paragraph', text: 'Mutation can be done in the names of all inheritors jointly, or separately based on the partition deed.' },
      { type: 'heading', text: 'Mutation After Purchase', level: 2 },
      { type: 'paragraph', text: 'If you purchased the property, bring these documents to the Upazila Land Office or AC (Land) Office:' },
      {
        type: 'list',
        ordered: true,
        items: [
          'Your Deed of Purchase (Saf Kabala)',
          'The latest published Record Khatian',
          'Sequential deeds of sale and purchase from the Khatian owner (chain of ownership)',
          'The Namjari-Jomavag Khatian in the name of the last seller',
        ],
      },
      { type: 'callout', text: 'For apartments/flats: only the land portion is subject to Namjari-Jomavag. The apartment number is mentioned in the "Remarks" column of the Namjari Khatian.', variant: 'info' },
      { type: 'heading', text: 'After Mutation: Pay Land Development Tax', level: 2 },
      { type: 'paragraph', text: 'Once your Namjari-Jomavag is complete, follow these steps:' },
      {
        type: 'list',
        ordered: true,
        items: [
          'Upload your Namjari-Jomavag Khatian to your LSG (Land Services Gateway) Profile at land.gov.bd',
          'Wait for the Union Land Assistant Officer to approve your profile',
          'Pay the assessed Land Development Tax (LD Tax) through the portal',
        ],
      },
      { type: 'paragraph', text: 'The Land Development Tax must be paid annually. Failure to pay can result in penalties and complications in future property transactions.' },
    ],
  },

  // ── SERVICES ───────────────────────────────────────────
  {
    slug: 'wisebox-services-overview',
    title: 'How Wisebox Protects Your Property',
    description: 'An overview of all Wisebox services from consultation to full verification.',
    category: 'services',
    readTime: 6,
    icon: 'Sparkles',
    content: [
      { type: 'paragraph', text: 'Wisebox offers end-to-end property verification and management services. Whether you\'re buying your first flat or managing inherited land, we have a service for you.' },
      { type: 'heading', text: 'Consultation Services', level: 2 },
      {
        type: 'table',
        headers: ['Service', 'Duration', 'Price'],
        rows: [
          ['Free Property Assessment', '30 minutes', 'FREE'],
          ['Expert Consultation', '60 minutes', 'Starting from BDT 2,000'],
          ['Legal Opinion on Property', '3-5 business days', 'BDT 5,000-15,000'],
        ],
      },
      { type: 'heading', text: 'Document Services', level: 2 },
      {
        type: 'table',
        headers: ['Service', 'Timeline', 'Price'],
        rows: [
          ['Document Collection (Khatian, Deed, Map)', '7-15 days', 'BDT 3,000-10,000'],
          ['Document Verification', '3-7 days', 'BDT 2,000-5,000'],
          ['Document Digitization', '2-3 days', 'BDT 1,000-3,000'],
        ],
      },
      { type: 'heading', text: 'Legal Services', level: 2 },
      {
        type: 'table',
        headers: ['Service', 'Timeline', 'Price'],
        rows: [
          ['Land Mutation (Namjari)', '15-30 days', 'BDT 10,000-25,000'],
          ['Property Transfer (Registration)', '7-15 days', 'BDT 15,000-50,000'],
          ['Boundary Dispute Resolution', 'Varies', 'Consultation-based'],
          ['Title Search & Verification', '5-10 days', 'BDT 5,000-15,000'],
        ],
      },
      { type: 'heading', text: 'How It Works', level: 2 },
      {
        type: 'list',
        ordered: true,
        items: [
          'Create your Wisebox account and add your property',
          'Upload any documents you already have',
          'Take the free property assessment to see your readiness score',
          'Book a free 30-minute consultation with an expert',
          'Get a personalized action plan with recommended services',
          'Track progress through your Wisebox dashboard',
        ],
      },
      { type: 'callout', text: 'Start with our free assessment and consultation. Over 60% of property issues can be identified in the first session.', variant: 'tip' },
    ],
  },

  // ── GLOSSARY ───────────────────────────────────────────
  {
    slug: 'bengali-land-glossary',
    title: 'Bengali Land Terminology Glossary',
    description: '200 essential Bengali land terms with English translations and meanings.',
    category: 'glossary',
    readTime: 15,
    icon: 'Languages',
    content: [
      { type: 'paragraph', text: 'Property transactions in Bangladesh use specialized Bengali terminology that can be confusing even for native speakers. This glossary covers the 200 most important terms you\'ll encounter.' },
      { type: 'callout', text: 'Use your browser\'s search (Ctrl+F / Cmd+F) to quickly find a specific term.', variant: 'tip' },
      { type: 'heading', text: 'Core Ownership Terms (1-30)', level: 2 },
      {
        type: 'glossary',
        terms: [
          { bn: 'খতিয়ান (Khatian)', en: 'Record of Rights', meaning: 'Government record of land ownership and possession' },
          { bn: 'দাগ নম্বর (Dag Number)', en: 'Plot Number', meaning: 'Identification number for a specific land plot' },
          { bn: 'হাল খতিয়ান (Hal Khatian)', en: 'Current Record', meaning: 'The most recent survey record' },
          { bn: 'সাবেক খতিয়ান (Sabek Khatian)', en: 'Previous Record', meaning: 'Record from an earlier survey' },
          { bn: 'মৌজা (Mouza)', en: 'Administrative Land Unit', meaning: 'A defined geographical area for land administration' },
          { bn: 'জে.এল. নম্বর (J.L. No.)', en: 'Jurisdiction List Number', meaning: 'Survey ledger number identifying a Mouza' },
          { bn: 'রেকর্ড (Record)', en: 'Record', meaning: 'Official government land document' },
          { bn: 'জমিদার (Zamindar)', en: 'Landlord', meaning: 'Revenue collector under the old system (abolished 1950)' },
          { bn: 'রায়ত (Raiyat)', en: 'Tenant Farmer', meaning: 'The actual cultivator or possessor of land' },
          { bn: 'মালিকানা (Ownership)', en: 'Ownership', meaning: 'Legal right over land' },
          { bn: 'দলিল (Deed)', en: 'Deed', meaning: 'Legal document for land transfer' },
          { bn: 'রেজিস্ট্রেশন (Registration)', en: 'Registration', meaning: 'Official registration of a deed' },
          { bn: 'খারিজ / নামজারি (Mutation)', en: 'Mutation / Name Transfer', meaning: 'Updating records to reflect new ownership' },
          { bn: 'পর্চা (Porcha)', en: 'Ownership Copy', meaning: 'Official copy of the Khatian' },
          { bn: 'ভূমি উন্নয়ন কর (LD Tax)', en: 'Land Development Tax', meaning: 'Annual government tax on land' },
        ],
      },
      { type: 'heading', text: 'Survey & Record Terms (25-50)', level: 2 },
      {
        type: 'glossary',
        terms: [
          { bn: 'সি.এস. (C.S.)', en: 'Cadastral Survey', meaning: 'The first land survey (1910-1940)' },
          { bn: 'এস.এ. (S.A.)', en: 'State Acquisition Survey', meaning: 'Survey after landlord system abolition (1960-1965)' },
          { bn: 'আর.এস. (R.S.)', en: 'Revisional Survey', meaning: 'Updated/revised survey' },
          { bn: 'বি.এস. (B.S.)', en: 'Bangladesh Survey', meaning: 'Recent national survey' },
          { bn: 'তফসিল (Schedule)', en: 'Schedule', meaning: 'Property boundary description in a deed' },
          { bn: 'চৌহদ্দি (Boundary)', en: 'Boundary', meaning: 'The four-sided boundary of land' },
          { bn: 'জরিপ (Survey)', en: 'Survey', meaning: 'Government process of measuring and recording land' },
          { bn: 'সার্ভেয়ার (Surveyor)', en: 'Surveyor', meaning: 'Official who measures land' },
          { bn: 'মৌজা মানচিত্র (Mouza Map)', en: 'Mouza Map', meaning: 'Map of land plots within a Mouza' },
          { bn: 'উত্তরাধিকার (Inheritance)', en: 'Inheritance', meaning: 'Receiving property from a deceased person' },
          { bn: 'দখল (Possession)', en: 'Possession', meaning: 'Physical control over land' },
          { bn: 'ইজারা (Lease)', en: 'Lease', meaning: 'Agreement to use land for a fixed period' },
        ],
      },
      { type: 'heading', text: 'Deed & Transaction Terms (51-80)', level: 2 },
      {
        type: 'glossary',
        terms: [
          { bn: 'সাফ কবলা (Saf Kabala)', en: 'Sale Deed', meaning: 'Document transferring ownership through sale' },
          { bn: 'দানপত্র (Gift Deed)', en: 'Gift Deed', meaning: 'Document transferring property as a gift' },
          { bn: 'বিনিময় (Exchange)', en: 'Exchange Deed', meaning: 'Mutual swap of properties' },
          { bn: 'বন্ধকী দলিল (Mortgage)', en: 'Mortgage Deed', meaning: 'Pledging property as loan security' },
          { bn: 'বায়নাপত্র (Byanapatra)', en: 'Contract Deed', meaning: 'Preliminary agreement before sale' },
          { bn: 'পাওয়ার অব অ্যাটর্নি', en: 'Power of Attorney', meaning: 'Granting someone authority over your property' },
          { bn: 'উইল (Will)', en: 'Will', meaning: 'Document specifying property distribution after death' },
          { bn: 'অছিয়ত (Ochiyat)', en: 'Islamic Will', meaning: 'Islamic provision for property distribution (max 1/3)' },
          { bn: 'স্ট্যাম্প ডিউটি (Stamp Duty)', en: 'Stamp Duty', meaning: 'Government tax on property registration' },
          { bn: 'রেজিস্ট্রি ফি (Registry Fee)', en: 'Registration Fee', meaning: 'Fee for registering a deed' },
          { bn: 'দলিল লেখক (Deed Writer)', en: 'Deed Writer', meaning: 'Professional who prepares deed documents' },
          { bn: 'নোটারি পাবলিক (Notary Public)', en: 'Notary Public', meaning: 'Official who verifies document authenticity' },
        ],
      },
      { type: 'heading', text: 'Government & Administrative Terms (81-120)', level: 2 },
      {
        type: 'glossary',
        terms: [
          { bn: 'খাস জমি (Khas Land)', en: 'Government Land', meaning: 'Land owned directly by the government' },
          { bn: 'বন্দোবস্ত (Settlement/Allotment)', en: 'Settlement', meaning: 'Government allocation of Khas land to individuals' },
          { bn: 'অধিগ্রহণ (Acquisition)', en: 'Acquisition', meaning: 'Government taking land for public interest' },
          { bn: 'ক্ষতিপূরণ (Compensation)', en: 'Compensation', meaning: 'Payment for acquired land' },
          { bn: 'সহকারী কমিশনার ভূমি (AC Land)', en: 'Assistant Commissioner (Land)', meaning: 'Upazila-level land administration officer' },
          { bn: 'ডিসি (DC)', en: 'Deputy Commissioner', meaning: 'District-level chief land officer' },
          { bn: 'তহসিলদার (Tehsildar)', en: 'Revenue Collection Officer', meaning: 'Official responsible for collecting land tax' },
          { bn: 'ভূমি সেবা কেন্দ্র', en: 'Land Service Center', meaning: 'Union-level center for land services' },
          { bn: 'রেকর্ড রুম (Record Room)', en: 'Record Room', meaning: 'Where land records are preserved at DC office' },
          { bn: 'ই-পর্চা (e-Porcha)', en: 'Digital Khatian Copy', meaning: 'Electronic version of land record copy' },
          { bn: 'ই-নামজারি (e-Mutation)', en: 'Online Mutation', meaning: 'Digital process for land mutation' },
          { bn: 'এলএসজি (LSG)', en: 'Land Services Gateway', meaning: 'Online portal for land tax payment at land.gov.bd' },
        ],
      },
      { type: 'heading', text: 'Measurement Units (170-178)', level: 2 },
      {
        type: 'glossary',
        terms: [
          { bn: 'ডেসিমেল (Decimal)', en: 'Decimal', meaning: '1/100 of an acre (same as Shotok)' },
          { bn: 'একর (Acre)', en: 'Acre', meaning: '100 decimals of land' },
          { bn: 'শতক (Shotok)', en: 'Shotok/Cent', meaning: '1/100 of an acre' },
          { bn: 'বিঘা (Bigha)', en: 'Bigha', meaning: 'Local unit, approximately 33 decimals' },
          { bn: 'কাঠা (Katha)', en: 'Katha', meaning: 'Small unit, approximately 1.65 decimals' },
          { bn: 'গণ্ডা (Gonda)', en: 'Gonda', meaning: 'Traditional subdivision of Katha' },
          { bn: 'কানি (Kani)', en: 'Kani', meaning: 'Regional measurement unit (varies by area)' },
        ],
      },
      { type: 'heading', text: 'Legal & Dispute Terms (115-130)', level: 2 },
      {
        type: 'glossary',
        terms: [
          { bn: 'ভূমি বিরোধ (Land Dispute)', en: 'Land Dispute', meaning: 'Conflict between parties over land' },
          { bn: 'নালিশ জমি (Disputed Land)', en: 'Disputed Land', meaning: 'Land with contested ownership' },
          { bn: 'রায় (Judgment)', en: 'Judgment', meaning: 'Final court decision' },
          { bn: 'ডিক্রি (Decree)', en: 'Decree', meaning: 'Enforceable court order' },
          { bn: 'নিষেধাজ্ঞা (Injunction)', en: 'Injunction/Prohibition', meaning: 'Court order stopping a transaction' },
          { bn: 'অবৈধ দখলদার (Encroacher)', en: 'Encroacher', meaning: 'Person illegally occupying land' },
          { bn: 'সীমানা বিরোধ (Boundary Dispute)', en: 'Boundary Dispute', meaning: 'Conflict over property boundaries' },
        ],
      },
    ],
  },
];
