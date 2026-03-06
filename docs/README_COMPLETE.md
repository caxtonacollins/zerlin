# Zerlin - Complete Integration Guide

## 🎯 Project Overview

Zerlin is a real-time STX gas calculator and fee estimator for the Stacks blockchain. It helps users understand exactly how much STX they need for transactions before they fail, eliminating friction in Bitcoin DeFi.

## 🏗️ Architecture

### Smart Contracts (Clarity)
- **fee-oracle-v1**: Central fee rate oracle with historical tracking
- **tx-templates-v1**: Pre-calculated gas costs for 31 common operations
- **smart-alerts-v1**: User alert management for fee thresholds

### Backend (NestJS)
- **FeeService**: Orchestrates fee calculations and network monitoring
- **PriceService**: Real-time STX price from CoinGecko (USD/BTC conversion)
- **StacksService**: Blockchain integration with retry logic
- **RedisService**: Caching layer (30-60s TTL)
- **PostgreSQL**: Persistent storage for fee history

### Frontend (Next.js)
- **FeeCalculator**: Main calculation interface
- **NetworkStatus**: Real-time congestion monitoring
- **useEstimate**: Fee calculation hook
- **useNetworkStatus**: Network monitoring hook
- **Toast notifications**: User feedback system

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Make scripts executable (already done)
chmod +x start-dev.sh stop-dev.sh

# Start everything
./start-dev.sh

# Access the app
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
# Swagger: http://localhost:3000/api

# Stop everything
./stop-dev.sh
```

### Option 2: Manual Setup

See `SETUP.md` for detailed manual setup instructions.

## 📊 Features Implemented

### ✅ Core Features
- [x] Real-time fee estimation for 5 transaction types
- [x] Network status monitoring with congestion levels
- [x] USD/BTC price conversion via CoinGecko
- [x] Redis caching for performance
- [x] PostgreSQL persistence
- [x] Smart contract integration
- [x] Swagger API documentation
- [x] Responsive UI with animations
- [x] Error handling and loading states
- [x] Toast notifications

### 🔄 Transaction Types Supported
1. **Transfer** - Simple STX transfers
2. **Contract Call** - Smart contract function calls
3. **Contract Deploy** - Deploy new contracts
4. **NFT Mint** - Mint NFTs
5. **Swap** - DEX token swaps

### 📈 Performance Optimizations
- Redis caching (30s for network, 60s for prices)
- Retry logic with exponential backoff
- Request timeout handling (5s)
- Async database operations
- Memoized API client
- Auto-refresh network status (30s)

## 🔌 API Endpoints

### POST /api/estimate
Estimate transaction fee

**Request:**
```json
{
  "type": "transfer"
}
```

**Response:**
```json
{
  "transactionType": "transfer",
  "estimatedFee": {
    "stx": "0.000180",
    "microStx": 180,
    "usd": "0.0003",
    "btc": 0.000000045
  },
  "breakdown": {
    "baseFee": 180,
    "executionCost": 0,
    "dataSize": 180
  },
  "networkStatus": {
    "congestion": "low",
    "averageFee": 1,
    "recommendedBuffer": 360
  },
  "timestamp": "2026-03-06T10:30:00.000Z",
  "cached": false
}
```

### GET /api/network
Get current network status

**Response:**
```json
{
  "congestionLevel": "low",
  "averageFeeRate": 1,
  "mempoolSize": 5,
  "blockHeight": 123456
}
```

### GET /api/history
Get recent fee estimates (last 50)

## 🧪 Testing

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
# Result: 88 passing tests ✅
```

### Manual API Testing
```bash
# Test fee estimation
curl -X POST http://localhost:3000/api/estimate \
  -H "Content-Type: application/json" \
  -d '{"type": "transfer"}'

# Test network status
curl http://localhost:3000/api/network

# Test fee history
curl http://localhost:3000/api/history
```

## 📁 Project Structure

