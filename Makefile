.PHONY: help install start stop test clean

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

test: ## Run all tests
	@echo "Running backend tests..."
	cd backend && pnpm test
	@echo "Running contract tests..."
	cd contract && pnpm test

clean: ## Clean all dependencies and build artifacts
	@echo "Cleaning backend..."
	cd backend && rm -rf node_modules dist
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
