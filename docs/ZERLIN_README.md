# Zerlin - STX Gas Calculator & Fee Estimator

> **Smart STX fee estimation for the Bitcoin DeFi era**

Zerlin is a real-time gas calculator and fee estimator for the Stacks blockchain that helps users understand exactly how much STX they need for transactions before they fail—eliminating friction and confusion in Bitcoin DeFi.

---

## 🎯 Problem Statement

**Pain Point:** One of the UX barriers for Bitcoin holders using sBTC is the requirement to hold and use STX for transaction fees. For a Bitcoin-native audience, the need to acquire and manage a separate token just to move BTC is unintuitive and adds friction during the onboarding step.

**Current Reality:**
- Users encounter failed transactions due to insufficient STX for gas
- No clear visibility into how much STX is needed for specific actions
- Fee estimation is technical and requires understanding of the Stacks API
- New users coming from Bitcoin don't understand STX fee mechanics

**Impact:**
- Failed transactions waste time and create frustration
- Users abandon Stacks apps due to poor onboarding experience
- Developers field constant support questions about gas fees

---

## 💡 Solution: Zerlin

Zerlin provides **instant, accurate STX fee estimates** for common Stacks operations with:

### Core Features
1. **Real-time Fee Estimation**
   - Shows current gas prices on Stacks network
   - Calculates exact STX needed for common actions
   - Updates dynamically as network conditions change

2. **Transaction Type Presets**
   - Token Transfer (STX/SIP-10 tokens)
   - Token Swap (DEX interactions)
   - NFT Minting (SIP-009)
   - Contract Deployment
   - Contract Calls (function execution)
   - sBTC Bridge operations

3. **Smart Balance Alerts**
   - "Refill alerts" when STX balance is too low
   - Suggested amount to add based on intended actions
   - Historical fee trends to optimize timing

4. **Embeddable Widget**
   - Drop-in component for wallets (Xverse, Leather, Hiro)
   - API for dApp integrations
   - White-label customization options

---

## 👥 User Flows

### Flow 1: Web App User (Direct Interaction)

```
┌─────────────────────────────────────────────────────────┐
│ User lands on zerlin.io                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Dashboard displays:                                     │
│ • Current network fee rate (e.g., "0.00018 STX")      │
│ • Network status (congestion indicator)                │
│ • Quick action buttons                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ User selects action type:                               │
│ [Token Transfer] [Swap] [Mint NFT] [Deploy Contract]  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Example: User clicks "Swap"                             │
│                                                          │
│ Form appears:                                           │
│ • Token pair selection (e.g., STX → sBTC)              │
│ • Amount input                                          │
│ • DEX selection (ALEX, Bitflow, Velar)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Zerlin calculates and displays:                         │
│                                                          │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Estimated Fee Breakdown                          │   │
│ │ ─────────────────────────────────                │   │
│ │ Base transaction fee:     0.00018 STX (~$0.0001) │   │
│ │ Contract call overhead:   0.00132 STX (~$0.0009) │   │
│ │ DEX router gas:           0.00245 STX (~$0.0016) │   │
│ │ ─────────────────────────────────                │   │
│ │ TOTAL ESTIMATE:          0.00395 STX (~$0.0026)  │   │
│ │                                                    │   │
│ │ 💡 Recommended STX balance: 0.01 STX              │   │
│ │    (includes buffer for 2-3 more swaps)           │   │
│ └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Optional: Connect Wallet                                │
│ • User connects Xverse/Leather/Hiro wallet             │
│ • Zerlin checks actual STX balance                      │
│ • Shows "✅ Sufficient" or "⚠️ Need 0.006 more STX"  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ User sees actionable result:                            │
│ • Copy fee estimate to clipboard                        │
│ • Export report (CSV/JSON)                              │
│ • Set up alerts for fee drops                           │
│ • Share embed code for this calculation                 │
└─────────────────────────────────────────────────────────┘
```

