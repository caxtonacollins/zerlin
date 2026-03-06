# Zerlin Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                     http://localhost:3001                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages                                                    │  │
│  │  ├── / (Home with FeeCalculator)                         │  │
│  │  ├── /dashboard (Planned)                                │  │
│  │  └── /history (Planned)                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Components                                               │  │
│  │  ├── FeeCalculator (Main UI)                             │  │
│  │  ├── NetworkStatus (Congestion indicator)                │  │
│  │  ├── FeeDisplay (Results display)                        │  │
│  │  └── Navigation (Header with wallet)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Hooks                                                    │  │
│  │  ├── useEstimate() - Fee calculations                    │  │
│  │  ├── useNetworkStatus() - Network monitoring             │  │
│  │  └── useWallet() - Wallet connection (planned)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Client                                               │  │
│  │  ├── estimateFee()                                        │  │
│  │  ├── getNetworkStatus()                                   │  │
│  │  └── getFeeHistory()                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      BACKEND (NestJS)                            │
│                     http://localhost:3000                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Controllers                                              │  │
│  │  ├── FeeController                                        │  │
│  │  │   ├── POST /api/estimate                              │  │
│  │  │   ├── GET /api/network                                │  │
│  │  │   └── GET /api/history                                │  │
│  │  └── HealthController                                     │  │
│  │      └── GET /health                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services                                                 │  │
│  │  ├── FeeService (Orchestration)                          │  │
│  │  ├── PriceService (CoinGecko integration)                │  │
│  │  ├── StacksService (Blockchain integration)              │  │
│  │  ├── FeeOracleService (Contract calls)                   │  │
│  │  └── RedisService (Caching)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Background Tasks                                         │  │
│  │  └── PollingService (Fee rate updates)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────┬──────────────┬──────────────┬──────────────┬─────────────┘
      │              │              │              │
      │              │              │              │
┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
│PostgreSQL │  │   Redis   │  │  Stacks   │  │ CoinGecko │
│           │  │           │  │Blockchain │  │    API    │
│ Port 5432 │  │ Port 6379 │  │  Testnet  │  │   HTTPS   │
│           │  │           │  │           │  │           │
│ Entities: │  │  Caches:  │  │Contracts: │  │  Prices:  │
│ - Fees    │  │ - Network │  │ - Oracle  │  │ - STX/USD │
│ - Network │  │ - Prices  │  │ - Alerts  │  │ - STX/BTC │
│ - Users   │  │ - Health  │  │ - Templates│ │           │
│ - Alerts  │  │           │  │           │  │           │
└───────────┘  └───────────┘  └───────────┘  └───────────┘
```

## Data Flow: Fee Estimation

```
1. User Action
   └─> User selects "transfer" and clicks "Calculate Fee"

2. Frontend (FeeCalculator)
   └─> useEstimate.calculateFee('transfer')
       └─> apiClient.estimateFee({ type: 'transfer' })
           └─> POST http://localhost:3000/api/estimate

3. Backend (FeeController)
   └─> feeService.estimateFee({ type: 'transfer' })

4. FeeService Orchestration
   ├─> getNetworkStatus()
   │   ├─> Check Redis cache (30s TTL)
   │   └─> If miss: stacksService.getNetworkStatus()
   │       └─> Stacks API: GET /v2/info
   │
   ├─> feeOracleService.estimateTransferFee()
   │   └─> Contract call: fee-oracle-v1.estimate-transfer-fee
   │       └─> Returns: 180 microSTX
   │
   └─> priceService.convertMicroStxToUsd(180)
       ├─> Check Redis cache (60s TTL)
       └─> If miss: CoinGecko API
           └─> Returns: STX price in USD/BTC

5. Response Assembly
   └─> {
         transactionType: "transfer",
         estimatedFee: {
           stx: "0.000180",
           microStx: 180,
           usd: "0.0003",
           btc: 0.000000045
         },
         breakdown: { baseFee: 180, executionCost: 0, dataSize: 180 },
         networkStatus: { congestion: "low", averageFee: 1, ... }
       }

6. Frontend Display
   └─> FeeDisplay component shows results
   └─> Toast notification: "Fee calculated successfully!"