```
zerlin/
├── contract/                 # Clarity smart contracts
│   ├── contracts/
│   │   ├── fee-oracle.clar
│   │   ├── tx-templates.clar
│   │   └── smart-alerts.clar
│   └── tests/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── contracts/       # Contract interaction services
│   │   ├── fee/             # Fee estimation logic
│   │   ├── price/           # Price feed service
│   │   ├── stacks/          # Blockchain integration
│   │   ├── redis/           # Caching layer
│   │   └── entities/        # Database models
│   ├── .env                 # Environment config
│   └── docker-compose.yml   # Database services
├── frontend/                 # Next.js app
│   ├── src/
│   │   ├── app/             # Pages
│   │   ├── components/      # UI components
│   │   ├── hooks/           # React hooks
│   │   ├── lib/             # Utilities
│   │   └── types/           # TypeScript types
│   └── .env.local           # Environment config
├── start-dev.sh             # Start all services
├── stop-dev.sh              # Stop all services
├── SETUP.md                 # Detailed setup guide
└── OPTIMIZATION_SUMMARY.md  # Changes documentation
```

## 🔧 Configuration

### Backend Environment Variables
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

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_FEE_ORACLE_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fee-oracle-v1
NEXT_PUBLIC_TX_TEMPLATES_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.tx-templates-v1
NEXT_PUBLIC_SMART_ALERTS_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.smart-alerts-v1
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9

# Check database connection
docker ps  # Ensure PostgreSQL and Redis are running
```

### Frontend won't start
```bash
# Check if port 3001 is in use
lsof -ti:3001 | xargs kill -9

# Reinstall dependencies
cd frontend
rm -rf node_modules .next
pnpm install
```

### API returns errors
```bash
# Check backend logs
tail -f backend.log

# Verify environment variables
cat backend/.env

# Test database connection
docker exec -it zerlin-postgres psql -U zerlin -d zerlin
```

### Price conversions show $0.00
- Check internet connection (CoinGecko API)
- Verify Redis is running: `redis-cli ping`
- Check backend logs for API errors

## 📚 Documentation

- **SETUP.md** - Complete setup instructions
- **OPTIMIZATION_SUMMARY.md** - All changes and improvements
- **CONTRACT_INTERACTION.md** - Smart contract usage guide
- **Swagger Docs** - http://localhost:3000/api

## 🎯 Next Development Phase

### Phase 1: Core Features ✅ (COMPLETED)
- Real-time fee estimation
- Network status monitoring
- Price conversions
- Basic UI/UX

### Phase 2: User Features (Next)
- [ ] Wallet connection (Xverse, Leather, Hiro)
- [ ] Balance checking
- [ ] Transaction history
- [ ] User preferences

### Phase 3: Advanced Features
- [ ] Smart alerts UI
- [ ] Historical charts
- [ ] Dashboard analytics
- [ ] Email/push notifications

### Phase 4: Production
- [ ] Mainnet deployment
- [ ] Performance monitoring
- [ ] CDN integration
- [ ] Load balancing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

See LICENSE file for details.

## 🆘 Support

For issues or questions:
1. Check documentation in `SETUP.md`
2. Review Swagger docs at http://localhost:3000/api
3. Check backend logs: `tail -f backend.log`
4. Check frontend logs: `tail -f frontend.log`

## 🎉 Success Metrics

- ✅ Backend starts without errors
- ✅ Frontend connects to backend
- ✅ Fee estimation works for all types
- ✅ Price conversions show real values
- ✅ Network status updates automatically
- ✅ Error states display properly
- ✅ Loading states work correctly
- ✅ Toast notifications appear
- ✅ Redis caching functions
- ✅ Database persistence works

## 🚀 Deployment Status

- **Development**: ✅ Ready
- **Staging**: ⚠️ Needs setup
- **Production**: ❌ Not ready (see Phase 4)

---

**Built with ❤️ for the Stacks ecosystem**
