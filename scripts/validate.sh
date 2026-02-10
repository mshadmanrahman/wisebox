#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_BACKEND=1
RUN_FRONTEND=1
RUN_E2E=0

for arg in "$@"; do
  case "$arg" in
    --frontend-only)
      RUN_BACKEND=0
      ;;
    --backend-only)
      RUN_FRONTEND=0
      ;;
    --with-e2e)
      RUN_E2E=1
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: ./scripts/validate.sh [--frontend-only|--backend-only|--with-e2e]"
      exit 1
      ;;
  esac
done

if [[ "$RUN_BACKEND" -eq 1 ]]; then
  echo "==> Backend: running Laravel test suite"
  (
    cd "$ROOT_DIR"
    docker compose exec -T app php artisan test
  )
fi

if [[ "$RUN_FRONTEND" -eq 1 ]]; then
  echo "==> Frontend: TypeScript check"
  (
    cd "$ROOT_DIR/frontend"
    npx tsc --noEmit
  )

  echo "==> Frontend: lint"
  (
    cd "$ROOT_DIR/frontend"
    npm run lint
  )

  echo "==> Frontend: production build"
  (
    cd "$ROOT_DIR/frontend"
    npm run build
  )
fi

if [[ "$RUN_E2E" -eq 1 ]]; then
  echo "==> Frontend: Playwright E2E suite"
  (
    cd "$ROOT_DIR/frontend"
    npm run test:e2e
  )
fi

echo "==> Validation complete"