**Key Screens:**
1. **Landing Page** - Network overview + quick action selector
2. **Calculator Page** - Dynamic form based on transaction type
3. **Results Page** - Detailed breakdown with visual fee chart
4. **Alerts Dashboard** - Set notifications for optimal fee times
5. **History** - Past estimates and actual fees paid (if wallet connected)

---

### Flow 2: Wallet Integration User (Xverse Example)

```
┌─────────────────────────────────────────────────────────┐
│ User opens Xverse wallet                                │
│ Current balance: 5.2 STX                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ User navigates to "Swap" tab in Xverse                  │
│ • Selects STX → sBTC                                    │
│ • Enters 1 STX to swap                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 🎯 Zerlin Widget Activates (embedded in Xverse UI)     │
│                                                          │
│ Small panel appears above "Confirm Swap" button:        │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ⚡ Powered by Zerlin                             │   │
│ │ Estimated network fee: 0.00395 STX (~$0.0026)   │   │
│ │                                                    │   │
│ │ Your balance after swap:                          │   │
│ │ 4.196 STX (enough for ~250 more transactions)     │   │
│ │                                                    │   │
│ │ [View detailed breakdown ↗]                       │   │
│ └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ If balance too low:                                     │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ⚠️ Low STX Warning                               │   │
│ │ You have: 0.003 STX                               │   │
│ │ Need: 0.00395 STX                                 │   │
│ │ Missing: 0.00095 STX (~$0.0006)                   │   │
│ │                                                    │   │
│ │ [Get STX from exchange] [Ask for refill tips]    │   │
│ └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ User clicks "View detailed breakdown"                   │
│ → Opens Zerlin mini-app in Xverse in-app browser       │
│ → Shows full fee calculation + optimization tips        │
└─────────────────────────────────────────────────────────┘
```

**Wallet Integration Points:**
- **Widget SDK** for React/Vue/Svelte
- **JSON-RPC API** for fee estimation calls
- **WebSocket connection** for real-time updates
- **Deep linking** to Zerlin app for advanced features

---

### Flow 3: Developer/dApp Integration

