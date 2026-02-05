# Zerlin - STX Gas Calculator
**Real-time fee estimation for Stacks blockchain**

## Why Zerlin?
Stacks users need to hold STX for transaction fees, but understanding how much STX to keep is non-obvious. Zerlin removes

## Quick Start

### Backend (with Swagger)
```bash
cd backend
pnpm install
pnpm start:dev
```

**Swagger UI:** `http://localhost:3000/api`

### Contracts
```bash
cd contract
pnpm test  # Run tests
clarinet deployments generate --devnet  # Generate deployment plan
```

---

## API Endpoints

### POST /api/estimate
Estimate transaction fee

**Request:**
```json
{
  "type": "transfer",
  "payload": {
    "amount": 1000000,
    "recipient": "SP2X0TZ59D5SZ8ACQ..."
  }
}
```

**Response:**
```json
{
  "transactionType": "transfer",
  "estimatedFee": {
    "stx": "0.000180",
    "microStx": 180,
    "usd": "0.00",
    "btc": 0
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
  }
}
```

### GET /api/network
Get current network status

### GET /api/history
Get recent fee estimates (last 50)

---

## Testing

### Contract Tests
```bash
cd contract
pnpm test
```

**Results:** 88 passing tests ✅

### Backend Tests
```bash
cd backend
pnpm test
```

---

## Deployment

### Devnet
```bash
cd contract
clarinet deployments generate --devnet
clarinet deployments apply -p deployments/default.devnet-plan.yaml
```

### Testnet
```bash
clarinet deployments generate --testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

---

---

## Next Steps

### Post-MVP Features
- [ ] Add back batch operations
- [ ] Implement WebSocket for real-time updates
- [ ] Build Next.js frontend
- [ ] Integrate wallet connections
- [ ] Add price feed for USD/BTC conversion

### Documentation
- [ ] API integration guide
- [ ] Contract deployment guide
- [ ] Frontend integration examples

---

## Support
- [Discord](https://discord.gg/zerlin)
- [Twitter](https://twitter.com/zerlin_io)
- Email: team@zerlin.io
## Acknowledgments
Built with support from the Stacks Foundation and the Stacks community.
