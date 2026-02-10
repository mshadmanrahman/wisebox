#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"

RUN_MIGRATIONS=1
ENABLE_MAINTENANCE=1

for arg in "$@"; do
  case "$arg" in
    --skip-migrate)
      RUN_MIGRATIONS=0
      ;;
    --no-maintenance)
      ENABLE_MAINTENANCE=0
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: ./scripts/deploy-backend.sh [--skip-migrate] [--no-maintenance]"
      exit 1
      ;;
  esac
done

if [[ ! -d "$BACKEND_DIR" ]]; then
  echo "Backend directory not found: $BACKEND_DIR"
  exit 1
fi

if ! command -v composer >/dev/null 2>&1; then
  echo "composer is required on the deployment host."
  exit 1
fi

if ! command -v php >/dev/null 2>&1; then
  echo "php is required on the deployment host."
  exit 1
fi

cd "$BACKEND_DIR"

if [[ ! -f artisan ]]; then
  echo "artisan not found in $BACKEND_DIR"
  exit 1
fi

if [[ "${ENABLE_MAINTENANCE}" -eq 1 ]]; then
  php artisan down --render="errors::503" --retry=60 || true
fi

composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear || true

if [[ "${RUN_MIGRATIONS}" -eq 1 ]]; then
  php artisan migrate --force
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

php artisan queue:restart || true

if [[ "${ENABLE_MAINTENANCE}" -eq 1 ]]; then
  php artisan up
fi

echo "Backend deployment steps completed."
echo "Next: verify health endpoint and run production smoke checks."