```
┌─────────────────────────────────────────────────────────┐
│ Developer building a Stacks dApp                        │
│ (e.g., NFT minting platform)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ npm install @zerlin/sdk                                 │
│ import { ZerlinFeeEstimator } from '@zerlin/sdk'        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Code implementation:                                    │
│                                                          │
│ ```javascript                                           │
│ const zerlin = new ZerlinFeeEstimator({                │
│   apiKey: process.env.ZERLIN_API_KEY                   │
│ });                                                     │
│                                                          │
│ // Get fee estimate for NFT mint                        │
│ const estimate = await zerlin.estimate({                │
│   type: 'contract-call',                                │
│   contractAddress: 'SP2X0TZ59D5SZ8ACQ....',            │
│   contractName: 'my-nft-collection',                    │
│   functionName: 'mint',                                 │
│   functionArgs: [...]                                   │
│ });                                                     │
│                                                          │
│ console.log(estimate.totalFee); // 0.00395 STX         │
│ console.log(estimate.feeInUSD); // $0.0026             │
│ ```                                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ dApp UI displays fee before user confirms:              │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Mint Your NFT                                    │   │
│ │ ─────────────                                    │   │
│ │ Price: 0.05 STX                                  │   │
│ │ Network fee: 0.00395 STX (powered by Zerlin)    │   │
│ │ ─────────────                                    │   │
│ │ Total: 0.05395 STX (~$0.036)                     │   │
│ │                                                    │   │
│ │ [Mint Now]                                        │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Developer Benefits:**
- **Pre-transaction validation** - Check if user has enough STX
- **Dynamic fee updates** - Real-time as network congests/clears
- **Batch estimations** - Calculate fees for multiple actions
- **Historical analytics** - Optimize timing based on patterns

---

## 🔧 Technical Architecture

### Tech Stack

**Frontend (Web App)**
- **Framework:** Next.js 14 (React) with TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui components
- **Charts:** Recharts for fee visualization
- **State Management:** Zustand (lightweight, perfect for small apps)
- **Wallet Connection:** Stacks Connect SDK + Sats Connect (for Xverse)

**Backend (API)**
- **Runtime:** Node.js 20+
- **Framework:** Express.js (simple REST API)
- **Database:** PostgreSQL (for historical fee data)
- **Cache:** Redis (for real-time fee rates)
- **Cron Jobs:** node-cron (for periodic fee polling)

**Blockchain Integration**
- **Stacks.js:** Primary SDK for blockchain queries
- **Stacks API:** Hiro's public API endpoints
  - `/v2/fees/transfer` - Get current fee estimates
  - `/v2/info` - Network status
  - `/v2/accounts/{address}` - Balance checks
- **WebSocket:** For live network updates

**Widget/SDK**
- **Framework:** Vanilla JS (zero dependencies for portability)
- **Build:** Rollup.js for ES modules + UMD bundle
- **Size target:** < 15kb gzipped

**Infrastructure**
- **Hosting:** Vercel (frontend) + Railway (backend)
- **CDN:** Cloudflare (for widget delivery)
- **Monitoring:** Sentry (errors) + Plausible (analytics - privacy-first)

---

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                          │
├─────────────────┬─────────────────┬──────────────────────────────┤
│  Web App        │  Wallet Widget  │  Developer SDK               │
│  (Next.js)      │  (JS Bundle)    │  (@zerlin/sdk)               │
└────────┬────────┴────────┬────────┴──────────┬───────────────────┘
         │                  │                    │
         │                  │                    │
         ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ZERLIN API GATEWAY                            │
│                    (Express.js + Redis)                          │
├──────────────────────────────────────────────────────────────────┤
│  Endpoints:                                                      │
│  • POST /api/estimate - Calculate fee for given tx type         │
│  • GET  /api/network - Current network stats                    │
│  • GET  /api/history - Historical fee data                      │
│  • WS   /api/stream  - Real-time fee updates                    │
└────────┬───────────────────────────────┬───────────────────────┘
         │                                │
         ▼                                ▼
┌──────────────────────┐      ┌────────────────────────────┐
│  PostgreSQL DB       │      │  Redis Cache               │
│  ─────────────       │      │  ───────────               │
│  • fee_history       │      │  • current_fee_rate        │
│  • user_alerts       │      │  • network_status          │
│  • estimate_logs     │      │  • tx_templates (presets)  │
└──────────────────────┘      └────────────────────────────┘
         ▲                                ▲
         │                                │
         └────────────┬───────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Background Workers       │
         │   ─────────────────────    │
         │   • Fee Poller (10s)       │
         │     Queries Stacks API     │
         │   • Alert Dispatcher       │
         │     Sends notifications    │
         └───────────┬────────────────┘
                     │
                     ▼
         ┌────────────────────────────┐
         │   Stacks Blockchain        │
         │   ─────────────────        │
         │   Hiro API:                │
         │   • /v2/fees/transfer      │
         │   • /v2/info               │
         │   • /v2/contracts/call-read│
         └────────────────────────────┘
```

---

### Data Models

**Fee Estimate (API Response)**
```typescript
interface FeeEstimate {
  transactionType: 'transfer' | 'contract-call' | 'contract-deploy' | 'nft-mint' | 'swap';
  estimatedFee: {
    stx: string;        // "0.00395"
    usd: string;        // "0.0026"
    microStx: number;   // 3950
  };
  breakdown: {
    baseFee: number;         // Base transaction cost
    executionCost: number;   // Contract execution gas
    dataSize: number;        // Bytes * fee rate
  };
  networkStatus: {
    congestion: 'low' | 'medium' | 'high';
    averageFee: number;
    recommendedBuffer: number; // Extra STX to hold
  };
  timestamp: string;
  cached: boolean;
}
```

**Transaction Template (Internal)**
```typescript
interface TransactionTemplate {
  id: string;
  name: string;
  type: TransactionType;
  averageGasUnits: number;    // Empirically measured
  exampleContracts?: string[];
  description: string;
}
```

---

## 🏗️ Development Milestones

### Phase 1: MVP Core (Weeks 1-2) ✅ **FOR GRANT DEMO**

**Goal:** Working web app with basic fee estimation

**Deliverables:**
- ✅ Landing page with network status dashboard
- ✅ Fee calculator for 3 transaction types:
  - Token Transfer
  - Contract Call (generic)
  - NFT Mint
- ✅ Integration with Stacks API for live data
- ✅ Basic UI with Tailwind + shadcn/ui
- ✅ Deploy to Vercel for public demo

**Success Metrics:**
- Web app loads in < 2s
- Fee estimates accurate within 5% margin
- Supports Stacks mainnet + testnet toggle

**Tech Tasks:**
1. Set up Next.js project with TypeScript
2. Integrate Stacks.js SDK
3. Build API route: `/api/estimate`
4. Fetch live fee rates from `/v2/fees/transfer`
5. Create calculator UI with form validation
6. Display results with fee breakdown chart
7. Add "Copy Estimate" and "Export JSON" features

---

### Phase 2: Wallet Widget (Weeks 3-4)

**Goal:** Embeddable widget that wallets can integrate

**Deliverables:**
- ✅ Standalone JavaScript widget (< 15kb)
- ✅ Demo integration with Xverse (using Sats Connect API)
- ✅ Widget customization options (theme, position, size)
- ✅ NPM package published: `@zerlin/widget`
- ✅ Documentation site with integration guide

**Widget Features:**
- Automatically detects transaction type from wallet context
- Shows inline fee estimate before "Confirm" button
- "Learn more" link to Zerlin dashboard
- Configurable via data attributes:
  ```html
  <div 
    data-zerlin-widget
    data-theme="dark"
    data-position="bottom-right"
  ></div>
  ```

**Integration Examples:**
- Xverse (browser extension)
- Leather wallet
- Custom wallet implementations

---

### Phase 3: Developer SDK (Weeks 5-6)

**Goal:** npm package for dApp developers

**Deliverables:**
- ✅ `@zerlin/sdk` package on npm
- ✅ TypeScript types included
- ✅ API documentation (JSDoc)
- ✅ 5 example projects:
  - NFT minting site
  - DEX frontend
  - Token faucet
  - DAO voting interface
  - Multi-sig wallet

**SDK Features:**
```javascript
import { ZerlinFeeEstimator } from '@zerlin/sdk';

const zerlin = new ZerlinFeeEstimator({
  network: 'mainnet', // or 'testnet'
  apiKey: 'optional-for-higher-limits'
});

// Single estimate
const fee = await zerlin.estimate({
  type: 'contract-call',
  contractAddress: 'SP2X...',
  contractName: 'token-swap',
  functionName: 'swap-tokens',
  functionArgs: ['u1000000', '0x1234...']
});

// Batch estimation
const fees = await zerlin.estimateBatch([
  { type: 'transfer', amount: 100 },
  { type: 'nft-mint', contract: 'SP3X...' },
  { type: 'contract-call', ... }
]);

// Real-time stream
zerlin.onFeeUpdate((latestFee) => {
  console.log('Network fee changed:', latestFee);
});
```

---

### Phase 4: Advanced Features (Weeks 7-8)

**Goal:** Premium features for power users

**Deliverables:**
- ✅ Historical fee charts (30-day trends)
- ✅ Fee alerts system (email + push notifications)
- ✅ Batch calculator (estimate 10+ transactions at once)
- ✅ Gas optimization tips (e.g., "Wait 2 hours for 20% lower fees")
- ✅ sBTC-specific estimator (bridging fees)

**Alert System:**
- Users set target fee threshold (e.g., "notify when < 0.0002 STX")
- Background worker checks every 60 seconds
- Sends alerts via:
  - Email (SendGrid)
  - Browser push notifications (Web Push API)
  - Webhook (for advanced users)

**sBTC Bridge Estimator:**
- Separate calculator for sBTC peg-in/peg-out operations
- Includes Bitcoin network fees in estimation
- Shows "Total cost in BTC" + "Total cost in STX"

---

## 📊 Success Metrics & KPIs

### User Adoption
- **Week 1-2:** 100 unique visitors to web app
- **Month 1:** 1,000 fee estimates requested
- **Month 3:** 10,000 monthly active users
- **Month 6:** 3 wallet integrations live

### Technical Performance
- **API Uptime:** > 99.5%
- **Response time:** < 200ms for fee estimates
- **Accuracy:** Fee estimates within 5% of actual fees paid

### Community Impact
- **GitHub stars:** 50+ (open-source widget)
- **Developer integrations:** 10+ dApps using SDK
- **Grant milestone:** Accepted into Stacks Ascent or Foundation grant program

---

## 💰 Grant Application Strategy

### Target Programs
1. **Stacks Foundation Grants** (Priority)
   - Category: Infrastructure/Tooling
   - Ask: $25,000
   - Timeline: 8 weeks

2. **Stacks Ascent Accelerator**
   - Investment: $50,000 (no valuation cap)
   - Equity: 5-7%
   - Benefits: Mentorship + network access

3. **Bitcoin Frontier Fund**
   - Focus: Bitcoin DeFi UX improvements
   - Ask: $30,000
   - Timeline: 12 weeks

### Grant Proposal Outline

**Problem Statement:**
> "Bitcoin holders entering Stacks DeFi face a critical UX barrier: managing STX for gas fees. This friction causes failed transactions and user drop-off, directly impacting ecosystem growth."

**Solution:**
> "Zerlin eliminates fee uncertainty with real-time STX gas estimation, embeddable widgets for wallets, and a developer SDK—making Stacks accessible to Bitcoin-native users."

**Roadmap Alignment:**
- **sBTC UX Priority:** Zerlin directly addresses the documented pain point of STX fee confusion for sBTC users
- **Institutional Onboarding:** Fee transparency tool reduces operational friction for institutions
- **Developer Experience:** SDK enables all Stacks dApps to provide better pre-transaction clarity

**Differentiation:**
- **First** dedicated fee estimator for Stacks (no equivalent exists)
- **Embeddable** (wallets can integrate without redirecting users)
- **Open-source** widget (community can fork/extend)
- **Free tier** for developers (align with ecosystem growth goals)

**Traction Plan:**
- Week 1-2: MVP deployed, showcase at Stacks DevRel office hours
- Week 3-4: Reach out to Xverse, Leather, Hiro for widget pilots
- Week 5-6: SDK docs published, 3 example dApps live
- Week 7-8: Analytics dashboard showing 1,000+ estimates served

**Budget Breakdown:**
- Development: $15,000 (160 hours @ $94/hr)
- Infrastructure: $2,000 (hosting + APIs for 6 months)
- Design: $3,000 (UI/UX + branding)
- Marketing: $3,000 (docs site, demo videos, conference presence)
- Buffer: $2,000

**Long-term Sustainability:**
- **Free tier:** Unlimited use for < 1,000 estimates/day
- **Pro tier:** $49/month for dApps with > 10,000 estimates/month
- **Enterprise:** Custom pricing for wallets/exchanges (white-label)
- **Future:** Premium features (alerts, analytics, portfolio tracking)

---

## 🔌 Wallet Integration: Xverse Deep Dive

### Why Xverse?

Sats Connect lets your app connect directly to users' wallets. The Xverse API gives you plug-and-play access to Bitcoin data and infrastructure.

Xverse has **~2 million users** and is the most popular Bitcoin + Stacks wallet. Integrating with Xverse first provides:
- Largest user base for immediate impact
- Developer-friendly APIs (Sats Connect + WalletConnect)
- Active team receptive to ecosystem tooling

### Technical Integration Points

**1. Browser Extension Widget**
```javascript
// Zerlin widget injected into Xverse UI
window.addEventListener('XverseProviders:detected', async () => {
  const xverse = window.XverseProviders?.StacksProvider;
  
  // Intercept transaction before broadcast
  xverse.on('transaction:preview', async (txData) => {
    const estimate = await fetch('https://api.zerlin.io/estimate', {
      method: 'POST',
      body: JSON.stringify({
        type: txData.txType,
        payload: txData.payload
      })
    });
    
    // Inject fee widget into Xverse confirmation modal
    injectZerlinWidget(estimate.data);
  });
});
```

**2. In-App Browser (Mobile)**
- Xverse mobile has built-in browser for dApps
- Zerlin deep links: `xverse://browser?url=https://zerlin.io/estimate?tx=...`
- Widget appears in bottom sheet overlay

**3. WalletConnect Integration**
The API strives to be as similar to the native Stacks API as possible. Looking into Stacks Connect should give you a good idea on how to create any other calls yourself.

```javascript
// WalletConnect session established
const session = await client.connect({
  requiredNamespaces: {
    stacks: {
      methods: ['stacks_contractCall', 'stacks_stxTransfer'],
      chains: ['stacks:mainnet'],
      events: []
    }
  }
});

// Zerlin middleware intercepts before signing
session.on('session_request', async (event) => {
  const feeEstimate = await zerlin.estimate(event.params);
  // Show Zerlin modal with estimate before approving
});
```

### Implementation Phases

**Phase 1: Prototype (Week 3)**
- Build standalone widget demo
- Test in local Xverse development build
- Get feedback from Xverse team

**Phase 2: Pilot (Week 4)**
- Xverse adds Zerlin as "Experimental Feature" toggle
- Collect usage data from 100 beta testers
- Iterate based on feedback

**Phase 3: Production (Week 6)**
- Full integration in Xverse stable release
- Widget enabled by default for all users
- Announcement blog post + Twitter thread

---

## 📖 README Structure (for GitHub Repo)

```markdown
# Zerlin - STX Gas Calculator

**Real-time fee estimation for Stacks blockchain**

[Website](https://zerlin.io) • [Docs](https://docs.zerlin.io) • [SDK](https://www.npmjs.com/package/@zerlin/sdk) • [Widget Demo](https://zerlin.io/demo)

## Quick Start

### For Users
Visit [zerlin.io](https://zerlin.io) and select your transaction type to get instant fee estimates.

### For Developers
```bash
npm install @zerlin/sdk
```

```javascript
import { ZerlinFeeEstimator } from '@zerlin/sdk';

const zerlin = new ZerlinFeeEstimator();
const fee = await zerlin.estimate({ type: 'transfer', amount: 100 });
console.log(fee.stx); // "0.00018"
```

### For Wallets
Embed the Zerlin widget:
```html
<script src="https://cdn.zerlin.io/widget.js"></script>
<div data-zerlin-widget data-theme="dark"></div>
```

## Features
- ⚡ Real-time STX fee estimation
- 📊 Historical fee trends
- 🔔 Low-fee alerts
- 🧩 Embeddable widget
- 🛠️ Developer SDK
- 🌐 Mainnet + Testnet support

## Why Zerlin?
Stacks users need to hold STX for transaction fees, but understanding how much STX to keep is non-obvious. Zerlin removes this friction by providing clear, accurate fee estimates before transactions are submitted.

## Tech Stack
- **Frontend:** Next.js + TypeScript + Tailwind
- **Backend:** Node.js + Express + Redis
- **Blockchain:** Stacks.js + Hiro API
- **Database:** PostgreSQL

## Contributing
We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License
MIT License - see [LICENSE](./LICENSE)

## Support
- [Discord](https://discord.gg/zerlin)
- [Twitter](https://twitter.com/zerlin_io)
- Email: team@zerlin.io

## Acknowledgments
Built with support from the Stacks Foundation and the Stacks community.
```

