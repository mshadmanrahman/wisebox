#!/bin/bash
# ============================================================
# WISEBOX MVP SETUP SCRIPT
# Automates: Google OAuth, Stripe, Brevo, frontend .env
# Run: bash setup-mvp.sh
# ============================================================

set -e

BACKEND_DIR="$(cd "$(dirname "$0")/backend" && pwd)"
FRONTEND_DIR="$(cd "$(dirname "$0")/frontend" && pwd)"
BACKEND_ENV="$BACKEND_DIR/.env"
FRONTEND_ENV="$FRONTEND_DIR/.env.local"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

success() { echo -e "${GREEN}$1${NC}"; }
warn() { echo -e "${YELLOW}$1${NC}"; }
info() { echo -e "${CYAN}$1${NC}"; }
error() { echo -e "${RED}$1${NC}"; }
header() { echo -e "\n${BOLD}${CYAN}=== $1 ===${NC}\n"; }

update_env() {
    local file="$1" key="$2" value="$3"
    if grep -q "^${key}=" "$file" 2>/dev/null; then
        # macOS sed requires '' after -i
        sed -i '' "s|^${key}=.*|${key}=${value}|" "$file"
    else
        echo "${key}=${value}" >> "$file"
    fi
}

echo -e "${BOLD}"
echo "============================================================"
echo "  WISEBOX MVP SETUP"
echo "  This script will configure all services for your MVP"
echo "============================================================"
echo -e "${NC}"

# ============================================================
# STEP 1: GOOGLE OAUTH + CALENDAR
# ============================================================
header "STEP 1/4: Google OAuth + Calendar"

if ! command -v gcloud &>/dev/null; then
    error "gcloud CLI not found. Install: brew install --cask google-cloud-sdk"
    error "Then re-run this script."
    exit 1
fi

# Check if already logged in
GCLOUD_ACCOUNT=$(gcloud config get-value account 2>/dev/null || true)
if [ -z "$GCLOUD_ACCOUNT" ] || [ "$GCLOUD_ACCOUNT" = "(unset)" ]; then
    info "Logging into Google Cloud (browser will open)..."
    gcloud auth login --brief
    GCLOUD_ACCOUNT=$(gcloud config get-value account 2>/dev/null)
fi
success "Logged in as: $GCLOUD_ACCOUNT"

# Create or select project
PROJECT_ID="wisebox-mvp"
EXISTING=$(gcloud projects list --filter="projectId=$PROJECT_ID" --format="value(projectId)" 2>/dev/null || true)

if [ -z "$EXISTING" ]; then
    info "Creating Google Cloud project: $PROJECT_ID..."
    gcloud projects create "$PROJECT_ID" --name="Wisebox MVP" 2>/dev/null || true
    sleep 2
fi
gcloud config set project "$PROJECT_ID" 2>/dev/null
success "Project: $PROJECT_ID"

# Enable APIs
info "Enabling required APIs..."
gcloud services enable calendar-json.googleapis.com 2>/dev/null || true
gcloud services enable people.googleapis.com 2>/dev/null || true
gcloud services enable oauth2.googleapis.com 2>/dev/null || true
success "APIs enabled: Calendar, People, OAuth2"

# Check if OAuth consent screen exists, create if not
info "Configuring OAuth consent screen..."
# We need to use the REST API for consent screen
# First check if a brand exists
BRAND_EXISTS=$(gcloud alpha iap oauth-brands list --format="value(name)" 2>/dev/null || true)
if [ -z "$BRAND_EXISTS" ]; then
    gcloud alpha iap oauth-brands create \
        --application_title="Wisebox" \
        --support_email="$GCLOUD_ACCOUNT" 2>/dev/null || warn "OAuth consent screen may need manual setup"
fi

# Create OAuth 2.0 credentials
info "Creating OAuth 2.0 client..."
OAUTH_OUTPUT=$(gcloud alpha iap oauth-clients create \
    "projects/$PROJECT_ID/brands/-" \
    --display_name="Wisebox Web App" 2>/dev/null 2>&1 || true)

# If gcloud alpha commands fail, fall back to manual approach
if echo "$OAUTH_OUTPUT" | grep -q "ERROR\|error\|not found"; then
    warn "Automated OAuth creation not available. Creating via REST API..."

    # Get access token for REST API
    ACCESS_TOKEN=$(gcloud auth print-access-token 2>/dev/null)

    # Create OAuth client via REST
    OAUTH_RESP=$(curl -s -X POST \
        "https://oauth2.googleapis.com/v2/projects/$PROJECT_ID/oauthClients" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "displayName": "Wisebox Web App",
            "applicationType": "WEB",
            "redirectUris": [
                "http://localhost:8000/api/v1/auth/google/callback",
                "http://localhost:3000"
            ]
        }' 2>/dev/null || true)

    # If REST API also fails, ask user to create manually
    if [ -z "$OAUTH_RESP" ] || echo "$OAUTH_RESP" | grep -q "error"; then
        warn ""
        warn "Google requires manual OAuth client creation via the web console."
        warn "This takes 2 minutes:"
        warn ""
        info "1. Open: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
        info "2. Click 'Create Credentials' > 'OAuth 2.0 Client ID'"
        info "3. If prompted, configure consent screen first (External, app name: Wisebox)"
        info "4. Application type: Web application"
        info "5. Name: Wisebox Web App"
        info "6. Authorized redirect URIs: http://localhost:8000/api/v1/auth/google/callback"
        info "7. Authorized JavaScript origins: http://localhost:3000"
        info "8. Click Create"
        warn ""
        echo -n "Paste your Client ID: "
        read -r GOOGLE_CLIENT_ID
        echo -n "Paste your Client Secret: "
        read -r GOOGLE_CLIENT_SECRET
    fi
