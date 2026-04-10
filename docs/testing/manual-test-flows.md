# Wisebox Manual Test Flows

Two critical flows that must work end-to-end before go-live. Test both on staging first, then production.

**Prerequisites:**
- A browser with dev tools open (Network tab) to verify API calls
- Access to the admin panel (admin account)
- Access to a consultant account
- A fresh email address (or use Gmail + aliases like `yourname+test1@gmail.com`)
- Check that the Resend API key is configured (emails won't send without it)

---

## Flow 1: Consultation Booking (Full Lifecycle)

This flow covers a user signing up, creating a property, booking a free consultation, and the full consultant workflow through to completion.

### Step 1: User Registration

1. Go to `/register`
2. Fill in name, email, phone, password
3. Submit the form
4. **Verify:** You land on the dashboard. Check that you see an empty state (no properties yet)
5. **Verify:** Check your email inbox for a welcome/verification email

### Step 2: Create a Property

1. From the dashboard, click "Add Property" (or equivalent CTA)
2. Fill in property details:
   - Property name (e.g. "Test Property Dhaka")
   - Select a property type, ownership type, ownership status
   - Select division, district, upazila, mouza from the dropdowns
   - Fill in any other required fields
3. Save the property
4. **Verify:** Property appears in your dashboard
5. **Verify:** Property detail page shows the information you entered

### Step 3: Upload Documents

1. Go to the property detail page
2. Upload at least one document (deed, tax receipt, etc.)
3. **Verify:** Document appears in the documents list with correct type
4. **Verify:** You can download the document you just uploaded

### Step 4: Book a Free Consultation

1. From your dashboard or property page, navigate to free consultation booking
2. Select the property you created
3. Choose preferred time slots (if prompted)
4. Add any notes about your consultation request
5. Submit the request
6. **Verify:** You see a confirmation message
7. **Verify:** Check your email for a confirmation email
8. **Verify:** The consultation request appears in your "Free Consultations" list with status "Open"

### Step 5: Admin Receives and Approves

1. **Switch to admin account** (log out and log in as admin)
2. Go to `/admin/consultations`
3. **Verify:** The new consultation request appears in the list with status "Open"
4. **Verify:** Stats bar shows updated counts
5. Click on the consultation to view details
6. **Verify:** You can see customer info, property details, and any documents
7. Click "Approve" and assign a consultant from the dropdown
8. Optionally add admin notes
9. Submit
10. **Verify:** Status changes to "Assigned"
11. **Verify:** Check admin email -- no email to admin (admin gets notified in-app only for their own actions)

### Step 6: Consultant Receives Assignment

1. **Switch to consultant account** (log out and log in as consultant)
2. Go to the consultant dashboard
3. **Verify:** You see the newly assigned ticket
4. **Verify:** Check consultant's email for an assignment notification email
5. Click on the ticket to view details
6. **Verify:** You can see customer info, property info, uploaded documents

### Step 7: Consultant Confirms Time Slot

1. On the ticket detail page, click "Confirm Slot" (or send booking link)
2. Select/confirm a meeting time
3. **Verify:** A meeting link is generated or booking link is sent
4. **Verify:** Customer receives an email with the meeting details

### Step 8: Consultant Sends Additional Info Form

1. On the ticket detail page, click "Send Form"
2. Select a form template
3. Submit
4. **Verify:** A form invitation is created
5. **Switch to customer account**
6. **Verify:** Customer can access the form (check email for the link, or check the public form URL)
7. Fill in and submit the form
8. **Switch back to consultant account**
9. **Verify:** Consultant can see the submitted form responses on the ticket

### Step 9: Consultant Comments (Customer Gets Notified)

1. As consultant, add a comment on the ticket (e.g. "I've reviewed your documents, everything looks good")
2. **Verify:** Comment appears in the ticket's comment thread
3. **Switch to customer account**
4. **Verify:** Customer receives an email notification with the comment body in a blockquote
5. **Verify:** Customer sees an in-app notification
6. **Verify:** The notification bell shows an unread count

### Step 10: Customer Replies (Consultant Gets Notified)

1. As customer, add a reply comment on the ticket (e.g. "Thank you, when can we finalize?")
2. **Verify:** Comment appears in the thread
3. **Switch to consultant account**
4. **Verify:** Consultant receives an email notification with the comment body in a blockquote
5. **Verify:** Consultant sees an in-app notification

### Step 11: Admin Rejects a Consultation (Separate Test)

1. Create another consultation request (repeat steps 1-4 with a different property or user)
2. As admin, go to the consultation and click "Reject"
3. Provide a reason
4. **Verify:** Status changes to "Cancelled"
5. **Verify:** Customer receives an email/notification with the rejection reason

---

## Flow 2: Free Assessment (Auto-Account Creation)

This flow covers a new visitor taking the free property assessment, getting auto-logged-in, and landing on their dashboard with a draft property.

### Step 1: Start the Assessment

1. Go to the homepage (or `/assessment/start`)
2. Click "Free Assessment" (or equivalent CTA)
3. **Verify:** You see the assessment questions (yes/no format)
4. **Verify:** There are at least 5 questions loaded

### Step 2: Answer All Questions

1. Answer each question by clicking Yes or No
2. **Verify:** Progress bar updates as you answer
3. **Verify:** You can go back and change answers

### Step 3: Enter Email and Submit

1. After answering all questions, enter a **fresh email address** (one that has no existing Wisebox account)
2. Click Submit
3. **Verify:** Loading state appears briefly
4. **Verify:** Results screen appears with:
   - A score out of 100
   - A status indicator (red/yellow/green with appropriate color)
   - A summary message
   - A list of gaps (things you're missing)
   - Recommended services
5. **Verify:** You see **"Go to your dashboard"** button (NOT "Create account")
6. **Verify:** You see **"Book a free consultation"** button
7. **Verify:** You see the message about a draft property waiting in your dashboard

### Step 4: Verify Auto-Login

1. Click "Go to your dashboard"
2. **Verify:** You land on the dashboard **without being asked to log in** (auto-login worked)
3. **Verify:** You see a property called **"Free Assessment"** in your property list
4. **Verify:** The property has status "Draft" and shows the correct completion status color (matches the assessment result)

### Step 5: Verify Email

1. Check the email inbox for the address you used
2. **Verify:** You received an assessment results email with:
   - Your score and status
   - List of gaps
   - A CTA button to log in / view dashboard
   - A note about the draft property

### Step 6: Edit the Draft Property

1. Click on the "Free Assessment" property
2. **Verify:** You can rename it
3. **Verify:** You can add property details (type, location, etc.)
4. **Verify:** You can upload documents
5. Save changes
6. **Verify:** Changes persist after page refresh

### Step 7: Book Consultation from Assessment

1. From the dashboard or the draft property page, initiate a free consultation booking
2. Select the "Free Assessment" property
3. Submit the consultation request
4. **Verify:** Consultation is created and appears in your list
5. **Verify:** Admin can see this in the admin consultations panel

---

## Edge Cases to Test

### Existing User Takes Assessment

1. Log out, go to the assessment page
2. Use an email address that **already has an account**
3. Complete the assessment
4. **Verify:** You still get results and a token
5. **Verify:** You are logged into the existing account (not a new one)
6. **Verify:** A new "Free Assessment" draft property is added to the existing account
7. **Verify:** If you retake within 24 hours, no duplicate draft property is created

### Admin/Consultant Email Takes Assessment

1. Log out, go to the assessment page
2. Use an email address belonging to an **admin or consultant** account
3. Complete the assessment
4. **Verify:** You get results (score, gaps, recommendations)
5. **Verify:** You do NOT get a "Go to your dashboard" button (you get "Create account" instead)
6. **Verify:** No email is sent
7. **Verify:** No error is shown (it looks the same as a normal result, just without auto-login)

### Rate Limiting

1. Submit the free assessment form rapidly (more than 5 times in 1 minute)
2. **Verify:** After the 5th attempt, you get a 429 "Too Many Requests" error
3. **Verify:** The error is shown gracefully in the UI (not a raw JSON error)

### Empty/Invalid Assessment

1. Try submitting with fewer than 5 answers
2. **Verify:** Validation error is shown
3. Try submitting with an invalid email
4. **Verify:** Validation error is shown

---

## Checklist Summary

Use this to track testing progress:

**Flow 1 - Consultation Booking:**
- [ ] User registration
- [ ] Property creation
- [ ] Document upload + download
- [ ] Free consultation booking + confirmation email
- [ ] Admin sees consultation + stats
- [ ] Admin approves + assigns consultant
- [ ] Consultant receives email + sees ticket
- [ ] Consultant views documents
- [ ] Consultant confirms time slot + meeting link sent
- [ ] Consultant sends form + customer fills it
- [ ] Consultant comments -> customer gets email with comment body
- [ ] Customer replies -> consultant gets email with comment body
- [ ] Admin rejection flow + customer notification
- [ ] In-app notifications appear correctly
- [ ] Unread notification count updates

**Flow 2 - Free Assessment:**
- [ ] Assessment questions load
- [ ] Progress bar works
- [ ] Score calculation looks correct
- [ ] Results screen shows score, status, gaps, recommendations
- [ ] Auto-login works (dashboard button, not register)
- [ ] Draft "Free Assessment" property exists in dashboard
- [ ] Email received with results
- [ ] Can edit draft property
- [ ] Can book consultation from draft property
- [ ] Existing user: gets logged in, no duplicate account
- [ ] Existing user retake within 24h: no duplicate draft
- [ ] Admin/consultant email: no token, no email, no error
- [ ] Rate limiting works (5/min)
- [ ] Validation errors show correctly