---

## 🎨 Brand Identity

### Name Rationale: "Zerlin"
- **"Zero"** → Zero confusion about fees
- **"Lin"** → Linear, straightforward estimation
- Phonetically clear and memorable
- .io domain available ✅

### Visual Identity
- **Primary Color:** Electric blue (#00B4FF) - Represents trust, tech, clarity
- **Secondary Color:** Bitcoin orange (#F7931A) - Nods to Bitcoin heritage
- **Accent:** Green (#00D084) - "Good to go" confirmation color

### Logo Concept
```
   ⚡
  / | \
 /  |  \
 ___Z___  ERLIN
```
Lightning bolt (speed) + letter Z (zero confusion)

### Tagline Options
1. "Stop guessing. Start transacting."
2. "Know your fees before you pay them."
3. "Smart STX fee estimation for Bitcoin DeFi."

---

## 🚀 Go-to-Market Strategy

### Week 1-2 (MVP Launch)
- **Soft launch** on Twitter with demo video
- Post in Stacks Discord #build-on-stacks channel
- Submit to Stacks DevRel office hours for live walkthrough
- Product Hunt soft launch (< 100 upvotes expected)

### Week 3-4 (Widget Beta)
- **Direct outreach** to Xverse, Leather, Hiro teams
- Offer free pilot integration with usage analytics
- Create integration guide specifically for each wallet
- Guest post on Hiro blog: "Reducing Failed Transactions on Stacks"

### Week 5-6 (Developer Adoption)
- Publish **5 example dApps** using Zerlin SDK
- Tutorial blog series: "Building DeFi UX Right"
- Sponsor Stacks Clarity Working Group session
- Launch #ZerlinIntegrated badge for dApps

### Week 7-8 (Traction Proof)
- **Analytics dashboard** showing 10,000+ estimates served
- Case study: "How [Popular Stacks dApp] Reduced Support Tickets by 40%"
- Product Hunt official launch (target: Top 5 of the day)
- Grant application submitted with traction data

### Month 3+ (Growth)
- Conference presence: ETHDenver, Bitcoin Nashville
- YouTube tutorial series for developers
- Launch Pro tier with advanced features
- Partnership with Stacks Foundation for official "Recommended Tooling" badge

---

## 📞 Contact & Links

**Website:** [zerlin.io](https://zerlin.io) (to be registered)  
**GitHub:** [github.com/zerlin-io/zerlin](https://github.com/zerlin-io/zerlin) (repo to be created)  
**Twitter:** [@zerlin_io](https://twitter.com/zerlin_io) (handle to be claimed)  
**Email:** team@zerlin.io  
**Discord:** Stacks Discord - @zerlin  

**Maintainer:** [Your Name]  
**Built for:** Stacks Builder Rewards Program & Grant Applications  
**Timeline:** February 2026 - April 2026  
**Status:** Pre-MVP - Seeking Funding 🚀

---

## 🙏 Acknowledgments

This project is inspired by:
- Fees are calculated based on the estimate fee rate and the size of the raw transaction in bytes. The fee rate is a market determined variable.
- The documented UX friction for Bitcoin users entering Stacks
- The Stacks community's commitment to improving developer experience

Special thanks to:
- Stacks Foundation for ecosystem support
- Xverse team for wallet integration APIs
- Hiro for public Stacks API infrastructure
- Clarity Working Group for smart contract insights

---

**Built with ❤️ for the Bitcoin DeFi revolution**

*Last updated: February 2026*
