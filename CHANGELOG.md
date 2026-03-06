# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-03-06

### Added
- Complete frontend-backend integration
- Real-time fee estimation for 5 transaction types
- USD/BTC price conversion via CoinGecko API
- Network status monitoring with auto-refresh
- Redis caching for performance optimization
- Health check endpoint for system monitoring
- Comprehensive documentation (11 files)
- Automated startup/shutdown scripts
- Toast notifications for user feedback
- Error handling and loading states

### Changed
- Enhanced API client with better error handling
- Optimized fee service with price integration
- Updated navigation component styling
- Configured dev server to run on port 3001

### Fixed
- Price conversions now show real values (not $0.00)
- Network status updates automatically
- Frontend properly connects to backend

### Documentation
- Added complete project README
- Added quick start guide
- Added setup instructions
- Added architecture documentation
- Added verification checklist
- Added optimization summary
- Added integration completion guide

## [0.1.0] - Initial Release

### Added
- Smart contracts (fee-oracle, tx-templates, smart-alerts)
- NestJS backend with TypeORM and Redis
- Next.js frontend with Tailwind CSS
- Basic fee estimation functionality
