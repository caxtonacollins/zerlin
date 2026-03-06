#!/bin/bash

# Zerlin Development Shutdown Script

set -e

echo "🛑 Stopping Zerlin Development Environment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Stop backend
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${RED}Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
    fi
    rm .backend.pid
fi

# Stop frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${RED}Stopping frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    rm .frontend.pid
fi

# Stop Docker containers
echo -e "${RED}Stopping Docker containers...${NC}"
cd backend
docker-compose down
cd ..

# Clean up log files
if [ -f backend.log ]; then
    rm backend.log
fi
if [ -f frontend.log ]; then
    rm frontend.log
fi

echo -e "${GREEN}✅ All services stopped${NC}"
