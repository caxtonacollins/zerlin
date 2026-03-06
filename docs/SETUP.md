# Zerlin Setup Guide

Complete setup instructions for the Zerlin STX Gas Calculator.

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 14+
- Redis 6+
- Docker (optional, for easy database setup)

## Quick Start with Docker

### 1. Start Database Services

```bash
cd backend
docker-compose up -d
```

This starts PostgreSQL and Redis containers.

### 2. Backend Setup

```bash
cd backend
pnpm install

# The .env file has been created with default values
# Update STACKS_PRIVATE_KEY or STACKS_MNEMONIC if you want to broadcast transactions

# Run database migrations (auto-sync enabled in dev)
pnpm start:dev
```

Backend will be available at `http://localhost:3000`
Swagger API docs at `http://localhost:3000/api`

### 3. Frontend Setup

```bash
cd frontend
pnpm install

# The .env.local file has been created with default values
pnpm dev
```

Frontend will be available at `http://localhost:3001`

### 4. Contract Deployment (Optional)

If you want to deploy contracts to testnet:

```bash
cd contract
clarinet deployments generate --devnet
clarinet deployments apply -p deployments/default.devnet-plan.yaml
```

Update contract addresses in:
- `backend/.env` → `CONTRACT_ADDRESS_DEPLOYER`
- `frontend/.env.local` → `NEXT_PUBLIC_*_ADDRESS`

## Manual Database Setup

If not using Docker:

### PostgreSQL

```bash
# Create database
createdb zerlin

# Create user
psql -c "CREATE USER zerlin WITH PASSWORD 'zerlinpassword';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE zerlin TO zerlin;"
```

### Redis

```bash
# Install Redis
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server

# Start Redis
redis-server
```

## Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=zerlin
DB_PASSWORD=zerlinpassword
DB_NAME=zerlin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Stacks
STACKS_NETWORK=testnet
STACKS_API_URL=https://api.testnet.hiro.so
CONTRACT_ADDRESS_DEPLOYER=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# App
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_FEE_ORACLE_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fee-oracle-v1
NEXT_PUBLIC_TX_TEMPLATES_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.tx-templates-v1
NEXT_PUBLIC_SMART_ALERTS_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.smart-alerts-v1
```

## Testing

### Backend Tests

```bash
cd backend
pnpm test
pnpm test:cov  # With coverage
```

### Contract Tests

```bash
cd contract
pnpm test
```

## API Endpoints

Once running, test the API:

### Estimate Fee
```bash
curl -X POST http://localhost:3000/api/estimate \
  -H "Content-Type: application/json" \
  -d '{"type": "transfer"}'
```

### Get Network Status
```bash
curl http://localhost:3000/api/network
```

### Get Fee History
```bash
curl http://localhost:3000/api/history
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check connection
psql -U zerlin -d zerlin -h localhost
```

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

### Port Already in Use

```bash
# Backend (port 3000)
lsof -ti:3000 | xargs kill -9

# Frontend (port 3001)
lsof -ti:3001 | xargs kill -9
```

### Contract Interaction Issues

Make sure:
1. Contracts are deployed to the network specified in `.env`
2. Contract addresses match in both backend and frontend configs
3. Network (testnet/mainnet) is consistent across all configs

## Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Use strong database passwords
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use environment-specific Stacks API URLs
6. Add monitoring and logging

### Frontend

1. Build for production: `pnpm build`
2. Set production API URL in environment
3. Deploy to Vercel/Netlify or your hosting provider
4. Configure CDN for static assets

### Database

1. Disable `synchronize: true` in TypeORM config
2. Use proper migrations
3. Set up backups
4. Configure connection pooling

## Features Implemented

✅ Real-time fee estimation for multiple transaction types
✅ Network status monitoring with congestion levels
✅ USD/BTC price conversion via CoinGecko API
✅ Redis caching for performance
✅ PostgreSQL persistence for fee history
✅ Smart contract integration (fee-oracle, tx-templates, smart-alerts)
✅ Swagger API documentation
✅ Responsive frontend with real-time updates
✅ Error handling and loading states
✅ Toast notifications

## Next Steps

- [ ] Implement wallet connection (Xverse, Leather, Hiro)
- [ ] Add user authentication
- [ ] Implement smart alerts UI
- [ ] Add historical charts
- [ ] Create dashboard page
- [ ] Add WebSocket for real-time updates
- [ ] Implement alert notifications
- [ ] Deploy to mainnet
