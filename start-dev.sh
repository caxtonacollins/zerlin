#!/bin/bash

# Zerlin Development Startup Script
# This script starts all services needed for local development

set -e

echo "🚀 Starting Zerlin Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Start database services
echo -e "${BLUE}📦 Starting PostgreSQL and Redis...${NC}"
cd backend
docker-compose up -d
cd ..

# Wait for databases to be ready
echo -e "${BLUE}⏳ Waiting for databases to be ready...${NC}"
sleep 5

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}📥 Installing backend dependencies...${NC}"
    cd backend
    pnpm install
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}📥 Installing frontend dependencies...${NC}"
    cd frontend
    pnpm install
    cd ..
fi

# Start backend in background
echo -e "${BLUE}🔧 Starting backend server...${NC}"
cd backend
pnpm start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${BLUE}⏳ Waiting for backend to start...${NC}"
sleep 10

# Start frontend in background
echo -e "${BLUE}🎨 Starting frontend server...${NC}"
cd frontend
pnpm dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

echo ""
echo -e "${GREEN}✅ Zerlin is now running!${NC}"
echo ""
echo -e "${GREEN}📍 Services:${NC}"
echo -e "   Backend:  ${BLUE}http://localhost:3000${NC}"
echo -e "   Swagger:  ${BLUE}http://localhost:3000/api${NC}"
echo -e "   Frontend: ${BLUE}http://localhost:3001${NC}"
echo ""
echo -e "${GREEN}📝 Logs:${NC}"
echo -e "   Backend:  tail -f backend.log"
echo -e "   Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}💡 To stop all services:${NC}"
echo -e "   ./stop-dev.sh"
echo ""
echo -e "${GREEN}🎉 Happy coding!${NC}"

# Save PIDs for cleanup
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid
