#!/usr/bin/env bash

set -euo pipefail

APP_BASE_URL="${APP_BASE_URL:-https://mywisebox.com}"
API_BASE_URL="${API_BASE_URL:-https://api.mywisebox.com/api/v1}"

pass_count=0
fail_count=0

check_status() {
  local name="$1"
  local url="$2"
  local expected="$3"

  local code
  code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" || true)"

  if [[ "$code" == "$expected" ]]; then
    echo "[PASS] $name ($code)"
    pass_count=$((pass_count + 1))
  else
    echo "[FAIL] $name expected=$expected actual=$code url=$url"
    fail_count=$((fail_count + 1))
  fi
}

check_redirect_contains() {
  local name="$1"
  local url="$2"
  local expected_substring="$3"

  local headers
  headers="$(curl -sS -I "$url" || true)"

  if echo "$headers" | rg -qi "^location: .*${expected_substring}"; then
    echo "[PASS] $name"
    pass_count=$((pass_count + 1))
  else
    echo "[FAIL] $name expected location containing '${expected_substring}'"
    echo "$headers"
    fail_count=$((fail_count + 1))
  fi
}

check_body_contains() {
  local name="$1"
  local url="$2"
  local text="$3"

  local body
  body="$(curl -sS "$url" || true)"
  if echo "$body" | rg -q "$text"; then
    echo "[PASS] $name"
    pass_count=$((pass_count + 1))
  else
    echo "[FAIL] $name missing text '$text'"
    fail_count=$((fail_count + 1))
  fi
}

echo "Running production smoke checks"
echo "APP_BASE_URL=$APP_BASE_URL"
echo "API_BASE_URL=$API_BASE_URL"

check_status "API health endpoint" "$API_BASE_URL" "200"
check_body_contains "API health payload" "$API_BASE_URL" '"status"\s*:\s*"ok"'

check_status "Home page" "$APP_BASE_URL/" "200"
check_status "About page" "$APP_BASE_URL/about" "200"
check_status "FAQ page" "$APP_BASE_URL/faq" "200"
check_status "Contact page" "$APP_BASE_URL/contact" "200"
check_status "Services page" "$APP_BASE_URL/services" "200"
check_status "Assessment page" "$APP_BASE_URL/assessment" "200"
check_status "Login page" "$APP_BASE_URL/login" "200"
check_status "Robots" "$APP_BASE_URL/robots.txt" "200"
check_status "Sitemap" "$APP_BASE_URL/sitemap.xml" "200"

check_redirect_contains "Workspace services redirect" "$APP_BASE_URL/workspace/services" "/login"

check_status "Protected API endpoint rejects unauthenticated" "$API_BASE_URL/orders" "401"

echo "Smoke checks complete: pass=$pass_count fail=$fail_count"

if [[ "$fail_count" -gt 0 ]]; then
  exit 1
fi
