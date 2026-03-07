.PHONY: help install start stop test clean lint build check ci pre-push backend-lint backend-test backend-build frontend-lint frontend-build contract-test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing backend dependencies..."
	cd backend && pnpm install
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install
	@echo "Installing contract dependencies..."
	cd contract && pnpm install

start: ## Start all services
	@./start-dev.sh

stop: ## Stop all services
	@./stop-dev.sh

# Backend targets
backend-lint: ## Run backend linting
	@echo "Running backend linting..."
	cd backend && pnpm run lint

backend-test: ## Run backend tests with coverage
	@echo "Running backend tests..."
	cd backend && pnpm run test:cov

backend-build: ## Build backend
	@echo "Building backend..."
	cd backend && pnpm run build

# Frontend targets
frontend-lint: ## Run frontend linting
	@echo "Running frontend linting..."
	cd frontend && pnpm run lint

frontend-build: ## Build frontend
	@echo "Building frontend..."
	cd frontend && pnpm run build

# Contract targets
contract-test: ## Run contract tests
	@echo "Running contract tests..."
	cd contract && pnpm run test

# Combined targets
lint: backend-lint frontend-lint ## Run all linting checks

build: backend-build frontend-build ## Build all projects

test: backend-test contract-test ## Run all tests

# Pipeline checks
check: lint test build ## Run all checks (lint, test, build)

ci: ## Run full CI pipeline checks locally
	@echo "=========================================="
	@echo "Running full CI pipeline checks..."
	@echo "=========================================="
	@echo ""
	@echo "Step 1/6: Backend linting..."
	@$(MAKE) backend-lint
	@echo ""
	@echo "Step 2/6: Frontend linting..."
	@$(MAKE) frontend-lint
	@echo ""
	@echo "Step 3/6: Backend tests..."
	@$(MAKE) backend-test
	@echo ""
	@echo "Step 4/6: Contract tests..."
	@$(MAKE) contract-test
	@echo ""
	@echo "Step 5/6: Backend build..."
	@$(MAKE) backend-build
	@echo ""
	@echo "Step 6/6: Frontend build..."
	@$(MAKE) frontend-build
	@echo ""
	@echo "=========================================="
	@echo "✅ All CI checks passed!"
	@echo "=========================================="

pre-push: ci ## Run all checks before pushing to main (alias for ci)
	@echo "Ready to push to main! 🚀"

clean: ## Clean all dependencies and build artifacts
	@echo "Cleaning backend..."
	cd backend && rm -rf node_modules dist coverage
	@echo "Cleaning frontend..."
	cd frontend && rm -rf node_modules .next
	@echo "Cleaning contract..."
	cd contract && rm -rf node_modules

db-up: ## Start database services
	docker-compose up -d

db-down: ## Stop database services
	docker-compose down

db-reset: ## Reset database
	docker-compose down -v
	docker-compose up -d

logs: ## Show logs
	@tail -f backend.log frontend.log