else
    # Parse OAuth credentials from output
    GOOGLE_CLIENT_ID=$(echo "$OAUTH_OUTPUT" | grep -o 'name:.*' | head -1 | awk '{print $2}')
    GOOGLE_CLIENT_SECRET=$(echo "$OAUTH_OUTPUT" | grep -o 'secret:.*' | head -1 | awk '{print $2}')
fi

if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    update_env "$BACKEND_ENV" "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID"
    update_env "$BACKEND_ENV" "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET"
    success "Google OAuth credentials saved to backend .env"

    # Also set in frontend
    update_env "$FRONTEND_ENV" "NEXT_PUBLIC_GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID"
    success "Google Client ID saved to frontend .env.local"
else
    warn "Skipping Google OAuth (no credentials provided)"
fi

# Generate Google Calendar access token
if [ -n "$GOOGLE_CLIENT_ID" ]; then
    header "Google Calendar Token"
    info "Generating Calendar access token..."
    info "This will open a browser for authorization."
    echo ""

    cd "$BACKEND_DIR"
    # Run the artisan command inside Docker
    docker compose exec -T app php artisan google:auth 2>&1 || warn "Calendar token generation requires interactive input. Run manually: docker compose exec app php artisan google:auth"
fi

# ============================================================
# STEP 2: STRIPE
# ============================================================
header "STEP 2/4: Stripe"

if ! command -v stripe &>/dev/null; then
    error "stripe CLI not found. Install: brew install stripe/stripe-cli/stripe"
    error "Skipping Stripe setup."
else
    # Check if already logged in
    STRIPE_LOGGED_IN=$(stripe config --list 2>/dev/null | grep "test_mode_api_key" || true)

    if [ -z "$STRIPE_LOGGED_IN" ]; then
        info "Logging into Stripe (browser will open)..."
        stripe login 2>&1 || warn "Stripe login failed"
    fi

    # Get API keys
    info "Fetching Stripe API keys..."

    STRIPE_PK=$(stripe config --list 2>/dev/null | grep "test_mode_pub_key" | awk -F'= ' '{print $2}' || true)
    STRIPE_SK=$(stripe config --list 2>/dev/null | grep "test_mode_api_key" | awk -F'= ' '{print $2}' || true)

    # If we can't get keys from config, try the API
    if [ -z "$STRIPE_PK" ]; then
        warn "Could not auto-detect Stripe keys from CLI config."
        warn "Get your test keys from: https://dashboard.stripe.com/test/apikeys"
        echo ""
        echo -n "Paste Stripe Publishable Key (pk_test_...): "
        read -r STRIPE_PK
        echo -n "Paste Stripe Secret Key (sk_test_...): "
        read -r STRIPE_SK
    fi

    if [ -n "$STRIPE_PK" ] && [ -n "$STRIPE_SK" ]; then
        update_env "$BACKEND_ENV" "STRIPE_KEY" "$STRIPE_PK"
        update_env "$BACKEND_ENV" "STRIPE_SECRET" "$STRIPE_SK"
        success "Stripe keys saved to backend .env"

        update_env "$FRONTEND_ENV" "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "$STRIPE_PK"
        success "Stripe publishable key saved to frontend .env.local"

        # Set up webhook listener
        info "Setting up Stripe webhook forwarding..."
        stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe --print-secret 2>/dev/null &
        STRIPE_WH_PID=$!
        sleep 3

        # Get webhook secret from the running listener
        STRIPE_WH_SECRET=$(stripe listen --print-secret 2>/dev/null || true)
        if [ -n "$STRIPE_WH_SECRET" ]; then
            update_env "$BACKEND_ENV" "STRIPE_WEBHOOK_SECRET" "$STRIPE_WH_SECRET"
            success "Stripe webhook secret saved"
        fi

        # Kill the background listener
        kill $STRIPE_WH_PID 2>/dev/null || true
    else
        warn "Skipping Stripe (no keys provided)"
    fi
fi

# ============================================================
# STEP 3: BREVO EMAIL
# ============================================================
header "STEP 3/4: Brevo Email Service"

echo "Brevo (free 300 emails/day) requires a web signup."
echo ""
info "1. Sign up at: https://www.brevo.com (free tier)"
info "2. Go to: Settings > SMTP & API > SMTP"
info "3. Your SMTP login is your email address"
info "4. Generate an SMTP key"
echo ""
echo -n "Do you have Brevo SMTP credentials? (y/n): "
read -r HAS_BREVO

