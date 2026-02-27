- Well-documented

**Alternatives Considered:**
- dinero.js: Overkill (designed for financial calculations, we just need display)
- Intl.NumberFormat: Native but less convenient API

**Installation:**
```bash
pnpm add numeral @types/numeral
```

---

## Toast Notifications

### Decision: **react-hot-toast**

**Rationale:**
- Lightweight (3.5KB gzipped)
- Beautiful default styling (matches our aesthetic)
- Fully customizable
- Promise-based API (perfect for async operations)
- Accessible (ARIA live regions)
- Works great with Tailwind CSS
- Smooth animations out of the box

**Alternatives Considered:**
- react-toastify: Heavier, less modern API
- sonner: Newer, less proven

**Installation:**
```bash
pnpm add react-hot-toast
```

---

## State Management

### Decision: **Zustand**

**Rationale:**
- Minimal boilerplate (no providers, no context)
- Tiny bundle (1KB gzipped)
- Simple API - just hooks
- Perfect for our needs:
  - Fee calculator state
  - Alert management
  - Wallet connection state
- No unnecessary re-renders
- Great TypeScript support
- Can be used outside React components
- Middleware support (persist, devtools)

**Alternatives Considered:**
- Redux Toolkit: Overkill for our app size, more boilerplate
- Jotai/Recoil: Atomic state is unnecessary complexity for our use case
- Context API: Would work but Zustand is more ergonomic

**Installation:**
```bash
pnpm add zustand
```

---

## Blockchain Integration

### Decision: **@stacks/connect** + **@stacks/transactions** + **@stacks/network**

**Rationale:**
- Official Stacks.js libraries
- Required for wallet integration (Xverse, Leather, Hiro)
- Contract read/write operations
- Network configuration (mainnet/testnet)
- Well-documented
- Active maintenance by Stacks Foundation

**Installation:**
```bash
pnpm add @stacks/connect @stacks/transactions @stacks/network
```

---

## Summary Table

| Category | Library | Bundle Size | Rationale |
|----------|---------|-------------|-----------|
| UI Components | shadcn/ui + Radix UI | 0KB (copy-paste) | Accessible, customizable, Tailwind-native |
| Forms | React Hook Form | ~9KB | Performance, minimal re-renders |
| Validation | Zod | ~8KB | TypeScript-first, type inference |
| Animation | Framer Motion | ~30KB | Declarative, React-native, gestures |
| Charts | Recharts | ~50KB | React-native, composable, SVG |
| Class Utils | clsx + tailwind-merge | <1KB | Conditional classes, conflict resolution |
| Dates | date-fns | ~10KB (tree-shaken) | Modular, immutable, TypeScript |
| Numbers | numeral | ~5KB | Simple formatting API |
| Toasts | react-hot-toast | ~3.5KB | Lightweight, beautiful, accessible |
| State | Zustand | ~1KB | Minimal, no boilerplate |
| Blockchain | Stacks.js | ~100KB | Official, required for Stacks |

**Total Estimated Bundle:** ~220KB (gzipped, excluding Next.js framework)

---

## Next Steps

1. Initialize Next.js project with TypeScript
2. Install Tailwind CSS
3. Run `npx shadcn@latest init` to set up component system
4. Install all libraries listed above
5. Configure Tailwind with custom colors (Bitcoin orange, Stacks purple)
6. Set up folder structure (atoms, molecules, organisms)
7. Begin component development

---

**Document Version:** 1.0  
**Last Updated:** February 27, 2026  
**Author:** Zerlin Development Team