```

## Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Redis Cache                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  network_status (TTL: 30s)                              │
│  ├─> congestionLevel: "low"                             │
│  ├─> averageFeeRate: 1                                  │
│  ├─> mempoolSize: 5                                     │
│  └─> blockHeight: 123456                                │
│                                                          │
│  stx_price (TTL: 60s)                                   │
│  ├─> stxUsd: 1.65                                       │
│  ├─> stxBtc: 0.000025                                   │
│  └─> lastUpdated: 1709726400000                         │
│                                                          │
│  health_check (TTL: 10s)                                │
│  └─> "ok"                                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  fee_estimate                                           │
│  ├─> id (PK)                                            │
│  ├─> transactionType (string)                           │
│  ├─> estimatedFee (json)                                │
│  ├─> breakdown (json)                                   │
│  ├─> networkStatus (json)                               │
│  ├─> createdAt (timestamp)                              │
│  └─> updatedAt (timestamp)                              │
│                                                          │
│  network_status                                         │
│  ├─> id (PK)                                            │
│  ├─> congestionLevel (string)                           │
│  ├─> averageFeeRate (number)                            │
│  ├─> mempoolSize (number)                               │
│  ├─> blockHeight (number)                               │
│  ├─> createdAt (timestamp)                              │
│  └─> updatedAt (timestamp)                              │
│                                                          │
│  user (for future use)                                  │
│  ├─> id (PK)                                            │
│  ├─> address (string)                                   │
│  ├─> createdAt (timestamp)                              │
│  └─> updatedAt (timestamp)                              │
│                                                          │
│  alert (for future use)                                 │
│  ├─> id (PK)                                            │
│  ├─> userId (FK)                                        │
│  ├─> targetFee (number)                                 │
│  ├─> alertType (string)                                 │
│  ├─> isActive (boolean)                                 │
│  ├─> createdAt (timestamp)                              │
│  └─> updatedAt (timestamp)                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Smart Contracts

```
┌─────────────────────────────────────────────────────────┐
│              Stacks Blockchain (Testnet)                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  fee-oracle-v1                                          │
│  ├─> get-current-fee-rate() → uint                      │
│  ├─> estimate-transfer-fee() → uint                     │
│  ├─> estimate-contract-call-fee(complexity) → uint      │
│  ├─> estimate-nft-mint-fee() → uint                     │
│  ├─> estimate-swap-fee(dex) → uint                      │
│  └─> update-fee-rate(rate, congestion) [admin]          │
│                                                          │
│  tx-templates-v1                                        │
│  ├─> get-template(id) → template                        │
│  ├─> get-full-estimate(id) → estimate                   │
│  ├─> list-templates-by-category(cat) → list             │
│  └─> update-template(id, data) [admin]                  │
│                                                          │
│  smart-alerts-v1                                        │
│  ├─> create-alert(target, type, tx-type) → uint         │
│  ├─> get-alert(user, id) → alert                        │
│  ├─> toggle-alert(id, active) → bool                    │
│  ├─> should-alert-trigger(user, id, fee) → bool         │
│  └─> mark-triggered(user, id) [admin]                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## API Endpoints

```
┌─────────────────────────────────────────────────────────┐
│                    REST API Endpoints                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  POST /api/estimate                                     │
│  ├─> Body: { type: "transfer" }                         │
│  └─> Returns: FeeEstimateResponseDto                    │
│                                                          │
│  GET /api/network                                       │
│  └─> Returns: NetworkStatusResponseDto                  │
│                                                          │
│  GET /api/history?days=7                                │
│  └─> Returns: FeeEstimateResponseDto[]                  │
│                                                          │
│  GET /health                                            │
│  └─> Returns: { status, services: {...} }               │
│                                                          │
│  GET /api (Swagger UI)                                  │
│  └─> Interactive API documentation                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Performance Characteristics

```
┌─────────────────────────────────────────────────────────┐
│                  Response Times                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Cached Requests                                        │
│  ├─> Network Status: ~50ms                              │
│  ├─> Price Data: ~50ms                                  │
│  └─> Fee Estimate: ~200ms                               │
│                                                          │
│  Uncached Requests                                      │
│  ├─> Network Status: ~300ms                             │
│  ├─> Price Data: ~500ms                                 │
│  └─> Fee Estimate: ~800ms                               │
│                                                          │
│  Cache TTLs                                             │
│  ├─> Network Status: 30 seconds                         │
│  ├─> Price Data: 60 seconds                             │
│  └─> Health Check: 10 seconds                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Security Considerations

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend                                               │
│  ├─> Input validation (Zod schemas)                     │
│  ├─> XSS protection (React escaping)                    │
│  └─> HTTPS only (production)                            │
│                                                          │
│  Backend                                                │
│  ├─> CORS configuration                                 │
│  ├─> Request validation (class-validator)               │
│  ├─> Rate limiting (planned)                            │
│  ├─> API key authentication (planned)                   │
│  └─> SQL injection protection (TypeORM)                 │
│                                                          │
│  Database                                               │
│  ├─> Connection pooling                                 │
│  ├─> Prepared statements                                │
│  └─> Encrypted connections (production)                 │
│                                                          │
│  Smart Contracts                                        │
│  ├─> Owner-only functions                               │
│  ├─> Input validation                                   │
│  └─> Reentrancy protection                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────┐
│                    Production Setup                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Vercel/Netlify)                              │
│  ├─> CDN distribution                                   │
│  ├─> Edge caching                                       │
│  └─> Auto-scaling                                       │
│                                                          │
│  Backend (AWS/GCP/Azure)                                │
│  ├─> Load balancer                                      │
│  ├─> Multiple instances                                 │
│  ├─> Auto-scaling                                       │
│  └─> Health monitoring                                  │
│                                                          │
│  Database (Managed PostgreSQL)                          │
│  ├─> Automated backups                                  │
│  ├─> Read replicas                                      │
│  └─> Connection pooling                                 │
│                                                          │
│  Cache (Managed Redis)                                  │
│  ├─> High availability                                  │
│  ├─> Persistence                                        │
│  └─> Clustering                                         │
│                                                          │
│  Monitoring                                             │
│  ├─> Application logs                                   │
│  ├─> Performance metrics                                │
│  ├─> Error tracking                                     │
│  └─> Uptime monitoring                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

```
Frontend:
├─> Next.js 16 (React 19)
├─> TypeScript 5
├─> Tailwind CSS 4
├─> Stacks.js (Blockchain)
├─> Zustand (State)
├─> React Hook Form (Forms)
└─> Recharts (Charts)

Backend:
├─> NestJS 16
├─> TypeScript 5
├─> TypeORM (Database)
├─> Redis (Cache)
├─> Stacks.js (Blockchain)
├─> Swagger (Docs)
└─> Jest (Testing)

Smart Contracts:
├─> Clarity (Language)
├─> Clarinet (Testing)
└─> Stacks Blockchain

Infrastructure:
├─> PostgreSQL 14+
├─> Redis 6+
├─> Docker (Development)
└─> pnpm (Package Manager)
```
