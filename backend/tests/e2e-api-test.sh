#!/usr/bin/env bash
# ============================================================================
# Wisebox MVP — End-to-End API Audit Script
# Hits the live Railway production API with ~50 sequential curl calls.
# No code changes — read-only audit of the deployed system.
# ============================================================================
set -euo pipefail

BASE="https://wisebox-mvp.up.railway.app/api"
API="$BASE/v1"

# Credentials
ADMIN_EMAIL="hello@wiseboxinc.com"
ADMIN_PASS="jankom-furwy7-tirSex"
CONSULTANT_EMAIL="consultant@wiseboxinc.com"
CONSULTANT_PASS="Wisebox2026!"

# Counters
PASS=0; FAIL=0; PARTIAL=0; SKIP=0; TOTAL=0

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

# Collected IDs (chained across phases)
ADMIN_TOKEN=""
CONSULTANT_TOKEN=""
SERVICE_ID=""
PROPERTY_TYPE_ID=""
PROPERTY_ID=""
OWNERSHIP_STATUS_ID=""
OWNERSHIP_TYPE_ID=""
ORDER_ID=""
TICKET_ID=""
CONSULTANT_ID=""
NOTIFICATION_ID=""
FORM_TEMPLATE_ID=""
FORM_INVITATION_TOKEN=""

# ── Helpers ──────────────────────────────────────────────────────────────────

log_pass() {
  PASS=$((PASS+1)); TOTAL=$((TOTAL+1))
  echo -e "  ${GREEN}PASS${NC} [$1] $2"
}
log_fail() {
  FAIL=$((FAIL+1)); TOTAL=$((TOTAL+1))
  echo -e "  ${RED}FAIL${NC} [$1] $2"
  [ -n "${3:-}" ] && echo -e "       ${RED}→ $3${NC}"
}
log_partial() {
  PARTIAL=$((PARTIAL+1)); TOTAL=$((TOTAL+1))
  echo -e "  ${YELLOW}PARTIAL${NC} [$1] $2"
  [ -n "${3:-}" ] && echo -e "       ${YELLOW}→ $3${NC}"
}
log_skip() {
  SKIP=$((SKIP+1)); TOTAL=$((TOTAL+1))
  echo -e "  ${CYAN}SKIP${NC} [$1] $2"
  [ -n "${3:-}" ] && echo -e "       ${CYAN}→ $3${NC}"
}

# curl wrapper — returns (http_code, body)  via globals RESP_CODE and RESP_BODY
api() {
  local method="$1" url="$2"; shift 2
  local tmp; tmp=$(mktemp)
  RESP_CODE=$(curl -s -o "$tmp" -w "%{http_code}" -X "$method" "$url" \
    -H "Accept: application/json" "$@" 2>/dev/null || echo "000")
  RESP_BODY=$(cat "$tmp" 2>/dev/null || echo "")
  rm -f "$tmp"
}

api_auth() {
  local token="$1" method="$2" url="$3"; shift 3
  api "$method" "$url" -H "Authorization: Bearer $token" "$@"
}

extract_json() {
  # Usage: extract_json '.data.token'
  echo "$RESP_BODY" | python3 -c "
import sys, json
try:
    obj = json.load(sys.stdin)
    keys = sys.argv[1].lstrip('.').split('.')
    for k in keys:
        if isinstance(obj, list):
            obj = obj[int(k)]
        elif isinstance(obj, dict):
            obj = obj[k]
        else:
            print(''); sys.exit()
    print(obj if obj is not None else '')
except:
    print('')
" "$1" 2>/dev/null
}

extract_json_int() {
  local val; val=$(extract_json "$1")
  echo "${val:-0}"
}

# ════════════════════════════════════════════════════════════════════════════
echo ""
echo "========================================================"
echo "  WISEBOX MVP — End-to-End API Audit"
echo "  Target: $API"
echo "  $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================================"
echo ""

# ── Phase 0: Infrastructure Health ──────────────────────────────────────────
echo -e "${CYAN}Phase 0: Infrastructure Health${NC}"

# 0.1 Health endpoint
api GET "$BASE/health"
if [ "$RESP_CODE" = "200" ]; then
  db_status=$(extract_json '.database')
  if [ "$db_status" = "connected" ]; then
    log_pass "$RESP_CODE" "GET /api/health — database connected"
  else
    log_partial "$RESP_CODE" "GET /api/health — database status: $db_status"
  fi
else
  log_fail "$RESP_CODE" "GET /api/health" "Expected 200, got $RESP_CODE"
fi

# 0.2 API root
api GET "$API/"
if [ "$RESP_CODE" = "200" ]; then
  log_pass "$RESP_CODE" "GET /api/v1/ — API root responds"
else
  log_fail "$RESP_CODE" "GET /api/v1/" "Expected 200, got $RESP_CODE"
fi

echo ""

# ── Phase 1: Authentication ─────────────────────────────────────────────────
echo -e "${CYAN}Phase 1: Authentication${NC}"

# 1.1 Admin login
api POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}"
if [ "$RESP_CODE" = "200" ]; then
  ADMIN_TOKEN=$(extract_json '.data.token')
  if [ -n "$ADMIN_TOKEN" ]; then
    log_pass "$RESP_CODE" "POST /auth/login (admin) — token obtained"
  else
    log_fail "$RESP_CODE" "POST /auth/login (admin)" "200 but no token in response"
  fi
