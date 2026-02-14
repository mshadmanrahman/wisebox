#!/bin/bash

# ==============================================================================
# Wisebox Local Development Setup
# ==============================================================================
# Automated setup script for first-time local development environment.
# This script will:
# 1. Validate prerequisites
# 2. Install dependencies (backend + frontend)
# 3. Copy environment files
# 4. Start Docker services
# 5. Run migrations and seeders
# 6. Start frontend dev server
# ==============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
  echo ""
  echo -e "${BLUE}===================================================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}===================================================================${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# ==============================================================================
# Step 1: Validate Prerequisites
# ==============================================================================
print_header "Step 1: Validating Prerequisites"

# Check Docker
if ! command -v docker &> /dev/null; then
  print_error "Docker is not installed. Please install Docker Desktop first."
  exit 1
fi
print_success "Docker is installed"

# Check Docker Compose
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
  print_error "Docker Compose is not installed. Please install Docker Desktop with Compose."
  exit 1
fi
print_success "Docker Compose is available"

# Check Node.js
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed. Please install Node.js 22 LTS."
  exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -ne 22 ]; then
  print_warning "Node.js version is $NODE_VERSION, but version 22 is required."
  print_info "Attempting to switch to Node 22 using nvm..."

  if command -v nvm &> /dev/null; then
    source ~/.nvm/nvm.sh
    nvm use 22 || nvm install 22
    print_success "Switched to Node.js 22"
  else
    print_error "nvm is not installed. Please install nvm and run: nvm install 22 && nvm use 22"
    exit 1
  fi
else
  print_success "Node.js 22 is active"
fi

# Check npm
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed. Please install npm."
  exit 1
fi
print_success "npm is installed"

# ==============================================================================
# Step 2: Copy Environment Files
# ==============================================================================
print_header "Step 2: Setting Up Environment Files"

# Backend .env
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
  print_info "Copying backend/.env.example to backend/.env"
  cp "$PROJECT_ROOT/backend/.env.example" "$PROJECT_ROOT/backend/.env"
  print_success "Created backend/.env"
else
  print_info "backend/.env already exists (skipping)"
fi

# Frontend .env.local
if [ ! -f "$PROJECT_ROOT/frontend/.env.local" ]; then
  print_info "Copying frontend/.env.local.example to frontend/.env.local"
  cp "$PROJECT_ROOT/frontend/.env.local.example" "$PROJECT_ROOT/frontend/.env.local"
  print_success "Created frontend/.env.local"
else
  print_info "frontend/.env.local already exists (skipping)"
fi

# ==============================================================================
# Step 3: Start Docker Services
# ==============================================================================
print_header "Step 3: Starting Docker Services"

print_info "Starting MySQL, Redis, and Laravel containers..."
docker compose up -d

# Wait for MySQL to be ready
print_info "Waiting for MySQL to be ready..."
MAX_TRIES=30
TRIES=0
until docker compose exec -T mysql mysqladmin ping -h localhost --silent &> /dev/null; do
  TRIES=$((TRIES + 1))
  if [ $TRIES -ge $MAX_TRIES ]; then
    print_error "MySQL failed to start after $MAX_TRIES attempts"
    exit 1
  fi
  echo -n "."
  sleep 2
done
echo ""
print_success "MySQL is ready"

# ==============================================================================
# Step 4: Install Backend Dependencies
# ==============================================================================
print_header "Step 4: Installing Backend Dependencies"

print_info "Installing Composer dependencies..."
docker compose exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader

print_success "Backend dependencies installed"

# ==============================================================================
# Step 5: Generate Application Key
# ==============================================================================
print_header "Step 5: Generating Laravel Application Key"

# Check if APP_KEY is already set
if grep -q "^APP_KEY=$" "$PROJECT_ROOT/backend/.env" || ! grep -q "^APP_KEY=" "$PROJECT_ROOT/backend/.env"; then
  print_info "Generating Laravel application key..."
  docker compose exec -T app php artisan key:generate
  print_success "Application key generated"
else
  print_info "Application key already exists (skipping)"
fi

# ==============================================================================
# Step 6: Run Database Migrations and Seeders
# ==============================================================================
print_header "Step 6: Setting Up Database"

print_info "Running migrations and seeders..."
docker compose exec -T app php artisan migrate --seed --force

print_success "Database setup complete"

# ==============================================================================
# Step 7: Clear Laravel Caches
# ==============================================================================
print_header "Step 7: Clearing Laravel Caches"

print_info "Clearing config cache..."
docker compose exec -T app php artisan config:clear

print_info "Clearing route cache..."
docker compose exec -T app php artisan route:clear

print_info "Clearing view cache..."
docker compose exec -T app php artisan view:clear

print_success "Caches cleared"

# ==============================================================================
# Step 8: Install Frontend Dependencies
# ==============================================================================
print_header "Step 8: Installing Frontend Dependencies"

print_info "Installing npm packages..."
cd "$PROJECT_ROOT/frontend"

# Ensure we're using Node 22
if command -v nvm &> /dev/null; then
  source ~/.nvm/nvm.sh
  nvm use 22
fi

npm install

print_success "Frontend dependencies installed"

# ==============================================================================
# Step 9: Install Playwright Browsers (if not already installed)
# ==============================================================================
print_header "Step 9: Installing Playwright Browsers"

print_info "Installing Playwright browsers for E2E testing..."
npx playwright install

print_success "Playwright browsers installed"

# ==============================================================================
# Final Summary
# ==============================================================================
cd "$PROJECT_ROOT"

print_header "🎉 Setup Complete!"

echo ""
echo -e "${GREEN}Your Wisebox development environment is ready!${NC}"
echo ""
echo -e "${BLUE}Services:${NC}"
echo "  Backend API:      http://localhost:8000/api/v1"
echo "  Admin Panel:      http://localhost:8000/admin"
echo "  Frontend:         http://localhost:3000"
echo "  MySQL:            localhost:3306"
echo "  Redis:            localhost:6379"
echo ""
echo -e "${BLUE}Admin Login (seeded):${NC}"
echo "  URL:      http://localhost:8000/admin/login"
echo "  Email:    admin@wisebox.local"
echo "  Password: Admin123!"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Start the frontend dev server:"
echo "     ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "  2. Open your browser to:"
echo "     ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "  3. Run E2E tests:"
echo "     ${YELLOW}cd frontend && npm run test:e2e${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  Stop services:         ${YELLOW}docker compose down${NC}"
echo "  View backend logs:     ${YELLOW}docker compose logs -f app${NC}"
echo "  Run backend tests:     ${YELLOW}docker compose exec app php artisan test${NC}"
echo "  Clear Laravel cache:   ${YELLOW}docker compose exec app php artisan config:clear${NC}"
echo ""
print_info "For troubleshooting, see README.md"
echo ""
