# Contract Interaction Guide

This guide provides sample calldata and instructions for interacting with the Zerlin smart contracts.

## Prerequisites

- Stacks Wallet (Leather, Xverse) or `cibt` (Clarinet console)
- Stacks CLI or `@stacks/transactions` JS library

## 1. Fee Oracle (`fee-oracle-v1`)

Central source of truth for fee rates.

### Read Functions

#### `get-current-fee-rate`
Returns the current fee rate in microSTX per byte.

**Clarinet Console:**
```clarity
(contract-call? .fee-oracle-v1 get-current-fee-rate)
```

**JavaScript (@stacks/transactions):**
```typescript
import { callReadOnlyFunction, cvToJSON } from '@stacks/transactions';

const result = await callReadOnlyFunction({
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'fee-oracle-v1',
  functionName: 'get-current-fee-rate',
  functionArgs: [],
  network: new StacksTestnet(),
  senderAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
});
console.log(cvToJSON(result));
```

#### `estimate-transfer-fee`
Returns estimated fee for a standard STX transfer.

**Clarinet Console:**
```clarity
(contract-call? .fee-oracle-v1 estimate-transfer-fee)
```

### Write Functions

#### `update-fee-rate` (Owner Only)
Updates the fee rate.

**Clarinet Console:**
```clarity
(contract-call? .fee-oracle-v1 update-fee-rate u150 "medium")
```

---

## 2. Smart Alerts (`smart-alerts-v1`)

Manage user fee alerts.

### Read Functions

#### `get-alert-stats`
Returns global alert statistics.

**Clarinet Console:**
```clarity
(contract-call? .smart-alerts-v1 get-alert-stats)
```

#### `should-alert-trigger`
Checks if a specific alert should trigger given a current fee.

**Clarinet Console:**
```clarity
(contract-call? .smart-alerts-v1 should-alert-trigger tx-sender u1 u200)
```

### Write Functions

#### `create-alert`
Creates a new alert.

Parameters:
- `target-fee`: uint (microSTX)
- `alert-type`: string ("above" or "below")
- `tx-type`: string (e.g., "transfer")

**Clarinet Console:**
```clarity
(contract-call? .smart-alerts-v1 create-alert u500 "below" "transfer")
```

**JavaScript:**
```typescript
import { makeContractCall, uintCV, stringAsciiCV } from '@stacks/transactions';

const txOptions = {
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'smart-alerts-v1',
  functionName: 'create-alert',
  functionArgs: [
    uintCV(500),
    stringAsciiCV("below"),
    stringAsciiCV("transfer")
  ],
  // ... network and senderKey
};
// broadcast transaction
```

---

## 3. Transaction Templates (`tx-templates-v1`)

Storage for gas cost templates.

### Read Functions

#### `get-template`
Get details for a template ID.

**Clarinet Console:**
```clarity
(contract-call? .tx-templates-v1 get-template "stx-transfer")
```

#### `get-full-estimate`
Get full fee estimate for a template.

**Clarinet Console:**
```clarity
(contract-call? .tx-templates-v1 get-full-estimate "sbtc-peg-in")
```

#### IDs for Reference:
- `stx-transfer`
- `ft-transfer`
- `nft-mint`
- `sbtc-peg-in`
- `dex-swap-alex`
