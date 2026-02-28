.PHONY: help check ci frontend backend clean install-frontend install-backend

# Default target
help:
	@echo "Available targets:"
	@echo "  make check frontend     Run frontend CI pipeline locally"
	@echo "  make check backend      Run backend CI pipeline locally"
	@echo "  make check              Run both frontend and backend CI pipelines"
	@echo "  make frontend          Run frontend CI pipeline"
	@echo "  make backend           Run backend CI pipeline"
	@echo "  make ci                Run full CI pipeline (both frontend and backend)"
	@echo "  make install-frontend  Install frontend dependencies"
	@echo "  make install-backend   Install backend dependencies"
	@echo "  make clean             Clean node_modules and build artifacts"

# Main check target with arguments
check:
	@if [ "$(filter frontend,$(MAKECMDGOALS))" ] || [ "$(filter backend,$(MAKECMDGOALS))" ]; then \
		if [ "$(filter frontend,$(MAKECMDGOALS))" ]; then \
			echo "Running frontend CI pipeline..."; \
			$(MAKE) frontend; \
		fi; \
		if [ "$(filter backend,$(MAKECMDGOALS))" ]; then \
			echo "Running backend CI pipeline..."; \
			$(MAKE) backend; \
		fi; \
	else \
		echo "Running full CI pipeline (both frontend and backend)..."; \
		$(MAKE) ci; \
	fi

# Full CI pipeline
ci: frontend backend

# Frontend CI pipeline (mirrors .github/workflows/frontend-ci.yml)
frontend: install-frontend
	@echo "Running frontend linting..."
	cd frontend && pnpm run lint
	@echo "Frontend linting passed!"
	@echo "Building frontend..."
	cd frontend && pnpm run build
	@echo "Frontend build completed successfully!"
	@echo "✅ Frontend CI pipeline passed!"

# Backend CI pipeline (mirrors .github/workflows/backend-ci.yml)
backend: install-backend
	@echo "Running backend linting..."
	cd backend && pnpm run lint
	@echo "Backend linting passed!"
	@echo "Running backend tests with coverage..."
	cd backend && pnpm run test:cov
	@echo "Backend tests passed!"
	@echo "Building backend..."
	cd backend && pnpm run build
	@echo "Backend build completed successfully!"
	@echo "✅ Backend CI pipeline passed!"

# Install dependencies
install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && pnpm install

# Clean artifacts
clean:
	@echo "Cleaning node_modules and build artifacts..."
	rm -rf frontend/node_modules frontend/.next
	rm -rf backend/node_modules backend/dist backend/coverage
	@echo "Clean completed!"

# Development helpers
dev-frontend:
	@echo "Starting frontend development server..."
	cd frontend && pnpm run dev

dev-backend:
	@echo "Starting backend development server..."
	cd backend && pnpm run start:dev

# Test helpers
test-frontend:
	@echo "Running frontend tests..."
	cd frontend && pnpm run test

test-backend:
	@echo "Running backend tests..."
	cd backend && pnpm run test

test-backend-e2e:
	@echo "Running backend e2e tests..."
	cd backend && pnpm run test:e2e
