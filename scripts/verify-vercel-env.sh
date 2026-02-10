#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/frontend/.env.production.vercel"

for arg in "$@"; do
  case "$arg" in
    --env-file=*)
      ENV_FILE="${arg#*=}"
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: ./scripts/verify-vercel-env.sh [--env-file=/path/to/file]"
      exit 1
      ;;
  esac
done

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE"
  echo "Tip: run 'cd frontend && vercel env pull .env.production.vercel --environment=production'"
  exit 1
fi

required_vars=(
  "NEXT_PUBLIC_API_URL"
  "NEXT_PUBLIC_APP_URL"
)

optional_vars=(
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID"
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
)

get_value() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 || true)"
  if [[ -z "$line" ]]; then
    echo ""
  else
    echo "${line#*=}"
  fi
}

missing=0

for key in "${required_vars[@]}"; do
  value="$(get_value "$key")"
  if [[ -z "$value" ]]; then
    echo "[MISSING] $key"
    missing=1
  else
    echo "[OK] $key"
  fi
done

for key in "${optional_vars[@]}"; do
  value="$(get_value "$key")"
  if [[ -z "$value" ]]; then
    echo "[WARN] $key is not set"
  else
    echo "[OK] $key"
  fi
done

api_url="$(get_value "NEXT_PUBLIC_API_URL")"
app_url="$(get_value "NEXT_PUBLIC_APP_URL")"

if [[ -n "$api_url" && ! "$api_url" =~ ^https:// ]]; then
  echo "[WARN] NEXT_PUBLIC_API_URL should use https in production: $api_url"
fi
if [[ -n "$api_url" && ! "$api_url" =~ /api/v1/?$ ]]; then
  echo "[WARN] NEXT_PUBLIC_API_URL should end with /api/v1: $api_url"
fi
if [[ -n "$app_url" && ! "$app_url" =~ ^https:// ]]; then
  echo "[WARN] NEXT_PUBLIC_APP_URL should use https in production: $app_url"
fi

if [[ "$missing" -eq 1 ]]; then
  echo "Vercel env verification failed."
  exit 1
fi

echo "Vercel env verification passed."
