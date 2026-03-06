# 🚀 Zerlin Quick Start Guide

## One-Command Start

```bash
./start-dev.sh
```

That's it! Everything will start automatically.

## Access Points

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## Stop Everything

```bash
./stop-dev.sh
```

## What Just Happened?

The startup script:
1. ✅ Started PostgreSQL (port 5432)
2. ✅ Started Redis (port 6379)
3. ✅ Started Backend API (port 3000)
4. ✅ Started Frontend (port 3001)

## Test It Works

### 1. Check Health
```bash
curl http://localhost:3000/health
```

### 2. Calculate a Fee
```bash
curl -X POST http://localhost:3000/api/estimate \
  -H "Content-Type: application/json" \
  -d '{"type": "transfer"}'
```

### 3. Open Frontend
Visit http://localhost:3001 and click "Calculate Fee"

## Features Available

✅ Real-time fee estimation
✅ Network status monitoring
✅ USD/BTC price conversion
✅ 5 transaction types (transfer, contract-call, nft-mint, swap, contract-deploy)
✅ Error handling
✅ Loading states
✅ Toast notifications

## Transaction Types

1. **transfer** - Simple STX transfers
2. **contract-call** - Smart contract calls
3. **contract-deploy** - Deploy contracts
4. **nft-mint** - Mint NFTs
5. **swap** - DEX token swaps

## Logs

```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log
```

## Troubleshooting

### Services won't start?
```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Restart Docker
cd backend
docker-compose down
docker-compose up -d
cd ..

# Try again
./start-dev.sh
```

### Need to reset everything?
```bash
./stop-dev.sh
cd backend
docker-compose down -v  # Remove volumes
docker-compose up -d
cd ..
./start-dev.sh
```

## Next Steps

1. ✅ Test fee estimation in the UI
2. ✅ Try different transaction types
3. ✅ Check network status updates
4. ✅ Review API docs at /api
5. ✅ Check health endpoint

## Documentation

- **SETUP.md** - Detailed setup
- **README_COMPLETE.md** - Full guide
- **INTEGRATION_COMPLETE.md** - What was done
- **OPTIMIZATION_SUMMARY.md** - Technical details

## Need Help?

1. Check logs: `tail -f backend.log` or `tail -f frontend.log`
2. Test health: `curl http://localhost:3000/health`
3. Review docs: http://localhost:3000/api
4. Read SETUP.md for detailed troubleshooting

---

**That's it! You're ready to use Zerlin! 🎉**