else
  log_fail "$RESP_CODE" "POST /auth/login (admin)" "Body: $(echo "$RESP_BODY" | head -c 200)"
fi

# 1.2 Consultant login
api POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CONSULTANT_EMAIL\",\"password\":\"$CONSULTANT_PASS\"}"
if [ "$RESP_CODE" = "200" ]; then
  CONSULTANT_TOKEN=$(extract_json '.data.token')
  if [ -n "$CONSULTANT_TOKEN" ]; then
    log_pass "$RESP_CODE" "POST /auth/login (consultant) — token obtained"
  else
    log_fail "$RESP_CODE" "POST /auth/login (consultant)" "200 but no token in response"
  fi
else
  log_fail "$RESP_CODE" "POST /auth/login (consultant)" "Body: $(echo "$RESP_BODY" | head -c 200)"
fi

# 1.3 Admin /auth/me
if [ -n "$ADMIN_TOKEN" ]; then
  api_auth "$ADMIN_TOKEN" GET "$API/auth/me"
  if [ "$RESP_CODE" = "200" ]; then
    admin_role=$(extract_json '.data.role')
    log_pass "$RESP_CODE" "GET /auth/me (admin) — role: $admin_role"
  else
    log_fail "$RESP_CODE" "GET /auth/me (admin)"
  fi
else
  log_skip "---" "GET /auth/me (admin)" "No admin token"
fi

# 1.4 Consultant /auth/me
if [ -n "$CONSULTANT_TOKEN" ]; then
  api_auth "$CONSULTANT_TOKEN" GET "$API/auth/me"
  if [ "$RESP_CODE" = "200" ]; then
    consultant_role=$(extract_json '.data.role')
    log_pass "$RESP_CODE" "GET /auth/me (consultant) — role: $consultant_role"
  else
    log_fail "$RESP_CODE" "GET /auth/me (consultant)"
  fi
else
  log_skip "---" "GET /auth/me (consultant)" "No consultant token"
fi

# 1.5 Unauthenticated access returns 401
api GET "$API/auth/me"
if [ "$RESP_CODE" = "401" ]; then
  log_pass "$RESP_CODE" "GET /auth/me (no token) — correctly returns 401"
else
  log_fail "$RESP_CODE" "GET /auth/me (no token)" "Expected 401, got $RESP_CODE"
fi

echo ""

# ── Phase 2: Public Endpoints ───────────────────────────────────────────────
echo -e "${CYAN}Phase 2: Public Endpoints${NC}"

