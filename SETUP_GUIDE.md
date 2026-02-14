---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Wisebox Consultation System Setup Guide

## 1. Email Service Setup (Brevo - Recommended)

### Why Brevo?
- **Free tier**: 300 emails/day (9,000/month)
- **Easy setup**: 5 minutes
- **Reliable**: 99.9% delivery rate
- **Built-in Laravel support**

### Step-by-Step Setup:

1. **Create Brevo Account**
   - Go to: https://www.brevo.com/
   - Click "Sign up free"
   - Verify your email

2. **Get SMTP Credentials**
   - Log in to Brevo dashboard
   - Navigate to: **Settings** → **SMTP & API**
   - Click **SMTP** tab
   - You'll see your credentials:
     - **SMTP Server**: smtp-relay.brevo.com
     - **Port**: 587
     - **Login**: (your email)
     - **Password**: (SMTP key - click "Create new key" if needed)

3. **Update Backend Environment**
   ```bash
   cd backend
   ```

   Edit `.env` file:
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=smtp-relay.brevo.com
   MAIL_PORT=587
   MAIL_USERNAME=your-brevo-email@example.com
   MAIL_PASSWORD=your-smtp-key-here
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=noreply@wiseboxinc.com
   MAIL_FROM_NAME="Wisebox"
   ```

4. **Test Email**
   ```bash
   php artisan tinker

   # In tinker:
   Mail::raw('Test email from Wisebox', function ($message) {
       $message->to('your-email@example.com')
               ->subject('Test Email');
   });
   ```

   Check your inbox for the test email!

---

## 2. Google Meet Integration Setup

### Prerequisites
- Google Account (Gmail)
- 15 minutes of setup time

### Step-by-Step Setup:

#### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click dropdown at top left (next to "Google Cloud")
   - Click "New Project"
   - **Project name**: "Wisebox Consultations"
   - Click "Create"
   - Wait for project creation (30 seconds)

#### Step 2: Enable APIs

1. **Enable Google Calendar API**
   - In left sidebar: **APIs & Services** → **Library**
   - Search for "Google Calendar API"
   - Click on it
   - Click "Enable"
   - Wait for it to enable (30 seconds)

2. **Enable Google Meet API** (if available)
   - Same process: Search "Google Meet" → Enable

#### Step 3: Create OAuth Credentials

1. **Configure OAuth Consent Screen**
   - Left sidebar: **APIs & Services** → **OAuth consent screen**
   - Select **External** (unless you have Google Workspace)
   - Click "Create"
   - Fill in:
     - **App name**: Wisebox
     - **User support email**: your-email@example.com
     - **Developer contact**: your-email@example.com
   - Click "Save and Continue"
   - **Scopes**: Click "Add or Remove Scopes"
     - Search and add:
       - Google Calendar API (...auth/calendar)
       - Google Calendar API (...auth/calendar.events)
   - Click "Save and Continue"
   - **Test users**: Add your email
   - Click "Save and Continue"

2. **Create OAuth 2.0 Client ID**
   - Left sidebar: **APIs & Services** → **Credentials**
   - Click "**+ CREATE CREDENTIALS**" → **OAuth client ID**
   - **Application type**: Web application
   - **Name**: Wisebox Backend
   - **Authorized redirect URIs**: Click "+ ADD URI"
     - Add: `http://localhost:8000/auth/google/callback`
     - Add: `https://your-domain.com/auth/google/callback` (for production)
   - Click "Create"
   - **IMPORTANT**: Copy the Client ID and Client Secret that appear

#### Step 4: Update Backend Configuration

1. **Install Google API Client**
   ```bash
   cd backend
   composer require google/apiclient:^2.0
   ```

2. **Update .env**
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
   ```

3. **Clear Config Cache**
   ```bash
   php artisan config:clear
   ```

#### Step 5: Authenticate with Google

1. **Run Auth Command**
   ```bash
   php artisan google:auth
   ```

2. **Follow Instructions**
   - Command will show a URL
   - Copy the URL
   - Open in your browser
   - Sign in with Google
   - Click "Allow" to grant permissions
   - Google will show an authorization code
   - Copy the code
   - Paste it back in the terminal

3. **Store Access Token**
   - Command will output the access token
   - Copy the entire line starting with `GOOGLE_ACCESS_TOKEN=`
   - Add it to your `.env` file

4. **Verify Setup**
   ```bash
   # Test Google Calendar connection
   php artisan tinker

   # In tinker:
   $service = app(\App\Services\GoogleCalendarService::class);
   echo "Google Calendar Service initialized successfully!";
   ```

---

## 3. Alternative Email Services

If you prefer not to use Brevo, here are alternatives:

### Mailgun (5,000 emails/month free)
```env
MAIL_MAILER=mailgun
MAIL_DOMAIN=your-domain.com
MAILGUN_SECRET=your-mailgun-key
MAILGUN_ENDPOINT=api.mailgun.net
```

### Amazon SES (3,000 emails/month free)
```env
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
```

### Postmark (100 emails/month free)
```env
MAIL_MAILER=postmark
POSTMARK_API_KEY=your-postmark-key
```

---

## 4. Testing the Setup

### Test Email Sending
```bash
cd backend
php artisan tinker

# Send test email
Mail::raw('Consultation booking confirmed!', function ($message) {
    $message->to('test@example.com')
            ->subject('Wisebox Test Email');
});
```

### Test Google Meet Creation (after building the consultation flow)
```php
// This will be available once we build the consultation ticket system
$ticket = Ticket::first();
$service = app(\App\Services\GoogleCalendarService::class);

$meeting = $service->createConsultationMeeting(
    $ticket,
    now()->addDay(),
    60 // 60 minutes
);

dump($meeting);
// Should show: event_id, meet_link, calendar_link
```

---

## 5. Troubleshooting

### Email Not Sending?
1. Check Brevo dashboard for errors
2. Verify SMTP credentials in `.env`
3. Check Laravel logs: `tail -f storage/logs/laravel.log`
4. Test with: `php artisan config:clear && php artisan queue:restart`

### Google Meet Not Working?
1. Verify APIs are enabled in Google Cloud Console
2. Check OAuth consent screen is published
3. Verify redirect URI matches exactly
4. Run `php artisan google:auth` again to re-authenticate
5. Check Laravel logs for detailed error messages

### Common Errors

**"Invalid credentials"** (Brevo)
- Double-check MAIL_USERNAME and MAIL_PASSWORD in `.env`
- Create a new SMTP key in Brevo dashboard

**"OAuth error: redirect_uri_mismatch"** (Google)
- Your redirect URI in code doesn't match Google Cloud Console
- Add exact URI to "Authorized redirect URIs" in credentials

**"Token expired"** (Google)
- Run `php artisan google:auth` again to refresh token

---

## 6. Next Steps

Once setup is complete, we'll implement:

1. **Property Details Page Enhancement**
   - "Book Free Consultation" button
   - Consultation history section

2. **Service Booking Flow**
   - Custom time slot picker
   - Ticket creation with preferred times

3. **Admin Portal Extension**
   - Ticket management
   - Consultant assignment

4. **Consultant Portal**
   - Accept/reject cases
   - Slot selection → Google Meet creation
   - Consultation forms

5. **Consultation Journal**
   - Save consultation notes to property
   - Display remedies to users

---

## Need Help?

If you encounter any issues during setup:

1. Check the error message in terminal
2. Check Laravel logs: `storage/logs/laravel.log`
3. Review this guide step-by-step
4. Share the exact error message for debugging

**Common Support Questions:**

Q: "Do I need a paid Google Workspace account?"
A: No! Regular free Gmail account works fine.

Q: "Will this work on localhost for development?"
A: Yes! Everything works locally. You'll need to update redirect URIs for production.

Q: "How many meetings can I create?"
A: Google Calendar API has generous limits (1,000,000 requests/day for free projects).

## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
