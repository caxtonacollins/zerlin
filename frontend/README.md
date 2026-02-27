# Zerlin Frontend

Real-time STX gas calculator and fee estimator for the Stacks blockchain.

## 🚀 Features

- ⚡ **Real-time Fee Estimation** - Instant STX gas calculations
- 📊 **Historical Charts** - Track fee trends over time
- 🔔 **Smart Alerts** - Get notified when fees drop
- 💼 **Dashboard** - Manage alerts and view stats
- 🌐 **Multi-page App** - Calculator, Dashboard, History, Docs
- 🎨 **Bitcoin-native Design** - Orange/purple theme with glassmorphism
- 📱 **Fully Responsive** - Mobile-first design
- ♿ **Accessible** - WCAG compliant components

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** Custom atomic design system
- **Forms:** React Hook Form + Zod
- **Animation:** Framer Motion
- **Charts:** Recharts
- **State:** Zustand
- **Blockchain:** Stacks.js

## 📦 Installation

```bash
pnpm install
cp .env.example .env.local
```

## 🚀 Development

```bash
pnpm dev
# Open http://localhost:3000
```

## 🏗 Build

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
src/
├── app/                    # Pages (home, dashboard, history, docs)
├── components/
│   ├── atoms/             # Button, Input, Badge, Skeleton, Spinner
│   ├── molecules/         # FeeDisplay, NetworkStatus, WalletConnect
│   └── organisms/         # FeeCalculator, Navigation, Footer, Charts
├── hooks/                 # useCurrentFee, useEstimate, useWallet
├── lib/                   # API client, formatters, utilities
├── store/                 # Zustand stores (fee, wallet)
└── types/                 # TypeScript definitions
```

## 📄 License

MIT License
