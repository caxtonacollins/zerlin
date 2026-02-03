# Zerlin - STX Gas Calculator
**Real-time fee estimation for Stacks blockchain**
[Website](https://zerlin.io) • [Docs](https://docs.zerlin.io) • [SDK](https://www.npmjs.com/package/@zerlin/sdk) • [Widget D
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
```
## Features
⚡ Real-time STX fee estimation
- Historical fee trends
- Low-fee alerts
- Embeddable widget
- Developer SDK
- Mainnet + Testnet support
-
## Why Zerlin?
Stacks users need to hold STX for transaction fees, but understanding how much STX to keep is non-obvious. Zerlin removes
## Tech Stack
- **Frontend:** Next.js + TypeScript + Tailwind
- **Backend:** Node.js + Nestjs + Redis
- **Blockchain:** Stacks.js + Hiro API
- **Database:** PostgreSQL## Contributing
We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md).
## License
MIT License - see [LICENSE](./LICENSE)
## Support
- [Discord](https://discord.gg/zerlin)
- [Twitter](https://twitter.com/zerlin_io)
- Email: team@zerlin.io
## Acknowledgments
Built with support from the Stacks Foundation and the Stacks community.
