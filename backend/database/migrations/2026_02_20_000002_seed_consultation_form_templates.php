<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed consultation form templates and fields.
 * Converted from ConsultationFormTemplateSeeder because Railpacks
 * runs migrate --force but NOT db:seed.
 */
return new class extends Migration
{
    public function up(): void
    {
        $docStatus = json_encode(['Verified', 'Not Available', 'Issues Found', 'Not Applicable']);
        $riskLevels = json_encode(['Low', 'Medium', 'High', 'Critical']);
        $now = now();

        // ── 1. Land Verification Checklist ──
        $t1 = $this->createTemplate('Land Verification Checklist', 'Document verification and field assessment for land purchase or sale. Covers all 8 core documents required per the Wisebox service catalog.', 1, 'consultant', $now);
        $this->insertFields($t1, [
            ['select', 'Recorded Khatian Status (CS/SA/RS/BS/BRS/BDS)', 'khatian_status', $docStatus, 'Verify from DC Office Records Room or Online Portal', true, 1],
            ['textarea', 'Khatian Notes', 'khatian_notes', null, 'Survey type verified, Khatian number, any discrepancies', false, 2],
            ['select', 'Deed & Via Deed Status', 'deed_status', $docStatus, 'Verify from Sub Registry Office or District Register Office. Fees: 10,000-25,000 BDT approx.', true, 3],
            ['textarea', 'Deed Notes', 'deed_notes', null, 'Deed number, registration date, chain of ownership observations', false, 4],
            ['select', 'Mutation Khatian Status', 'mutation_status', $docStatus, 'Verify from AC (Land) Office. Fees: 5,000-10,000 BDT approx.', true, 5],
            ['select', 'Duplicate Carbon Receipt (DCR) Status', 'dcr_status', $docStatus, 'Verify online via Land.gov.bd. Fees: 500-1,000 BDT approx.', true, 6],
            ['select', 'LD Tax / Dakhila / Rent Receipt Status', 'ld_tax_status', $docStatus, 'Verify online. Fees: 5,000-10,000 BDT approx.', true, 7],
            ['select', 'Map / Noksha / Pentagraph Status', 'map_noksha_status', $docStatus, 'Verify from survey records. Time: 7 days. Fees: 3,500-5,000 BDT approx.', true, 8],
            ['select', 'Field Verification (Possession & Position)', 'field_verification_status', json_encode(['Completed', 'Pending', 'Issues Found', 'Not Required']), 'Physical field visit. Time: 3-7 days. Fees: 2,000-10,000 BDT approx.', true, 9],
            ['textarea', 'Field Verification Notes', 'field_verification_notes', null, 'Boundary observations, encroachment issues, physical condition', false, 10],
            ['checkbox', 'Holding & Porcha Verification Offices Checked', 'holding_porcha_offices', json_encode(['DC Office', 'AC Land Office / Upazila Land Office', 'Union Land Office', 'Settlement Office']), 'Select all offices where verification was completed', false, 11],
            ['select', 'Holding & Porcha Verification Result', 'holding_porcha_status', $docStatus, 'Overall result of holding and porcha verification', true, 12],
            ['select', 'Overall Risk Level', 'overall_risk_level', $riskLevels, 'Consultant assessment of overall transaction risk', true, 13],
            ['textarea', 'Summary of Findings', 'findings_summary', null, 'Summarize key findings across all documents', true, 14],
            ['textarea', 'Recommendations', 'recommendations', null, 'Recommended actions, missing items to resolve, proceed/do not proceed advice', true, 15],
        ], $now);

        // ── 2. Apartment Verification Checklist ──
        $t2 = $this->createTemplate('Apartment Verification Checklist', 'Extended verification for apartment purchase or sale. Includes all land verification documents plus apartment-specific items (developer agreements, RAJUK approval, utility permits).', 2, 'consultant', $now);
        $this->insertFields($t2, [
            ['select', 'Recorded Khatian Status (CS/SA/RS/BS/BRS/BDS)', 'khatian_status', $docStatus, 'Verify from DC Office Records Room or Online Portal', true, 1],
            ['select', 'Deed & Via Deed Status', 'deed_status', $docStatus, 'Verify from Sub Registry Office', true, 2],
            ['select', 'Mutation Khatian Status', 'mutation_status', $docStatus, 'Verify from AC (Land) Office', true, 3],
            ['select', 'Duplicate Carbon Receipt (DCR) Status', 'dcr_status', $docStatus, 'Verify online via Land.gov.bd', true, 4],
            ['select', 'LD Tax / Dakhila / Rent Receipt Status', 'ld_tax_status', $docStatus, 'Verify online', true, 5],
            ['select', 'Map / Noksha / Pentagraph Status', 'map_noksha_status', $docStatus, 'Verify from survey records', true, 6],
            ['select', 'Field Verification (Possession & Position)', 'field_verification_status', json_encode(['Completed', 'Pending', 'Issues Found', 'Not Required']), 'Physical field visit', true, 7],
            ['checkbox', 'Holding & Porcha Verification Offices Checked', 'holding_porcha_offices', json_encode(['DC Office', 'AC Land Office / Upazila Land Office', 'Union Land Office', 'Settlement Office']), 'Select all offices where verification was completed', false, 8],
            ['select', 'Holding & Porcha Verification Result', 'holding_porcha_status', $docStatus, 'Overall result', true, 9],
            ['select', 'Power of Attorney (Owner-Developer)', 'poa_developer_status', $docStatus, 'Power of Attorney deed between land owner and developer', true, 10],
            ['select', 'Floor / Apartment Distribution Agreement', 'floor_distribution_status', $docStatus, 'Distribution agreement between land owner and developer', true, 11],
            ['select', 'RAJUK Building Plan Approval', 'rajuk_approval_status', $docStatus, 'Building plan approval from RAJUK', true, 12],
            ['checkbox', 'Utility Permits Verified', 'utility_permits', json_encode(['Gas', 'Electricity (Bidyut)', 'Water (WASA)', 'Sewerage (Suyoreja)']), 'Select all utility permits verified', false, 13],
            ['select', 'Building Construction Permit', 'construction_permit_status', $docStatus, 'Building construction permit from relevant authority', true, 14],
            ['select', 'Fire Service NOC', 'fire_noc_status', $docStatus, 'No Objection Certificate from Fire Service', true, 15],
            ['select', 'Car Parking Documents', 'car_parking_status', $docStatus, 'Car parking allocation and documentation', false, 16],
            ['textarea', 'Apartment-Specific Notes', 'apartment_notes', null, 'Developer reputation, construction quality, common area provisions, handover status', false, 17],
            ['select', 'Overall Risk Level', 'overall_risk_level', $riskLevels, 'Consultant assessment of overall transaction risk', true, 18],
            ['textarea', 'Summary of Findings', 'findings_summary', null, 'Summarize key findings across all documents', true, 19],
            ['textarea', 'Recommendations', 'recommendations', null, 'Recommended actions and proceed/do not proceed advice', true, 20],
        ], $now);

        // ── 3. Land Registration Eligibility ──
        $t3 = $this->createTemplate('Land Registration Eligibility', 'Eligibility assessment for land registration, covering both NRB (International) and National (Bangladeshi) applicants.', 3, 'consultant', $now);
        $this->insertFields($t3, [
            ['select', 'Registration Type', 'registration_type', json_encode(['NRB (International)', 'National (Bangladeshi)']), 'Select the applicable registration pathway', true, 1],
            ['select', 'Birth Certificate', 'birth_certificate_status', $docStatus, 'Required for both NRB and National registration', true, 2],
            ['select', 'National Identification Number (NID)', 'nid_status', $docStatus, 'MANDATORY for all registrations', true, 3],
            ['select', 'Bangladeshi Passport', 'passport_status', $docStatus, 'Required for NRB registration; optional for National', true, 4],
            ['select', 'Inheritance Certificate', 'inheritance_certificate_status', $docStatus, 'Required if land acquired through inheritance', false, 5],
            ['select', 'Land Related Documents (4 generations)', 'ancestral_land_docs_status', $docStatus, 'Land related documents tracing back to four fathers', true, 6],
            ['select', 'Photo', 'photo_status', $docStatus, 'Recent passport-sized photograph', true, 7],
            ['radio', 'Eligibility Decision', 'eligibility_decision', json_encode(['Eligible', 'Not Eligible', 'Conditionally Eligible']), 'Based on document review, is the applicant eligible?', true, 8],
            ['textarea', 'Conditions / Missing Items', 'conditions', null, 'If conditionally eligible, what needs to be resolved?', false, 9],
            ['textarea', 'Registration Notes', 'registration_notes', null, 'Additional notes on registration readiness, estimated timeline', false, 10],
        ], $now);

        // ── 4. Ownership Papers Assessment ──
        $t4 = $this->createTemplate('Ownership Papers Assessment', 'Assessment of land ownership documentation: Mutation, Land Development Tax, and government records.', 4, 'consultant', $now);
        $this->insertFields($t4, [
            ['select', 'Mutation (Namjari) Status', 'mutation_status', json_encode(['Up to Date', 'Pending Application', 'Not Applied', 'Rejected', 'Issues Found']), 'Current status of mutation/namjari', true, 1],
            ['textarea', 'Mutation Notes', 'mutation_notes', null, 'Mutation case number, office, pending issues', false, 2],
            ['select', 'Land Development Tax Status', 'ld_tax_status', json_encode(['Paid (Current Year)', 'Arrears Pending', 'Not Paid', 'Exempt']), 'Status of LD tax payments', true, 3],
            ['number', 'Outstanding Tax Amount (BDT)', 'outstanding_tax', json_encode(['min' => 0, 'max' => 10000000]), 'Amount of unpaid LD tax if any', false, 4],
            ['select', 'Government Record Status', 'record_status', json_encode(['Matches Ownership', 'Discrepancies Found', 'Records Not Available', 'Under Dispute']), 'Whether government records align with claimed ownership', true, 5],
            ['textarea', 'Record Discrepancy Details', 'discrepancy_details', null, 'Describe any discrepancies between records and claimed ownership', false, 6],
            ['select', 'Overall Ownership Status', 'overall_status', json_encode(['Clear', 'Minor Issues', 'Major Issues', 'Disputed']), 'Overall assessment of ownership documentation', true, 7],
            ['textarea', 'Recommendations', 'recommendations', null, 'Steps needed to resolve issues and strengthen ownership documentation', true, 8],
        ], $now);

        // ── 5. Inheritance Property Assessment ──
        $t5 = $this->createTemplate('Inheritance Property Assessment', 'Assessment for inheritance-based property claims. Evaluates eligibility based on religious law and required documentation.', 5, 'consultant', $now);
        $this->insertFields($t5, [
            ['select', 'Applicable Religious Law', 'religion', json_encode(['Islam (Sharia)', 'Hindu', 'Buddhist', 'Christian', 'Other / Custom']), 'Inheritance distribution rules vary by religion', true, 1],
            ['select', 'Inheritance Type', 'inheritance_type', json_encode(['Direct Succession', 'Will-Based (Wasiyat)', 'Court Decree', 'Family Settlement']), 'How the inheritance claim is being made', true, 2],
            ['select', 'Death Certificate of Previous Owner', 'death_certificate_status', $docStatus, 'Required to establish inheritance claim', true, 3],
            ['select', 'Succession Certificate / Waris Certificate', 'succession_certificate_status', $docStatus, 'Court-issued succession certificate or waris certificate', true, 4],
            ['select', 'Legal Heir Certificate', 'legal_heir_certificate_status', $docStatus, 'If applicable, certificate identifying legal heirs', false, 5],
            ['number', 'Total Number of Legal Heirs', 'total_heirs', json_encode(['min' => 1, 'max' => 100]), 'Total number of identified legal heirs', true, 6],
            ['textarea', 'Heir Identification', 'heir_identification', null, 'List all identified heirs and their relationship to the deceased', true, 7],
            ['textarea', 'Property Distribution Plan', 'distribution_plan', null, 'Proposed distribution shares per applicable law', true, 8],
            ['radio', 'Legal Complications', 'legal_complications', json_encode(['None', 'Minor (resolvable)', 'Major (requires legal action)']), 'Are there competing claims or disputes among heirs?', true, 9],
            ['textarea', 'Complications Detail', 'complications_detail', null, 'Describe any disputes, competing claims, or missing heirs', false, 10],
            ['textarea', 'Recommendations', 'recommendations', null, 'Next steps for completing the inheritance process', true, 11],
        ], $now);

        // ── 6. Problem Identification Report ──
        $t6 = $this->createTemplate('Problem Identification Report', 'Structured report for identifying land-related problems and recommending solutions.', 6, 'consultant', $now);
        $this->insertFields($t6, [
            ['select', 'Problem Category', 'problem_category', json_encode(['Ownership Dispute', 'Boundary / Encroachment', 'Document Discrepancy', 'Tax / Revenue Issue', 'Fraud Suspicion', 'Government Acquisition', 'Title Defect', 'Other']), 'Primary category of the identified problem', true, 1],
            ['textarea', 'Problem Description', 'problem_description', null, 'Detailed description of the problem as reported by the customer', true, 2],
            ['textarea', 'Root Cause Analysis', 'root_cause', null, 'What is the underlying cause of this problem?', true, 3],
            ['textarea', 'Affected Parties', 'affected_parties', null, 'Who else is affected? (neighboring owners, government, developers, etc.)', false, 4],
            ['select', 'Urgency Level', 'urgency', json_encode(['Low (informational)', 'Medium (action within 30 days)', 'High (action within 7 days)', 'Critical (immediate action required)']), 'How urgently does this need resolution?', true, 5],
            ['textarea', 'Recommended Solutions', 'recommended_solutions', null, 'Step-by-step recommended actions to resolve the problem', true, 6],
            ['text', 'Estimated Resolution Timeline', 'estimated_timeline', null, 'e.g. "2-3 months" or "6+ months if court case needed"', false, 7],
            ['number', 'Estimated Resolution Cost (BDT)', 'estimated_cost', json_encode(['min' => 0, 'max' => 10000000]), 'Approximate total cost to resolve', false, 8],
            ['select', 'Likelihood of Resolution', 'resolution_likelihood', json_encode(['High', 'Medium', 'Low', 'Uncertain']), 'How likely is successful resolution?', true, 9],
            ['textarea', 'Additional Notes', 'additional_notes', null, 'Any other observations or warnings', false, 10],
        ], $now);

        // ── 7. Document Search Report ──
        $t7 = $this->createTemplate('Document Search Report', 'Report for government record searches: deed searching, porcha searching, map/khatian searching, land register searching, and return searching.', 7, 'consultant', $now);
        $this->insertFields($t7, [
            ['select', 'Search Location', 'search_location', json_encode(['Registration Office (Sub Registry)', 'Settlement Office', 'DC Record Room', 'Union Land Office', 'Upazila Land Office', 'AC Land Office', 'Online Portal (Land.gov.bd)', 'Multiple Locations']), 'Where the search was conducted', true, 1],
            ['select', 'Search Type', 'search_type', json_encode(['Deed / Baiya / Pre-Deed', 'Porcha', 'Map / Khatian', 'Land Register (Register II & IX)', 'Return', 'Pentagraph', 'History Analysis']), 'Type of documents searched for', true, 2],
            ['textarea', 'Search Parameters', 'search_parameters', null, 'What was searched: mouza, JL number, plot/dag number, khatian number, owner name, deed number, etc.', true, 3],
            ['radio', 'Documents Found', 'documents_found', json_encode(['Yes (complete)', 'Partial', 'Not Found']), 'Were the requested documents located?', true, 4],
            ['textarea', 'Findings Summary', 'findings_summary', null, 'What was found, document details, relevant entries', true, 5],
            ['select', 'Document Condition', 'document_condition', json_encode(['Good / Legible', 'Readable but Aged', 'Partially Damaged', 'Illegible / Severely Damaged', 'Digital Copy Available']), 'Physical condition of located documents', false, 6],
            ['radio', 'Certified Copies Obtained', 'certified_copies', json_encode(['Yes', 'No (not available)', 'No (fees pending)', 'Requested (in process)']), 'Were certified copies obtained?', false, 7],
            ['number', 'Search Fees Paid (BDT)', 'search_fees', json_encode(['min' => 0, 'max' => 100000]), 'Total fees paid for the search', false, 8],
            ['textarea', 'Discrepancies or Concerns', 'discrepancies', null, 'Any mismatches between records, suspicious entries, or concerns', false, 9],
            ['textarea', 'Recommendations', 'recommendations', null, 'Next steps based on search findings', true, 10],
        ], $now);

        // ── 8. Legal Case Assessment ──
        $t8 = $this->createTemplate('Legal Case Assessment', 'Assessment form for legal proceedings: Misc Cases (AC Land Office), Appeal Cases (ADC Revenue, Additional Commissioner, Land Appeal Board).', 8, 'consultant', $now);
        $this->insertFields($t8, [
            ['select', 'Case Type', 'case_type', json_encode(['Misc Case (AC Land Office)', 'Appeal (ADC Revenue)', 'Appeal (Additional Commissioner)', 'Appeal (Land Appeal Board)', 'Civil Suit', 'Other']), 'Type of legal proceeding', true, 1],
            ['text', 'Case Number', 'case_number', null, 'Official case/file number if assigned', false, 2],
            ['date', 'Filing Date', 'filing_date', null, 'Date the case was filed or will be filed', false, 3],
            ['select', 'Current Status', 'current_status', json_encode(['Not Yet Filed', 'Filed / Pending', 'Hearing Scheduled', 'Under Review', 'Stay Order Issued', 'Decided (Favorable)', 'Decided (Unfavorable)', 'Appealed']), 'Current status of the case', true, 4],
            ['text', 'Court / Office', 'court_office', null, 'Name of the court or land office handling the case', false, 5],
            ['text', 'Opposing Party', 'opposing_party', null, 'Name of the opposing party in the case', false, 6],
            ['textarea', 'Case Summary', 'case_summary', null, 'Brief summary of what the case is about', true, 7],
            ['textarea', 'Arguments / Grounds', 'legal_arguments', null, 'Key legal arguments or grounds for the case', true, 8],
            ['select', 'Likelihood of Success', 'likelihood_of_success', json_encode(['High', 'Medium', 'Low', 'Uncertain / Depends on Evidence']), 'Assessment of likely outcome', true, 9],
            ['textarea', 'Evidence Assessment', 'evidence_assessment', null, 'What evidence is available? What is missing?', false, 10],
            ['text', 'Estimated Timeline', 'estimated_timeline', null, 'Expected duration of the case proceedings', false, 11],
            ['number', 'Estimated Legal Costs (BDT)', 'estimated_costs', json_encode(['min' => 0, 'max' => 10000000]), 'Total estimated legal costs', false, 12],
            ['textarea', 'Recommended Next Steps', 'recommended_next_steps', null, 'What should the customer do next?', true, 13],
        ], $now);

        // ── 9. Specialized Property Analysis ──
        $t9 = $this->createTemplate('Specialized Property Analysis', 'Assessment for specialized property types: Waqf land, Vested property, Abandoned property, Mortgage property, Khash land, Power of Attorney, Baynama Dolil, and lost deed recovery.', 9, 'consultant', $now);
        $this->insertFields($t9, [
            ['select', 'Analysis Type', 'analysis_type', json_encode(['Waqf Land', 'Vested Property', 'Abandoned Property', 'Mortgage Property', 'Khash Land', 'Power of Attorney', 'Baynama Dolil', 'Lost Deed Recovery', 'Pentagraph Survey', 'Historical Chain Analysis']), 'What type of specialized analysis is being conducted?', true, 1],
            ['text', 'Property Classification', 'property_classification', null, 'Government classification or special status of the property', false, 2],
            ['checkbox', 'Government Records Reviewed', 'records_reviewed', json_encode(['DC Office', 'AC Land Office', 'Settlement Office', 'Sub-Registry Office', 'RAJUK', 'Municipality / City Corporation', 'Waqf Board', 'Online Portal']), 'Select all offices where records were reviewed', false, 3],
            ['radio', 'Historical Ownership Chain Verified', 'chain_verified', json_encode(['Yes (complete chain)', 'Partial (gaps found)', 'No (unable to verify)']), 'Was the full ownership chain traced?', true, 4],
            ['textarea', 'Historical Chain Details', 'chain_details', null, 'Document the ownership chain and any gaps', false, 5],
            ['select', 'Legal Status', 'legal_status', json_encode(['Clear / No Encumbrance', 'Encumbered (lien/mortgage)', 'Under Government Control', 'Disputed / Under Litigation', 'Waqf Designated', 'Vested / Enemy Property Listed', 'Khash (Government) Land']), 'Current legal status of the property', true, 6],
            ['textarea', 'Risk Factors', 'risk_factors', null, 'Key risk factors identified during analysis', true, 7],
            ['textarea', 'Restrictions & Encumbrances', 'restrictions', null, 'Any restrictions on transfer, use, or development', false, 8],
            ['select', 'Overall Assessment', 'overall_assessment', json_encode(['Favorable (proceed with caution)', 'Moderate Risk (issues resolvable)', 'High Risk (significant barriers)', 'Unfavorable (recommend against)']), 'Overall recommendation', true, 9],
            ['textarea', 'Detailed Recommendations', 'recommendations', null, 'Comprehensive recommendations and next steps', true, 10],
            ['textarea', 'Follow-Up Actions', 'follow_up_actions', null, 'Specific follow-up items with responsible parties and timelines', false, 11],
        ], $now);

        // ── 10. Property Document Checklist (Customer) ──
        $t10 = $this->createTemplate('Property Document Checklist', 'Help us understand which documents you currently have for your property. This helps the consultant prepare for your consultation.', 10, 'customer', $now);
        $this->insertFields($t10, [
            ['radio', 'Do you have a Recorded Khatian (RS/BS/CS/BRS/BDS)?', 'khatian', json_encode(['Yes, original', 'Yes, a copy', 'No', "I'm not sure"]), 'A Khatian is the government record of land ownership', true, 1],
            ['radio', 'Do you have the Deed (Dolil) for this property?', 'deed', json_encode(['Yes, original', 'Yes, a copy', 'No', "I'm not sure"]), 'The deed is the legal document proving transfer of ownership', true, 2],
            ['radio', 'Has the property been mutated (Namjari) in your name?', 'mutation', json_encode(['Yes', 'No', 'In progress', "I'm not sure"]), 'Mutation means the government records have been updated to show you as the owner', true, 3],
            ['radio', 'Do you have a Duplicate Carbon Receipt (DCR)?', 'dcr', json_encode(['Yes', 'No', "I'm not sure"]), 'The DCR is a receipt from the registration office', false, 4],
            ['radio', 'Do you have Land Development Tax (LD Tax/Dakhila) receipts?', 'ld_tax', json_encode(['Yes, up to date', 'Yes, but outdated', 'No', "I'm not sure"]), 'Annual tax receipts for your land', true, 5],
            ['radio', 'Do you have a Map/Noksha/Pentagraph?', 'map_noksha', json_encode(['Yes', 'No', "I'm not sure"]), 'A survey map or plot diagram of the property', false, 6],
            ['radio', 'Are there any known disputes about this property?', 'disputes', json_encode(['No disputes', 'Yes, boundary dispute', 'Yes, ownership dispute', 'Yes, other']), null, true, 7],
            ['textarea', 'If there are disputes, please describe', 'dispute_details', null, 'Tell us what you know about the dispute', false, 8],
            ['textarea', 'Any other documents you have', 'other_documents', null, 'List any other property-related documents you have', false, 9],
        ], $now);

        // ── 11. Property Information Form (Customer) ──
        $t11 = $this->createTemplate('Property Information Form', 'Tell us about your property so the consultant can prepare for your consultation. The more details you provide, the better we can help.', 11, 'customer', $now);
        $this->insertFields($t11, [
            ['select', 'Property type', 'property_type', json_encode(['Land', 'Apartment', 'Both (Land + Building)']), null, true, 1],
            ['text', 'Approximate property size', 'property_size', null, 'e.g. "5 katha" or "1200 sq ft"', true, 2],
            ['text', 'Property location (District, Upazila, Mouza)', 'property_location', null, 'Be as specific as you can', true, 3],
            ['select', 'How did you acquire this property?', 'acquisition_method', json_encode(['Purchased', 'Inherited', 'Gift', 'Government allocation', 'Other']), null, true, 4],
            ['select', 'How long have you owned it?', 'ownership_duration', json_encode(['Less than 1 year', '1-5 years', '5-10 years', 'More than 10 years', 'Not yet acquired']), null, true, 5],
            ['checkbox', 'What do you need help with?', 'help_needed', json_encode(['Document verification', 'Registration', 'Ownership transfer', 'Dispute resolution', 'Property search', 'Other']), 'Select all that apply', true, 6],
            ['radio', 'Is anyone else claiming ownership?', 'competing_claims', json_encode(['No', 'Yes', "I'm not sure"]), null, true, 7],
            ['textarea', 'Please describe your situation', 'situation_description', null, 'Tell us what you need help with in your own words', true, 8],
        ], $now);

        // ── 12. Inheritance Information Form (Customer) ──
        $t12 = $this->createTemplate('Inheritance Information Form', 'If you are dealing with inherited property, please provide the following information to help the consultant understand your situation.', 12, 'customer', $now);
        $this->insertFields($t12, [
            ['select', 'Your relationship to the deceased owner', 'relationship', json_encode(["Son/Daughter", "Spouse", "Grandchild", "Sibling", "Other relative"]), null, true, 1],
            ['select', 'Religion of the deceased (determines inheritance law)', 'religion', json_encode(['Islam', 'Hindu', 'Buddhist', 'Christian', 'Other']), 'Inheritance distribution rules vary by religion in Bangladesh', true, 2],
            ['radio', 'Do you have the Death Certificate?', 'death_certificate', json_encode(['Yes', 'No', 'Applied but not received']), null, true, 3],
            ['radio', 'Do you have a Waris (Succession) Certificate?', 'waris_certificate', json_encode(['Yes', 'No', 'Applied but not received', "I don't know what this is"]), 'A Waris certificate identifies the legal heirs of the deceased', true, 4],
            ['number', 'How many heirs are there in total?', 'total_heirs', json_encode(['min' => 1, 'max' => 100]), 'Include all legal heirs, even if some are not involved', true, 5],
            ['radio', 'Are all heirs in agreement about the property?', 'heirs_agreement', json_encode(['Yes, all agree', 'No, there is a dispute', 'Some heirs are unreachable']), null, true, 6],
            ['checkbox', 'What documents do you currently have?', 'available_documents', json_encode(['Death Certificate', 'Waris Certificate', 'Original Deed', 'Khatian', 'Mutation Record', 'None of these']), 'Select all that apply', true, 7],
            ['textarea', 'Please describe your inheritance situation', 'inheritance_description', null, 'Tell us about the inheritance and any challenges you are facing', true, 8],
        ], $now);

        // ── 13. Issue Description Form (Customer) ──
        $t13 = $this->createTemplate('Issue Description Form', 'Describe the property issue you are facing. This helps the consultant understand your problem before the consultation.', 13, 'customer', $now);
        $this->insertFields($t13, [
            ['select', 'What type of issue are you facing?', 'issue_type', json_encode(['Someone is claiming my property', 'Boundary or land grab issue', 'Missing or lost documents', 'Problem with registration', 'Tax or payment issue', 'Legal case', 'Other']), null, true, 1],
            ['select', 'How long has this been going on?', 'issue_duration', json_encode(['Just started', 'Less than 6 months', '6 months to 1 year', '1-3 years', 'More than 3 years']), null, true, 2],
            ['radio', 'Have you taken any steps to resolve it?', 'steps_taken', json_encode(['No, this is new', "Yes, I've tried on my own", "Yes, I've hired a lawyer", "Yes, there's an ongoing court case"]), null, true, 3],
            ['textarea', 'If you have taken steps, what happened?', 'steps_details', null, 'Describe what you have tried so far', false, 4],
            ['textarea', 'Who else is involved? (other claimants, neighbors, government)', 'involved_parties', null, 'List anyone else connected to this issue', false, 5],
            ['textarea', 'What outcome are you hoping for?', 'desired_outcome', null, 'Tell us what resolution you are looking for', true, 6],
            ['radio', 'How urgent is this?', 'urgency', json_encode(['Not urgent, just need guidance', 'Somewhat urgent (next few months)', 'Very urgent (need help now)']), null, true, 7],
            ['textarea', 'Any documents related to this issue?', 'related_documents', null, 'List any documents you have that relate to this problem', false, 8],
        ], $now);

        // ── Link templates to services ──
        $this->linkTemplatesToServices($now);
    }

    public function down(): void
    {
        DB::table('service_consultation_templates')->delete();
        DB::table('consultation_form_fields')->delete();
        DB::table('consultation_form_templates')->delete();
    }

    private function createTemplate(string $name, string $description, int $sortOrder, string $audience, $now): int
    {
        // Skip if already exists (idempotent)
        $existing = DB::table('consultation_form_templates')->where('name', $name)->value('id');
        if ($existing) {
            return $existing;
        }

        return DB::table('consultation_form_templates')->insertGetId([
            'name' => $name,
            'description' => $description,
            'is_active' => true,
            'sort_order' => $sortOrder,
            'audience' => $audience,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    private function insertFields(int $templateId, array $fields, $now): void
    {
        // Skip if fields already exist for this template
        if (DB::table('consultation_form_fields')->where('template_id', $templateId)->exists()) {
            return;
        }

        $rows = [];
        foreach ($fields as [$type, $label, $name, $options, $help, $required, $order]) {
            $rows[] = [
                'template_id' => $templateId,
                'field_type' => $type,
                'field_label' => $label,
                'field_name' => $name,
                'field_options' => $options,
                'help_text' => $help,
                'is_required' => $required,
                'sort_order' => $order,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('consultation_form_fields')->insert($rows);
    }

    private function linkTemplatesToServices($now): void
    {
        $links = [
            'Land Verification Checklist' => [
                ['land-purchase-verification', true],
                ['land-sale-verification', true],
            ],
            'Apartment Verification Checklist' => [
                ['apartment-purchase-verification', true],
                ['apartment-sale-verification', true],
            ],
            'Land Registration Eligibility' => [
                ['land-registration-nrb', true],
                ['land-registration-national', true],
            ],
            'Ownership Papers Assessment' => [
                ['land-ownership-papers', true],
            ],
            'Inheritance Property Assessment' => [
                ['inheritance-property', true],
            ],
            'Problem Identification Report' => [
                ['land-problem-identification', true],
                ['free-consultation', false],
                ['expert-consultation', false],
            ],
            'Document Search Report' => [
                ['deed-searching', true],
                ['porcha-searching', true],
                ['map-khatian-dc-search', true],
            ],
            'Legal Case Assessment' => [
                ['misc-case-ac-land', true],
                ['appeal-case-adc', true],
            ],
            'Specialized Property Analysis' => [
                ['special-property-analysis', true],
                ['power-of-attorney', true],
                ['baynama-dolil', true],
                ['deed-document-lost', true],
            ],
        ];

        foreach ($links as $templateName => $serviceLinks) {
            $templateId = DB::table('consultation_form_templates')->where('name', $templateName)->value('id');
            if (!$templateId) {
                continue;
            }

            foreach ($serviceLinks as [$serviceSlug, $isRequired]) {
                $serviceId = DB::table('services')->where('slug', $serviceSlug)->value('id');
                if (!$serviceId) {
                    continue;
                }

                DB::table('service_consultation_templates')->updateOrInsert(
                    ['service_id' => $serviceId, 'template_id' => $templateId],
                    ['is_required' => $isRequired, 'created_at' => $now, 'updated_at' => $now]
                );
            }
        }
    }
};
