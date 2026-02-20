export interface DocumentInfo {
  slug: string;
  nameEn: string;
  nameBn: string;
  whatIsIt: string;
  whereToGetIt: string;
  estimatedCost: string;
  estimatedTime: string;
  ifMissing: string;
  requiredFor: string[];
  tips: string[];
}

const DOCUMENT_INFO: DocumentInfo[] = [
  {
    slug: 'position_of_land',
    nameEn: 'Possession & Position of Land',
    nameBn: 'দখল ও অবস্থান',
    whatIsIt:
      'A verification of who physically occupies and controls the land. This is established through on-site inspection, neighbor testimony, and local government acknowledgment. It confirms that the claimed owner is actually in possession.',
    whereToGetIt:
      'Conducted on-site at the land location. A local surveyor or Union Parishad member can assist with formal documentation. Some buyers hire a lawyer to coordinate the verification with neighbors and local officials.',
    estimatedCost: 'Free to 2,000 BDT (if hiring a surveyor or lawyer)',
    estimatedTime: '1-3 days (requires physical visit)',
    ifMissing:
      'Visit the land with a local representative or lawyer. Collect written statements from at least two neighboring landowners confirming your possession. Have the Union Parishad chairman or Ward councillor attest to the possession on official letterhead.',
    requiredFor: ['purchase', 'inheritance', 'gift', 'partition'],
    tips: [
      'Photograph the land from multiple angles with GPS-tagged images for your records.',
      'A possession certificate from the Union Parishad carries more weight in disputes.',
      'If the land has tenants or sharecroppers, document their acknowledgment of your ownership.',
    ],
  },
  {
    slug: 'recorded_khatian',
    nameEn: 'Recorded Khatian (RS/BS/CS)',
    nameBn: 'রেকর্ডেড খতিয়ান',
    whatIsIt:
      'The official Record of Rights (ROR) issued during government land surveys. CS (Cadastral Survey) is the oldest, followed by RS (Revisional Survey) and BS (Bangladesh Survey). Each khatian records the owner name, plot numbers, land classification, and area at the time of that survey.',
    whereToGetIt:
      'Apply at the AC (Land) office in the relevant upazila, or search online at land.gov.bd. RS/CS records may require visiting the district record room. Certified copies are issued by the AC (Land) office.',
    estimatedCost: '100-500 BDT per certified copy',
    estimatedTime: '3-10 working days',
    ifMissing:
      'Visit the AC (Land) office with the mouza name and plot (dag) number. If you know the previous owner name, the staff can search by name. For very old CS records, you may need to visit the district Collectorate record room. Online search at land.gov.bd can sometimes locate the record faster.',
    requiredFor: ['purchase', 'inheritance', 'gift', 'mortgage', 'partition'],
    tips: [
      'Always get the most recent survey record (BS if available, otherwise RS).',
      'Cross-check the khatian plot numbers against the mutation khatian for consistency.',
      'The khatian alone does not prove current ownership; it proves ownership at the time of the survey.',
    ],
  },
  {
    slug: 'deed',
    nameEn: 'Deed (Dolil)',
    nameBn: 'দলিল',
    whatIsIt:
      'The registered sale deed is the primary legal instrument that transfers land ownership. It is executed on non-judicial stamp paper, signed by both parties and witnesses, and registered at the Sub-Registrar office. The deed contains property description, sale price, and identity of buyer and seller.',
    whereToGetIt:
      'Obtained from the Sub-Registrar office where the deed was originally registered. The buyer receives the original at the time of registration. Certified copies can be requested later with the deed number or property details.',
    estimatedCost: '500-2,000 BDT for a certified copy',
    estimatedTime: '7-15 working days for certified copy',
    ifMissing:
      'Apply for a certified copy at the Sub-Registrar office where the deed was registered. You will need the approximate year of registration, the names of buyer/seller, and the mouza name. If you have the deed number, the process is faster. A lawyer can help trace the deed if details are incomplete.',
    requiredFor: ['purchase', 'gift', 'mortgage'],
    tips: [
      'Always keep the original deed in a secure location (bank locker recommended).',
      'Get at least two certified copies for your records.',
      'Verify that the deed stamp duty and registration fees were fully paid; unpaid fees can invalidate the deed.',
    ],
  },
  {
    slug: 'mutation_khatian',
    nameEn: 'Mutation Khatian',
    nameBn: 'নামজারি খতিয়ান',
    whatIsIt:
      'Mutation (Namjari) is the process of updating government land records to reflect a new owner after a sale, inheritance, or gift. The mutation khatian is the updated record that shows your name as the current owner in government records. Without mutation, property tax and future transactions become complicated.',
    whereToGetIt:
      'Apply at the AC (Land) office in the upazila where the land is located. Submit the deed, previous khatian, land tax receipts, and an application form. The AC (Land) verifies the documents and issues the mutation order.',
    estimatedCost: '1,000-5,000 BDT (government fees + stamp)',
    estimatedTime: '15-60 working days',
    ifMissing:
      'File a mutation application at the AC (Land) office immediately. You need: the registered deed, previous owner khatian, up-to-date land tax receipts (dakhila), and NID copies. If the application was filed but not completed, follow up with the AC (Land) office with your case number.',
    requiredFor: ['purchase', 'inheritance', 'gift', 'partition'],
    tips: [
      'Apply for mutation immediately after registering a deed; delays make the process harder.',
      'Keep copies of every document you submit with the application.',
      'If mutation is delayed beyond 60 days, you can file a complaint with the Deputy Commissioner office.',
    ],
  },
  {
    slug: 'ld_tax',
    nameEn: 'Land Tax / Dakhila',
    nameBn: 'ভূমি উন্নয়ন কর / দাখিলা',
    whatIsIt:
      'The annual land development tax paid to the government. The dakhila is the receipt proving payment. Regular tax payment is essential; it serves as evidence of possession and ownership. Unpaid taxes can lead to government claims on the land.',
    whereToGetIt:
      'Pay at the Union Parishad office (rural) or Municipality/City Corporation office (urban). Online payment is available through land.gov.bd for many areas. The dakhila receipt is issued immediately upon payment.',
    estimatedCost: 'Varies by land class and area (typically 50-500 BDT annually)',
    estimatedTime: 'Immediate (same-day receipt)',
    ifMissing:
      'Visit the local tax office with your khatian or holding number. Pay all outstanding dues including any late fees. The office will issue current and backdated receipts. For online payment, register at land.gov.bd with your holding information.',
    requiredFor: ['purchase', 'inheritance', 'gift', 'mortgage', 'partition'],
    tips: [
      'Pay tax every year without fail; continuous payment history strengthens ownership claims.',
      'Keep all dakhila receipts organized by year in a safe place.',
      'The Bengali fiscal year runs July to June; pay before June 30 to avoid late fees.',
    ],
  },
  {
    slug: 'dcr',
    nameEn: 'Duplicate Carbon Receipt',
    nameBn: 'ডিসিআর',
    whatIsIt:
      'The DCR is a receipt issued by the Sub-Registrar office at the time of deed registration. It proves that a specific deed was submitted for registration on a specific date. It contains the deed number, registration date, and parties involved.',
    whereToGetIt:
      'Issued automatically at the Sub-Registrar office when a deed is registered. If lost, request a duplicate from the same Sub-Registrar office with the deed details.',
    estimatedCost: '100-300 BDT for a duplicate',
    estimatedTime: '3-7 working days for duplicate',
    ifMissing:
      'Visit the Sub-Registrar office where the deed was registered. Provide the deed number, approximate registration date, and names of the parties. The office can issue a certified duplicate from their records.',
    requiredFor: ['purchase', 'gift'],
    tips: [
      'The DCR is your proof that the deed was officially submitted for registration.',
      'Some banks require the DCR alongside the deed for mortgage processing.',
      'Store the DCR with your original deed documents.',
    ],
  },
  {
    slug: 'map_noksha',
    nameEn: 'Map / Noksha / Pentagraph',
    nameBn: 'নকশা / পেন্টাগ্রাফ',
    whatIsIt:
      'An official survey map showing the exact boundaries, dimensions, and location of your land plot. The noksha includes plot (dag) numbers, adjacent plots, and measurements. A pentagraph is a scaled copy of the survey map maintained at the tehsil office.',
    whereToGetIt:
      'Apply at the Tehsil or upazila land office. The Settlement office or Surveyor office can provide certified copies. For recent surveys, the AC (Land) office may have digital copies.',
    estimatedCost: '200-1,000 BDT',
    estimatedTime: '7-30 working days',
    ifMissing:
      'Apply at the Tehsil office with your khatian and plot (dag) number. If a new survey map is needed, the office will schedule a surveyor visit. For urgent needs, a licensed private surveyor can prepare a map, but the official government map carries more legal weight.',
    requiredFor: ['purchase', 'inheritance', 'partition', 'mortgage'],
    tips: [
      'Always verify that boundary markers on the ground match the survey map.',
      'If adjacent landowners dispute boundaries, get a fresh survey done by a government surveyor.',
      'Digital maps from land.gov.bd can supplement but not replace the official noksha.',
    ],
  },
  {
    slug: 'court_order',
    nameEn: 'Court Order / Decree',
    nameBn: 'আদালতের আদেশ / ডিক্রি',
    whatIsIt:
      'A court judgment or decree related to the property, typically from a civil court ruling on ownership disputes, partition suits, or injunction orders. Court orders establish legal rights when standard documents are insufficient or contested.',
    whereToGetIt:
      'Obtained from the court clerk of the relevant civil court that issued the order. Certified copies are available from the court record room with the case number.',
    estimatedCost: 'Varies (500-5,000 BDT for certified copies depending on page count)',
    estimatedTime: '7-30 working days',
    ifMissing:
      'If you know the case number, apply at the court record room for a certified copy. If you do not have the case number, a lawyer can search court records using property details and party names. For very old cases, records may be in the district court archive.',
    requiredFor: ['disputed', 'partition'],
    tips: [
      'Court orders are especially important for properties that have been through litigation.',
      'Verify that the decree has been executed (enforced); an unexecuted decree may have limited practical value.',
      'Keep both the decree and the execution order together.',
    ],
  },
  {
    slug: 'settlement_gazette',
    nameEn: 'Settlement / Lease Gazette',
    nameBn: 'বন্দোবস্ত / লিজ',
    whatIsIt:
      'A government gazette notification recording the settlement or lease of land, typically for khas (government) land allocated to individuals. This is a historical document that establishes the original grant of land rights from the government.',
    whereToGetIt:
      'Available from the DC (Deputy Commissioner) office or the gazette archive. Historical settlement records may be at the Directorate of Land Records and Surveys (DLRS) in Dhaka.',
    estimatedCost: '200-1,000 BDT for certified copies',
    estimatedTime: '15-45 working days (historical records take longer)',
    ifMissing:
      'Contact the DC office with the mouza name and any details about the original settlement. The DLRS in Dhaka maintains a central archive. For lease renewals, approach the DC office with the previous lease documents.',
    requiredFor: ['government_lease', 'khas_land'],
    tips: [
      'Settlement documents are critical for land originally allocated by the government.',
      'Check if the settlement lease has an expiry date; some government leases require periodic renewal.',
      'These records are often needed alongside regular khatian records to establish a complete ownership chain.',
    ],
  },
  {
    slug: 'succession_certificate',
    nameEn: 'Succession Certificate',
    nameBn: 'উত্তরাধিকার সনদ',
    whatIsIt:
      'A legal certificate establishing the rightful heirs of a deceased property owner. It is issued by a court (for non-Muslims) or can be established through inheritance deed and family declaration (for Muslims following Sharia inheritance law). This document is essential for transferring inherited property.',
    whereToGetIt:
      'For Muslims: Local government (Union Parishad/Municipality) can issue a Warish (heir) certificate. For formal succession: District Judge Court issues the succession certificate. Some lawyers help prepare the full inheritance calculation document.',
    estimatedCost: '1,000-10,000 BDT (court fees + lawyer if needed)',
    estimatedTime: '30-90 working days (court process)',
    ifMissing:
      'Gather: death certificate of the deceased owner, NID copies of all heirs, and the original deed in the deceased name. Apply at the local Union Parishad for a Warish certificate as an immediate step. For the full succession certificate, file a petition at the District Judge Court.',
    requiredFor: ['inheritance'],
    tips: [
      'A Warish certificate from the Union Parishad is faster but has less legal weight than a court-issued succession certificate.',
      'All legal heirs must be included; missing an heir can invalidate the succession.',
      'After getting the succession certificate, immediately apply for mutation to update land records.',
    ],
  },
  {
    slug: 'via_deed',
    nameEn: 'Via Deed (Baya Dolil)',
    nameBn: 'বায়া দলিল',
    whatIsIt:
      'The chain of previous deeds (baya dolil) tracing the ownership history of the property back through previous owners. Each link in the chain shows how the property was transferred: by sale, inheritance, gift, or partition. A complete chain of title provides the strongest proof of ownership.',
    whereToGetIt:
      'Certified copies of previous deeds from the Sub-Registrar office where each was registered. The current owner should have references to the previous deed in their own deed document.',
    estimatedCost: '500-2,000 BDT per deed (certified copy)',
    estimatedTime: '7-15 working days per deed',
    ifMissing:
      'Start from your current deed, which should reference the previous deed number. Trace back through each referenced deed at the Sub-Registrar office. A lawyer specializing in land matters can help reconstruct the chain. Typically, tracing back 25-30 years (or 3-4 transfers) is sufficient.',
    requiredFor: ['purchase', 'mortgage'],
    tips: [
      'A 25-year chain of title is standard for most property transactions in Bangladesh.',
      'Any gap in the chain is a red flag; investigate before purchasing.',
      'Banks typically require the full via deed chain for mortgage approval.',
    ],
  },
];

const DOCUMENT_INFO_MAP = new Map(DOCUMENT_INFO.map((d) => [d.slug, d]));

export function getDocumentInfo(slug: string): DocumentInfo | undefined {
  return DOCUMENT_INFO_MAP.get(slug);
}