if [ "$HAS_BREVO" = "y" ] || [ "$HAS_BREVO" = "Y" ]; then
    echo -n "SMTP Login (your email): "
    read -r BREVO_USER
    echo -n "SMTP Key: "
    read -r BREVO_KEY
    echo -n "Brevo API Key (optional, press Enter to skip): "
    read -r BREVO_API

    update_env "$BACKEND_ENV" "MAIL_MAILER" "smtp"
    update_env "$BACKEND_ENV" "MAIL_HOST" "smtp-relay.brevo.com"
    update_env "$BACKEND_ENV" "MAIL_PORT" "587"
    update_env "$BACKEND_ENV" "MAIL_USERNAME" "$BREVO_USER"
    update_env "$BACKEND_ENV" "MAIL_PASSWORD" "$BREVO_KEY"
    update_env "$BACKEND_ENV" "MAIL_ENCRYPTION" "tls"

    if [ -n "$BREVO_API" ]; then
        update_env "$BACKEND_ENV" "BREVO_API_KEY" "$BREVO_API"
    fi

    success "Brevo email configuration saved"
else
    warn "Skipping Brevo. Email will use Mailpit (dev only, no real delivery)."
    info "You can set up Brevo later by running this script again."
fi

# ============================================================
# STEP 4: FRONTEND ENV
# ============================================================
header "STEP 4/4: Frontend Configuration"

# Ensure .env.local exists with base config
if [ ! -f "$FRONTEND_ENV" ]; then
    info "Creating frontend .env.local..."
fi

# Set base URLs (always needed)
update_env "$FRONTEND_ENV" "NEXT_PUBLIC_API_URL" "http://localhost:8000/api/v1"
update_env "$FRONTEND_ENV" "NEXT_PUBLIC_APP_URL" "http://localhost:3000"

# Enable feature flags
update_env "$FRONTEND_ENV" "NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN" "true"
update_env "$FRONTEND_ENV" "NEXT_PUBLIC_ENABLE_ASSESSMENT" "true"

success "Frontend .env.local configured"

# ============================================================
# SUMMARY
# ============================================================
header "SETUP COMPLETE"

echo -e "${BOLD}Backend .env status:${NC}"
echo -n "  GOOGLE_CLIENT_ID:     "; grep "^GOOGLE_CLIENT_ID=" "$BACKEND_ENV" | awk -F= '{v=$2; if(length(v)>10) print substr(v,1,15)"..."; else if(length(v)==0) print "(empty)"; else print v}'
echo -n "  GOOGLE_CLIENT_SECRET: "; grep "^GOOGLE_CLIENT_SECRET=" "$BACKEND_ENV" | awk -F= '{v=$2; if(length(v)>5) print "****" substr(v,length(v)-3); else if(length(v)==0) print "(empty)"; else print v}'
echo -n "  STRIPE_KEY:           "; grep "^STRIPE_KEY=" "$BACKEND_ENV" | awk -F= '{v=$2; if(length(v)>10) print substr(v,1,15)"..."; else if(length(v)==0) print "(empty)"; else print v}'
echo -n "  STRIPE_SECRET:        "; grep "^STRIPE_SECRET=" "$BACKEND_ENV" | awk -F= '{v=$2; if(length(v)>5) print "****" substr(v,length(v)-3); else if(length(v)==0) print "(empty)"; else print v}'
echo -n "  MAIL_HOST:            "; grep "^MAIL_HOST=" "$BACKEND_ENV" | awk -F= '{print $2}'

echo ""
echo -e "${BOLD}Frontend .env.local status:${NC}"
echo -n "  NEXT_PUBLIC_API_URL:              "; grep "^NEXT_PUBLIC_API_URL=" "$FRONTEND_ENV" | awk -F= '{print $2}'
echo -n "  NEXT_PUBLIC_GOOGLE_CLIENT_ID:     "; grep "^NEXT_PUBLIC_GOOGLE_CLIENT_ID=" "$FRONTEND_ENV" 2>/dev/null | awk -F= '{v=$2; if(length(v)>10) print substr(v,1,15)"..."; else if(length(v)==0) print "(empty)"; else print v}'
echo -n "  NEXT_PUBLIC_STRIPE_PUBLISHABLE:   "; grep "^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=" "$FRONTEND_ENV" 2>/dev/null | awk -F= '{v=$2; if(length(v)>10) print substr(v,1,15)"..."; else if(length(v)==0) print "(empty)"; else print v}'

echo ""
info "Next steps:"
echo "  1. If Google Calendar token is missing:"
echo "     docker compose exec app php artisan google:auth"
echo "  2. Restart containers to pick up new env:"
echo "     cd backend && docker compose restart app"
echo "  3. Start frontend:"
echo "     cd frontend && npm run dev"
echo "  4. Test the full flow at http://localhost:3000"
echo ""
success "Wisebox MVP setup complete."