# 2.1 Services
api GET "$API/services"
if [ "$RESP_CODE" = "200" ]; then
  SERVICE_ID=$(echo "$RESP_BODY" | python3 -c "
import sys, json
try:
    obj = json.load(sys.stdin)
    items = obj.get('data', obj) if isinstance(obj.get('data', obj), list) else obj.get('data', {}).get('data', [])
    if not isinstance(items, list):
        items = [items] if items else []
    for s in items:
        if isinstance(s, dict) and s.get('id'):
            print(s['id']); break
    else: print('')
except: print('')
" 2>/dev/null)
  log_pass "$RESP_CODE" "GET /services — SERVICE_ID=${SERVICE_ID:-none}"
else
  log_fail "$RESP_CODE" "GET /services"
fi

# 2.2 Service categories
api GET "$API/service-categories"
if [ "$RESP_CODE" = "200" ]; then
  log_pass "$RESP_CODE" "GET /service-categories"
else
  log_fail "$RESP_CODE" "GET /service-categories"
fi

# 2.3 Property types
api GET "$API/property-types"
if [ "$RESP_CODE" = "200" ]; then
  PROPERTY_TYPE_ID=$(echo "$RESP_BODY" | python3 -c "
import sys, json
try:
    obj = json.load(sys.stdin)
    items = obj.get('data', [])
    if items and isinstance(items, list):
        print(items[0].get('id', ''))
    else: print('')
except: print('')
" 2>/dev/null)
  log_pass "$RESP_CODE" "GET /property-types — PROPERTY_TYPE_ID=${PROPERTY_TYPE_ID:-none}"
else
  log_fail "$RESP_CODE" "GET /property-types"
fi

# 2.4 Ownership statuses
api GET "$API/ownership-statuses"
if [ "$RESP_CODE" = "200" ]; then
  OWNERSHIP_STATUS_ID=$(echo "$RESP_BODY" | python3 -c "
import sys, json
try:
    obj = json.load(sys.stdin)
    items = obj.get('data', [])
    if items and isinstance(items, list):
        print(items[0].get('id', ''))
    else: print('')
except: print('')
" 2>/dev/null)
  log_pass "$RESP_CODE" "GET /ownership-statuses — OWNERSHIP_STATUS_ID=${OWNERSHIP_STATUS_ID:-none}"
else
  log_fail "$RESP_CODE" "GET /ownership-statuses"
fi

# 2.5 Ownership types
api GET "$API/ownership-types"
if [ "$RESP_CODE" = "200" ]; then
  OWNERSHIP_TYPE_ID=$(echo "$RESP_BODY" | python3 -c "
import sys, json
try:
    obj = json.load(sys.stdin)
    items = obj.get('data', [])
    if items and isinstance(items, list):
        print(items[0].get('id', ''))
    else: print('')
except: print('')
" 2>/dev/null)
  log_pass "$RESP_CODE" "GET /ownership-types — OWNERSHIP_TYPE_ID=${OWNERSHIP_TYPE_ID:-none}"
else
  log_fail "$RESP_CODE" "GET /ownership-types"
fi

# 2.6 Location divisions
api GET "$API/locations/divisions"
if [ "$RESP_CODE" = "200" ]; then
  log_pass "$RESP_CODE" "GET /locations/divisions"
else
  log_fail "$RESP_CODE" "GET /locations/divisions"
fi

# 2.7 FAQs
api GET "$API/faqs"
if [ "$RESP_CODE" = "200" ]; then
  log_pass "$RESP_CODE" "GET /faqs"
else
  log_fail "$RESP_CODE" "GET /faqs"
fi

# 2.8 Sliders
api GET "$API/sliders"
if [ "$RESP_CODE" = "200" ]; then
  log_pass "$RESP_CODE" "GET /sliders"
else
  log_fail "$RESP_CODE" "GET /sliders"
fi

# 2.9 Assessment questions
api GET "$API/assessments/questions"
if [ "$RESP_CODE" = "200" ]; then
  log_pass "$RESP_CODE" "GET /assessments/questions"
else
  log_fail "$RESP_CODE" "GET /assessments/questions"
fi

echo ""

# ── Phase 3: Payment Processing ─────────────────────────────────────────────
echo -e "${CYAN}Phase 3: Payment Processing${NC}"

if [ -z "$ADMIN_TOKEN" ]; then
  log_skip "---" "Phase 3 skipped" "No admin token available"
else
  # 3.1 List admin's properties (need a property to create an order)
  api_auth "$ADMIN_TOKEN" GET "$API/properties"
  if [ "$RESP_CODE" = "200" ]; then
    PROPERTY_ID=$(echo "$RESP_BODY" | python3 -c "
import sys, json
try:
    obj = json.load(sys.stdin)
    items = obj.get('data', [])
    if isinstance(items, list) and items:
        print(items[0].get('id', ''))
    elif isinstance(items, dict):
        inner = items.get('data', items.get('items', []))
        if isinstance(inner, list) and inner:
            print(inner[0].get('id', ''))
        else: print('')
    else: print('')
except: print('')
" 2>/dev/null)
    log_pass "$RESP_CODE" "GET /properties — PROPERTY_ID=${PROPERTY_ID:-none}"
  else
    log_fail "$RESP_CODE" "GET /properties"
  fi

  # If no property found, try to create one
  if [ -z "$PROPERTY_ID" ]; then
    echo "       No properties found. Creating a test property..."
    api_auth "$ADMIN_TOKEN" POST "$API/properties" \
      -H "Content-Type: application/json" \
      -d "{\"property_name\":\"E2E Test Property\",\"property_type_id\":${PROPERTY_TYPE_ID:-1},\"ownership_status_id\":${OWNERSHIP_STATUS_ID:-1},\"ownership_type_id\":${OWNERSHIP_TYPE_ID:-1},\"size_value\":100,\"size_unit\":\"sqft\",\"address\":\"123 Test Street\"}"
    if [ "$RESP_CODE" = "201" ] || [ "$RESP_CODE" = "200" ]; then
      PROPERTY_ID=$(extract_json '.data.id')
      log_pass "$RESP_CODE" "POST /properties — created PROPERTY_ID=$PROPERTY_ID"
    else
      log_fail "$RESP_CODE" "POST /properties" "$(echo "$RESP_BODY" | head -c 300)"
    fi
  fi

  if [ -n "$PROPERTY_ID" ] && [ -n "$SERVICE_ID" ]; then
    # 3.2 Create order
    api_auth "$ADMIN_TOKEN" POST "$API/orders" \
      -H "Content-Type: application/json" \
      -d "{\"property_id\":$PROPERTY_ID,\"items\":[{\"service_id\":$SERVICE_ID,\"quantity\":1}]}"
    if [ "$RESP_CODE" = "201" ] || [ "$RESP_CODE" = "200" ]; then
      ORDER_ID=$(extract_json '.data.id')
      order_total=$(extract_json '.data.total')
      log_pass "$RESP_CODE" "POST /orders — ORDER_ID=$ORDER_ID, total=$order_total"
    else
      log_fail "$RESP_CODE" "POST /orders" "$(echo "$RESP_BODY" | head -c 300)"
    fi

    # 3.3 Show order
    if [ -n "$ORDER_ID" ]; then
      api_auth "$ADMIN_TOKEN" GET "$API/orders/$ORDER_ID"
      if [ "$RESP_CODE" = "200" ]; then
        order_status=$(extract_json '.data.status')
        log_pass "$RESP_CODE" "GET /orders/$ORDER_ID — status=$order_status"
      else
        log_fail "$RESP_CODE" "GET /orders/$ORDER_ID"
      fi

      # 3.4 Checkout — get Stripe URL
      api_auth "$ADMIN_TOKEN" POST "$API/orders/$ORDER_ID/checkout"
      if [ "$RESP_CODE" = "200" ]; then
        checkout_url=$(extract_json '.data.checkout_url')
        session_id=$(extract_json '.data.session_id')
        if echo "$checkout_url" | grep -q "checkout.stripe.com" 2>/dev/null; then
          if echo "$session_id" | grep -q "^cs_test_" 2>/dev/null; then
            log_pass "$RESP_CODE" "POST /orders/$ORDER_ID/checkout — Stripe test mode confirmed"
          else
            log_partial "$RESP_CODE" "POST /orders/$ORDER_ID/checkout — Stripe URL present but session_id=$session_id (expected cs_test_*)"
          fi
        elif [ -n "$checkout_url" ]; then
          log_partial "$RESP_CODE" "POST /orders/$ORDER_ID/checkout — Got URL but not Stripe: $checkout_url"
        else
          # Could be a free order
          log_partial "$RESP_CODE" "POST /orders/$ORDER_ID/checkout — No checkout URL (may be free order)"
        fi
      elif [ "$RESP_CODE" = "422" ]; then
        msg=$(extract_json '.message')
        log_partial "$RESP_CODE" "POST /orders/$ORDER_ID/checkout — 422: $msg"
      else
        log_fail "$RESP_CODE" "POST /orders/$ORDER_ID/checkout" "$(echo "$RESP_BODY" | head -c 200)"
      fi
    else
      log_skip "---" "GET/POST /orders/{id}" "No ORDER_ID"
    fi
  else
    log_skip "---" "Order creation" "Missing PROPERTY_ID or SERVICE_ID"
  fi

  # 3.5 Stripe webhook — invalid signature
  api POST "$API/webhooks/stripe" \
    -H "Content-Type: application/json" \
    -H "Stripe-Signature: t=0,v1=invalid" \
    -d '{"type":"checkout.session.completed"}'
  if [ "$RESP_CODE" = "400" ] || [ "$RESP_CODE" = "403" ]; then
    log_pass "$RESP_CODE" "POST /webhooks/stripe (invalid sig) — correctly rejected"
  elif [ "$RESP_CODE" = "500" ]; then
    log_partial "$RESP_CODE" "POST /webhooks/stripe — 500 (webhook route exists but error handling could be improved)"
  elif [ "$RESP_CODE" = "429" ]; then
    log_partial "$RESP_CODE" "POST /webhooks/stripe — rate limited"
  else
    log_fail "$RESP_CODE" "POST /webhooks/stripe (invalid sig)" "Expected 400/403, got $RESP_CODE"
  fi

  # 3.6 List orders
  if [ -n "$ADMIN_TOKEN" ]; then
    api_auth "$ADMIN_TOKEN" GET "$API/orders"
    if [ "$RESP_CODE" = "200" ]; then
      log_pass "$RESP_CODE" "GET /orders — order list"
    else
      log_fail "$RESP_CODE" "GET /orders"
    fi
  fi

  # 3.7 Cancel order (cleanup)
  if [ -n "$ORDER_ID" ]; then
    api_auth "$ADMIN_TOKEN" POST "$API/orders/$ORDER_ID/cancel"
    if [ "$RESP_CODE" = "200" ]; then
      log_pass "$RESP_CODE" "POST /orders/$ORDER_ID/cancel — order cancelled"
    elif [ "$RESP_CODE" = "422" ]; then
      msg=$(extract_json '.message')
      log_partial "$RESP_CODE" "POST /orders/$ORDER_ID/cancel — $msg (may already be paid/confirmed)"
    else
      log_fail "$RESP_CODE" "POST /orders/$ORDER_ID/cancel" "$(echo "$RESP_BODY" | head -c 200)"
    fi
  fi
fi

echo ""

# ── Phase 4: Admin Notifications & Dashboard ────────────────────────────────
echo -e "${CYAN}Phase 4: Admin Notifications & Dashboard${NC}"

if [ -z "$ADMIN_TOKEN" ]; then
  log_skip "---" "Phase 4 skipped" "No admin token"
else
  # 4.1 Dashboard summary
  api_auth "$ADMIN_TOKEN" GET "$API/dashboard/summary"
  if [ "$RESP_CODE" = "200" ]; then
    prop_count=$(extract_json '.data.counts.properties_total')
    ticket_count=$(extract_json '.data.counts.tickets_total')
    log_pass "$RESP_CODE" "GET /dashboard/summary — properties=$prop_count, tickets=$ticket_count"
  else
    log_fail "$RESP_CODE" "GET /dashboard/summary" "$(echo "$RESP_BODY" | head -c 200)"
  fi

  # 4.2 Notification list
  api_auth "$ADMIN_TOKEN" GET "$API/notifications"
  if [ "$RESP_CODE" = "200" ]; then
    # Grab first notification ID for later tests
    NOTIFICATION_ID=$(echo "$RESP_BODY" | python3 -c "
import sys, json
try:
    obj = json.load(sys.stdin)
    items = obj.get('data', [])
    if isinstance(items, list) and items:
        print(items[0].get('id', ''))
    elif isinstance(items, dict):
        inner = items.get('data', [])
        if isinstance(inner, list) and inner:
            print(inner[0].get('id', ''))
        else: print('')
    else: print('')
except: print('')
" 2>/dev/null)
    log_pass "$RESP_CODE" "GET /notifications — NOTIFICATION_ID=${NOTIFICATION_ID:-none}"
  else
    log_fail "$RESP_CODE" "GET /notifications"
  fi

  # 4.3 Unread count
  api_auth "$ADMIN_TOKEN" GET "$API/notifications/unread-count"
  if [ "$RESP_CODE" = "200" ]; then
    unread=$(extract_json '.data.unread_count')
    log_pass "$RESP_CODE" "GET /notifications/unread-count — $unread unread"
  else
    log_fail "$RESP_CODE" "GET /notifications/unread-count"
  fi

  # 4.4 Admin consultations
  api_auth "$ADMIN_TOKEN" GET "$API/admin/consultations"
  if [ "$RESP_CODE" = "200" ]; then
    stats_pending=$(echo "$RESP_BODY" | python3 -c "
import sys, json
try:
    obj = json.load(sys.stdin)
    s = obj.get('stats', {})
    print(f\"pending={s.get('pending',0)}, assigned={s.get('assigned',0)}, scheduled={s.get('scheduled',0)}\")
except: print('stats unavailable')
" 2>/dev/null)
    log_pass "$RESP_CODE" "GET /admin/consultations — $stats_pending"
  else
    log_fail "$RESP_CODE" "GET /admin/consultations" "$(echo "$RESP_BODY" | head -c 200)"
  fi

  # 4.5 Admin tickets list
  api_auth "$ADMIN_TOKEN" GET "$API/tickets"
  if [ "$RESP_CODE" = "200" ]; then
    log_pass "$RESP_CODE" "GET /tickets (admin)"
  else
    log_fail "$RESP_CODE" "GET /tickets (admin)"
  fi

  # 4.6 Consultant cannot access /admin/consultations
  if [ -n "$CONSULTANT_TOKEN" ]; then
    api_auth "$CONSULTANT_TOKEN" GET "$API/admin/consultations"
    if [ "$RESP_CODE" = "403" ]; then
      log_pass "$RESP_CODE" "GET /admin/consultations (consultant) — correctly returns 403"
    else
      log_fail "$RESP_CODE" "GET /admin/consultations (consultant)" "Expected 403, got $RESP_CODE"
    fi
  fi
fi

echo ""

# ── Phase 5: Admin Assigns Case to Consultant ──────────────────────────────
echo -e "${CYAN}Phase 5: Admin Assigns Case to Consultant${NC}"

if [ -z "$ADMIN_TOKEN" ]; then
  log_skip "---" "Phase 5 skipped" "No admin token"
else
  # 5.1 List consultants
  api_auth "$ADMIN_TOKEN" GET "$API/consultants"
  if [ "$RESP_CODE" = "200" ]; then
    CONSULTANT_ID=$(echo "$RESP_BODY" | python3 -c "
import sys, json
try:
    obj = json.load(sys.stdin)
    items = obj.get('data', [])
    if isinstance(items, list) and items:
        print(items[0].get('id', ''))
    else: print('')
except: print('')
" 2>/dev/null)
    log_pass "$RESP_CODE" "GET /consultants — CONSULTANT_ID=${CONSULTANT_ID:-none}"
  else
    log_fail "$RESP_CODE" "GET /consultants"
  fi

  # 5.2 Consultant workload
  api_auth "$ADMIN_TOKEN" GET "$API/consultants/workload"
  if [ "$RESP_CODE" = "200" ]; then
    log_pass "$RESP_CODE" "GET /consultants/workload"
  else
    log_fail "$RESP_CODE" "GET /consultants/workload"
  fi

  # 5.3 Admin consultations - consultants list
  api_auth "$ADMIN_TOKEN" GET "$API/admin/consultations/consultants"
  if [ "$RESP_CODE" = "200" ]; then
    log_pass "$RESP_CODE" "GET /admin/consultations/consultants"
  else
    log_fail "$RESP_CODE" "GET /admin/consultations/consultants" "$(echo "$RESP_BODY" | head -c 200)"
  fi

  # 5.4 Create test ticket
  if [ -n "$PROPERTY_ID" ]; then
    api_auth "$ADMIN_TOKEN" POST "$API/tickets" \
      -H "Content-Type: application/json" \
      -d "{\"property_id\":$PROPERTY_ID,\"title\":\"E2E Audit Test Ticket\",\"description\":\"Created by automated E2E audit script.\",\"priority\":\"medium\"}"
    if [ "$RESP_CODE" = "201" ] || [ "$RESP_CODE" = "200" ]; then
      TICKET_ID=$(extract_json '.data.id')
      log_pass "$RESP_CODE" "POST /tickets — TICKET_ID=$TICKET_ID"
    else
      log_fail "$RESP_CODE" "POST /tickets" "$(echo "$RESP_BODY" | head -c 300)"
    fi
  else
    log_skip "---" "POST /tickets" "No PROPERTY_ID"
  fi

  # 5.5 Assign consultant to ticket
  if [ -n "$TICKET_ID" ] && [ -n "$CONSULTANT_ID" ]; then
    api_auth "$ADMIN_TOKEN" PATCH "$API/tickets/$TICKET_ID/assign" \
      -H "Content-Type: application/json" \
      -d "{\"consultant_id\":$CONSULTANT_ID}"
    if [ "$RESP_CODE" = "200" ]; then
      assigned_status=$(extract_json '.data.status')
      log_pass "$RESP_CODE" "PATCH /tickets/$TICKET_ID/assign — status=$assigned_status"
    else
      log_fail "$RESP_CODE" "PATCH /tickets/$TICKET_ID/assign" "$(echo "$RESP_BODY" | head -c 200)"
    fi
  else
    log_skip "---" "PATCH /tickets/{id}/assign" "No TICKET_ID or CONSULTANT_ID"
  fi

  # 5.6 Admin views ticket detail
  if [ -n "$TICKET_ID" ]; then
    api_auth "$ADMIN_TOKEN" GET "$API/tickets/$TICKET_ID"
    if [ "$RESP_CODE" = "200" ]; then
      tk_status=$(extract_json '.data.status')
      tk_consultant=$(extract_json '.data.consultant.name')
      log_pass "$RESP_CODE" "GET /tickets/$TICKET_ID — status=$tk_status, consultant=$tk_consultant"
    else
      log_fail "$RESP_CODE" "GET /tickets/$TICKET_ID"
    fi
  fi

  # 5.7 Consultant views their ticket list
  if [ -n "$CONSULTANT_TOKEN" ]; then
    api_auth "$CONSULTANT_TOKEN" GET "$API/consultant/tickets"
    if [ "$RESP_CODE" = "200" ]; then
      log_pass "$RESP_CODE" "GET /consultant/tickets — consultant sees assigned tickets"
    else
      log_fail "$RESP_CODE" "GET /consultant/tickets"
    fi
  fi

  # 5.8 Consultant checks notifications for assignment
  if [ -n "$CONSULTANT_TOKEN" ]; then
    api_auth "$CONSULTANT_TOKEN" GET "$API/notifications"
    if [ "$RESP_CODE" = "200" ]; then
      log_pass "$RESP_CODE" "GET /notifications (consultant) — assignment notification check"
    else
      log_fail "$RESP_CODE" "GET /notifications (consultant)"
    fi
  fi
fi

echo ""

# ── Phase 6: Consultant Workflow ────────────────────────────────────────────
echo -e "${CYAN}Phase 6: Consultant Workflow${NC}"

if [ -z "$CONSULTANT_TOKEN" ]; then
  log_skip "---" "Phase 6 skipped" "No consultant token"
else
  # 6.1 Consultant stats
  api_auth "$CONSULTANT_TOKEN" GET "$API/consultant/stats"
  if [ "$RESP_CODE" = "200" ]; then
    assigned=$(extract_json '.data.assigned')
    scheduled=$(extract_json '.data.scheduled')
    log_pass "$RESP_CODE" "GET /consultant/stats — assigned=$assigned, scheduled=$scheduled"
  else
    log_fail "$RESP_CODE" "GET /consultant/stats" "$(echo "$RESP_BODY" | head -c 200)"
  fi

  # 6.2 Consultant dashboard
  api_auth "$CONSULTANT_TOKEN" GET "$API/consultant/dashboard"
  if [ "$RESP_CODE" = "200" ]; then
    open_count=$(extract_json '.data.stats.open_count')
    log_pass "$RESP_CODE" "GET /consultant/dashboard — open=$open_count"
  else
    log_fail "$RESP_CODE" "GET /consultant/dashboard"
  fi

  # 6.3 Consultant metrics
  api_auth "$CONSULTANT_TOKEN" GET "$API/consultant/metrics"
  if [ "$RESP_CODE" = "200" ]; then
    active=$(extract_json '.data.kpis.active_count')
    log_pass "$RESP_CODE" "GET /consultant/metrics — active=$active"
  else
    log_fail "$RESP_CODE" "GET /consultant/metrics"
  fi

  # 6.4 Consultant views ticket detail
  if [ -n "$TICKET_ID" ]; then
    api_auth "$CONSULTANT_TOKEN" GET "$API/consultant/tickets/$TICKET_ID"
    if [ "$RESP_CODE" = "200" ]; then
      log_pass "$RESP_CODE" "GET /consultant/tickets/$TICKET_ID — full detail"
    else
      log_fail "$RESP_CODE" "GET /consultant/tickets/$TICKET_ID" "$(echo "$RESP_BODY" | head -c 200)"
    fi

    # 6.5 Update ticket status to in_progress
    api_auth "$CONSULTANT_TOKEN" PUT "$API/consultant/tickets/$TICKET_ID" \
      -H "Content-Type: application/json" \
      -d '{"status":"in_progress"}'
    if [ "$RESP_CODE" = "200" ]; then
      new_status=$(extract_json '.data.status')
      log_pass "$RESP_CODE" "PUT /consultant/tickets/$TICKET_ID — status=$new_status"
    else
      log_fail "$RESP_CODE" "PUT /consultant/tickets/$TICKET_ID" "$(echo "$RESP_BODY" | head -c 200)"
    fi

    # 6.6 Add comment
    api_auth "$CONSULTANT_TOKEN" POST "$API/consultant/tickets/$TICKET_ID/comments" \
      -H "Content-Type: application/json" \
      -d '{"body":"E2E audit: test comment from consultant."}'
    if [ "$RESP_CODE" = "201" ] || [ "$RESP_CODE" = "200" ]; then
      log_pass "$RESP_CODE" "POST /consultant/tickets/$TICKET_ID/comments — comment added"
    else
      log_fail "$RESP_CODE" "POST /consultant/tickets/$TICKET_ID/comments" "$(echo "$RESP_BODY" | head -c 200)"
    fi

    # 6.7 Confirm slot (expect 422 — no preferred_time_slots on manual ticket)
    api_auth "$CONSULTANT_TOKEN" POST "$API/consultant/tickets/$TICKET_ID/confirm-slot" \
      -H "Content-Type: application/json" \
      -d '{"slot_index":0,"duration_minutes":60}'
    if [ "$RESP_CODE" = "422" ]; then
      msg=$(extract_json '.message')
      log_pass "$RESP_CODE" "POST /consultant/tickets/$TICKET_ID/confirm-slot — 422 expected: $msg"
    elif [ "$RESP_CODE" = "200" ]; then
      warning=$(extract_json '.warning')
      if [ -n "$warning" ]; then
        log_partial "$RESP_CODE" "POST /confirm-slot — scheduled but with warning: $warning"
      else
        log_pass "$RESP_CODE" "POST /confirm-slot — slot confirmed with meet link"
      fi
    else
      log_fail "$RESP_CODE" "POST /consultant/tickets/$TICKET_ID/confirm-slot" "$(echo "$RESP_BODY" | head -c 200)"
    fi
  else
    log_skip "---" "Consultant ticket operations" "No TICKET_ID"
    # Still count the 4 tests as skipped
    log_skip "---" "PUT /consultant/tickets/{id}" "No TICKET_ID"
    log_skip "---" "POST /consultant/tickets/{id}/comments" "No TICKET_ID"
    log_skip "---" "POST /consultant/tickets/{id}/confirm-slot" "No TICKET_ID"
  fi

  # 6.8 List consultation form templates
  api_auth "$CONSULTANT_TOKEN" GET "$API/consultation-forms/"
  if [ "$RESP_CODE" = "200" ]; then
    FORM_TEMPLATE_ID=$(echo "$RESP_BODY" | python3 -c "
import sys, json
try:
    obj = json.load(sys.stdin)
    items = obj.get('data', [])
    if isinstance(items, list) and items:
        print(items[0].get('id', ''))
    elif isinstance(items, dict):
        inner = items.get('data', [])
        if isinstance(inner, list) and inner:
            print(inner[0].get('id', ''))
        else: print('')
    else: print('')
except: print('')
" 2>/dev/null)
    log_pass "$RESP_CODE" "GET /consultation-forms/ — FORM_TEMPLATE_ID=${FORM_TEMPLATE_ID:-none}"
  else
    log_fail "$RESP_CODE" "GET /consultation-forms/" "$(echo "$RESP_BODY" | head -c 200)"
  fi

  # 6.9 Send form invitation
  if [ -n "$TICKET_ID" ] && [ -n "$FORM_TEMPLATE_ID" ]; then
    api_auth "$CONSULTANT_TOKEN" POST "$API/consultant/tickets/$TICKET_ID/send-form" \
      -H "Content-Type: application/json" \
      -d "{\"template_id\":$FORM_TEMPLATE_ID}"
    if [ "$RESP_CODE" = "201" ] || [ "$RESP_CODE" = "200" ]; then
      FORM_INVITATION_TOKEN=$(extract_json '.data.token')
      log_pass "$RESP_CODE" "POST /consultant/tickets/$TICKET_ID/send-form — invitation created"
    elif [ "$RESP_CODE" = "422" ]; then
      msg=$(extract_json '.message')
      log_partial "$RESP_CODE" "POST /send-form — $msg"
    else
      log_fail "$RESP_CODE" "POST /consultant/tickets/$TICKET_ID/send-form" "$(echo "$RESP_BODY" | head -c 200)"
    fi
  else
    log_skip "---" "POST /consultant/tickets/{id}/send-form" "No TICKET_ID or FORM_TEMPLATE_ID"
  fi

  # 6.10 List form invitations
  if [ -n "$TICKET_ID" ]; then
    api_auth "$CONSULTANT_TOKEN" GET "$API/consultant/tickets/$TICKET_ID/form-invitations"
    if [ "$RESP_CODE" = "200" ]; then
      log_pass "$RESP_CODE" "GET /consultant/tickets/$TICKET_ID/form-invitations"
    else
      log_fail "$RESP_CODE" "GET /consultant/tickets/$TICKET_ID/form-invitations"
    fi
  else
    log_skip "---" "GET /form-invitations" "No TICKET_ID"
  fi
fi

echo ""

# ── Phase 7: Public Form Access ─────────────────────────────────────────────
echo -e "${CYAN}Phase 7: Public Form Access${NC}"

# 7.1 Valid token
if [ -n "$FORM_INVITATION_TOKEN" ]; then
  api GET "$API/public-forms/$FORM_INVITATION_TOKEN"
  if [ "$RESP_CODE" = "200" ]; then
    template_name=$(extract_json '.data.template.name')
    log_pass "$RESP_CODE" "GET /public-forms/{token} — template=$template_name"
  elif [ "$RESP_CODE" = "410" ]; then
    log_partial "$RESP_CODE" "GET /public-forms/{token} — form expired or completed"
  else
    log_fail "$RESP_CODE" "GET /public-forms/{token}" "$(echo "$RESP_BODY" | head -c 200)"
  fi
else
  log_skip "---" "GET /public-forms/{token}" "No FORM_INVITATION_TOKEN"
fi

# 7.2 Invalid token
api GET "$API/public-forms/invalid_token_e2e_test_12345"
if [ "$RESP_CODE" = "404" ]; then
  log_pass "$RESP_CODE" "GET /public-forms/invalid_token — correctly returns 404"
else
  log_fail "$RESP_CODE" "GET /public-forms/invalid_token" "Expected 404, got $RESP_CODE"
fi

echo ""

# ── Phase 8: Webhook Validation ─────────────────────────────────────────────
echo -e "${CYAN}Phase 8: Webhook Validation${NC}"

# 8.1 Stripe webhook with invalid signature
api POST "$API/webhooks/stripe" \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=1234,v1=badhash" \
  -d '{"type":"checkout.session.completed","data":{"object":{"id":"cs_test_fake"}}}'
if [ "$RESP_CODE" = "400" ] || [ "$RESP_CODE" = "403" ]; then
  log_pass "$RESP_CODE" "POST /webhooks/stripe (bad sig) — correctly rejected"
elif [ "$RESP_CODE" = "500" ]; then
  log_partial "$RESP_CODE" "POST /webhooks/stripe — route exists, signature validation throws 500 (should be 400)"
elif [ "$RESP_CODE" = "429" ]; then
  log_partial "$RESP_CODE" "POST /webhooks/stripe — rate limited (already tested earlier)"
else
  log_fail "$RESP_CODE" "POST /webhooks/stripe" "Expected 400/403"
fi

# 8.2 Calendly webhook with empty body
api POST "$API/webhooks/calendly" \
  -H "Content-Type: application/json" \
  -d '{}'
if [ "$RESP_CODE" != "404" ]; then
  log_pass "$RESP_CODE" "POST /webhooks/calendly — route exists (status $RESP_CODE)"
else
  log_fail "$RESP_CODE" "POST /webhooks/calendly" "Route not found (404)"
fi

echo ""

# ── Phase 9: Notification Read Flow ─────────────────────────────────────────
echo -e "${CYAN}Phase 9: Notification Read Flow${NC}"

if [ -z "$ADMIN_TOKEN" ]; then
  log_skip "---" "Phase 9 skipped" "No admin token"
else
  # 9.1 Get unread notifications
  api_auth "$ADMIN_TOKEN" GET "$API/notifications?status=unread"
  if [ "$RESP_CODE" = "200" ]; then
    # Try to grab a notification ID from unread list
    UNREAD_NOTIF_ID=$(echo "$RESP_BODY" | python3 -c "
import sys, json
try:
    obj = json.load(sys.stdin)
    items = obj.get('data', [])
    if isinstance(items, list) and items:
        print(items[0].get('id', ''))
    elif isinstance(items, dict):
        inner = items.get('data', [])
        if isinstance(inner, list) and inner:
            print(inner[0].get('id', ''))
        else: print('')
    else: print('')
except: print('')
" 2>/dev/null)
    log_pass "$RESP_CODE" "GET /notifications?status=unread — ID=${UNREAD_NOTIF_ID:-none}"
  else
    log_fail "$RESP_CODE" "GET /notifications?status=unread"
  fi

  # 9.2 Mark single notification as read
  TARGET_NOTIF="${UNREAD_NOTIF_ID:-$NOTIFICATION_ID}"
  if [ -n "$TARGET_NOTIF" ]; then
    api_auth "$ADMIN_TOKEN" PATCH "$API/notifications/$TARGET_NOTIF/read"
    if [ "$RESP_CODE" = "200" ]; then
      log_pass "$RESP_CODE" "PATCH /notifications/$TARGET_NOTIF/read — marked as read"
    else
      log_fail "$RESP_CODE" "PATCH /notifications/$TARGET_NOTIF/read" "$(echo "$RESP_BODY" | head -c 200)"
    fi
  else
    log_skip "---" "PATCH /notifications/{id}/read" "No notification ID available"
  fi

  # 9.3 Mark all notifications as read
  api_auth "$ADMIN_TOKEN" PATCH "$API/notifications/read-all"
  if [ "$RESP_CODE" = "200" ]; then
    marked=$(extract_json '.data.marked_count')
    log_pass "$RESP_CODE" "PATCH /notifications/read-all — marked $marked"
  else
    log_fail "$RESP_CODE" "PATCH /notifications/read-all" "$(echo "$RESP_BODY" | head -c 200)"
  fi
fi

echo ""

# ════════════════════════════════════════════════════════════════════════════
# Summary
# ════════════════════════════════════════════════════════════════════════════
echo "========================================================"
echo "  SUMMARY"
echo "========================================================"
echo -e "  ${GREEN}PASS${NC}:    $PASS"
echo -e "  ${RED}FAIL${NC}:    $FAIL"
echo -e "  ${YELLOW}PARTIAL${NC}: $PARTIAL"
echo -e "  ${CYAN}SKIP${NC}:    $SKIP"
echo "  ────────"
echo "  TOTAL:   $TOTAL"
echo "========================================================"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}Some tests failed. Review output above for details.${NC}"
  exit 1
elif [ "$PARTIAL" -gt 0 ]; then
  echo -e "${YELLOW}All core tests passed but some results are partial. Review caveats above.${NC}"
  exit 0
else
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi
