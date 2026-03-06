# ✅ Zerlin Verification Checklist

Use this checklist to verify that everything is working correctly.

## 🚀 Initial Setup

- [ ] Docker is installed and running
- [ ] Node.js 18+ is installed
- [ ] pnpm is installed
- [ ] All scripts are executable (`chmod +x *.sh`)

## 📦 Services Status

### Database Services
- [ ] PostgreSQL container is running
  ```bash
  docker ps | grep postgres
  ```
- [ ] Redis container is running
  ```bash
  docker ps | grep redis
  ```
- [ ] Can connect to PostgreSQL
  ```bash
  docker exec -it zerlin-postgres psql -U zerlin -d zerlin -c "SELECT 1"
  ```
- [ ] Can connect to Redis
  ```bash
  redis-cli ping
  # Should return: PONG
  ```

### Backend Service
- [ ] Backend starts without errors
  ```bash
  cd backend && pnpm start:dev
  ```
- [ ] Backend is accessible
  ```bash
  curl http://localhost:3000/health
  ```
- [ ] Swagger docs are accessible
  - Open: http://localhost:3000/api
- [ ] Health check shows all services "up"
  ```bash
  curl http://localhost:3000/health | jq
  ```

### Frontend Service
- [ ] Frontend starts without errors
  ```bash
  cd frontend && pnpm dev
  ```
- [ ] Frontend is accessible
  - Open: http://localhost:3001
- [ ] No console errors in browser
- [ ] Page loads completely

## 🔌 API Endpoints

### Health Endpoint
- [ ] Health check returns 200
  ```bash
  curl -w "\n%{http_code}\n" http://localhost:3000/health
  ```
- [ ] All services show "up" status
  ```bash
  curl http://localhost:3000/health | jq '.services'
  ```

### Fee Estimation Endpoint
- [ ] Transfer estimation works
  ```bash
  curl -X POST http://localhost:3000/api/estimate \
    -H "Content-Type: application/json" \
    -d '{"type": "transfer"}' | jq
  ```
- [ ] Contract call estimation works
  ```bash
  curl -X POST http://localhost:3000/api/estimate \
    -H "Content-Type: application/json" \
    -d '{"type": "contract-call"}' | jq
  ```
- [ ] NFT mint estimation works
  ```bash
  curl -X POST http://localhost:3000/api/estimate \
    -H "Content-Type: application/json" \
    -d '{"type": "nft-mint"}' | jq
  ```
- [ ] Swap estimation works
  ```bash
  curl -X POST http://localhost:3000/api/estimate \
    -H "Content-Type: application/json" \
    -d '{"type": "swap"}' | jq
  ```
- [ ] Contract deploy estimation works
  ```bash
  curl -X POST http://localhost:3000/api/estimate \
    -H "Content-Type: application/json" \
    -d '{"type": "contract-deploy"}' | jq
  ```

### Network Status Endpoint
- [ ] Network status returns data
  ```bash
  curl http://localhost:3000/api/network | jq
  ```
- [ ] Congestion level is present
  ```bash
  curl http://localhost:3000/api/network | jq '.congestionLevel'
  ```
- [ ] Block height is present
  ```bash
  curl http://localhost:3000/api/network | jq '.blockHeight'
  ```

### History Endpoint
- [ ] History endpoint returns array
  ```bash
  curl http://localhost:3000/api/history | jq 'length'
  ```

## 💰 Price Integration

- [ ] USD conversion is not $0.00
  ```bash
  curl -X POST http://localhost:3000/api/estimate \
    -H "Content-Type: application/json" \
    -d '{"type": "transfer"}' | jq '.estimatedFee.usd'
  ```
- [ ] BTC conversion is not 0
  ```bash
  curl -X POST http://localhost:3000/api/estimate \
    -H "Content-Type: application/json" \
    -d '{"type": "transfer"}' | jq '.estimatedFee.btc'
  ```
- [ ] Price data is cached in Redis
  ```bash
  redis-cli GET stx_price
  ```

## 🎨 Frontend Functionality

### Page Load
- [ ] Home page loads without errors
- [ ] Navigation bar is visible
- [ ] Footer is visible
- [ ] Background animation is working
- [ ] Network status indicator is visible

### Fee Calculator
- [ ] Transaction type selector is visible
- [ ] Can select different transaction types
- [ ] Calculate button is visible and clickable
- [ ] Loading state appears when calculating
- [ ] Results display after calculation
- [ ] Fee breakdown is shown
- [ ] Network status is shown in results
- [ ] Toast notification appears on success
- [ ] Error message appears on failure

### Network Status
- [ ] Network status updates automatically
- [ ] Congestion level is displayed
- [ ] Color coding works (green/yellow/red)
- [ ] Updates every 30 seconds

### Error Handling
- [ ] Error toast appears on API failure
- [ ] Error message is user-friendly
- [ ] Can retry after error
- [ ] Loading state clears on error

## 🔄 Caching

### Redis Caching
- [ ] Network status is cached
  ```bash
  redis-cli GET network_status
  ```
- [ ] Price data is cached
  ```bash
  redis-cli GET stx_price
  ```
- [ ] Cache expires correctly (wait 60s and check)
  ```bash
  redis-cli TTL stx_price
  ```

### Database Persistence
- [ ] Fee estimates are saved to database
  ```bash
  docker exec -it zerlin-postgres psql -U zerlin -d zerlin \
    -c "SELECT COUNT(*) FROM fee_estimate;"
  ```
- [ ] Can query historical data
  ```bash
  curl http://localhost:3000/api/history | jq 'length'
  ```

## 🔗 Smart Contract Integration

### Fee Oracle Contract
- [ ] Can read current fee rate
  ```bash
  # Check backend logs for contract calls
  tail -f backend.log | grep "fee-oracle"
  ```
- [ ] Contract calls succeed
- [ ] Fee estimates are returned

### Contract Addresses
- [ ] Backend has correct contract address
  ```bash
  grep CONTRACT_ADDRESS_DEPLOYER backend/.env
  ```
- [ ] Frontend has correct contract addresses
  ```bash
  grep NEXT_PUBLIC_FEE_ORACLE_ADDRESS frontend/.env.local
  ```

## 📊 Performance

### Response Times
- [ ] Health check < 100ms
  ```bash
  curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/health
  ```
- [ ] Cached fee estimate < 300ms
- [ ] Uncached fee estimate < 1000ms
- [ ] Network status < 500ms

### Caching Effectiveness
- [ ] First request is slower
- [ ] Second request (within TTL) is faster
- [ ] Cache hit rate > 50%

## 🐛 Error Scenarios

### Backend Errors
- [ ] Invalid transaction type returns 400
  ```bash
  curl -X POST http://localhost:3000/api/estimate \
    -H "Content-Type: application/json" \
    -d '{"type": "invalid"}' -w "\n%{http_code}\n"
  ```
- [ ] Missing body returns 400
  ```bash
  curl -X POST http://localhost:3000/api/estimate \
    -H "Content-Type: application/json" -w "\n%{http_code}\n"
  ```

### Frontend Errors
- [ ] Network error shows error message
  - Stop backend and try to calculate
- [ ] Invalid response shows error message
- [ ] Timeout shows error message

## 📝 Logging

### Backend Logs
- [ ] Logs are being written
  ```bash
  tail -f backend.log
  ```
- [ ] No error messages (except expected)
- [ ] Request/response logging works
- [ ] Error stack traces are present

### Frontend Logs
- [ ] Logs are being written
  ```bash
  tail -f frontend.log
  ```
- [ ] No error messages (except expected)
- [ ] Build warnings are minimal

## 🔒 Security

### CORS
- [ ] CORS is configured
  ```bash
  curl -H "Origin: http://localhost:3001" \
    -H "Access-Control-Request-Method: POST" \
    -X OPTIONS http://localhost:3000/api/estimate -v
  ```
- [ ] Only allowed origins can access

### Input Validation
- [ ] Invalid JSON returns 400
- [ ] Missing required fields returns 400
- [ ] SQL injection attempts are blocked

## 📚 Documentation

### API Documentation
- [ ] Swagger UI is accessible
  - Open: http://localhost:3000/api
- [ ] All endpoints are documented
- [ ] Can test endpoints from Swagger
- [ ] Request/response schemas are shown

### Project Documentation
- [ ] README_COMPLETE.md exists and is complete
- [ ] SETUP.md exists and is complete
- [ ] QUICK_START.md exists and is complete
- [ ] ARCHITECTURE.md exists and is complete
- [ ] OPTIMIZATION_SUMMARY.md exists and is complete
- [ ] INTEGRATION_COMPLETE.md exists and is complete

## 🎯 User Flows

### Basic Fee Calculation Flow
1. [ ] User opens http://localhost:3001
2. [ ] User sees fee calculator
3. [ ] User selects "Transfer"
4. [ ] User clicks "Calculate Fee"
5. [ ] Loading spinner appears
6. [ ] Results display with:
   - [ ] STX amount
   - [ ] USD amount
   - [ ] BTC amount
   - [ ] Fee breakdown
   - [ ] Network status
7. [ ] Toast notification appears
8. [ ] Can calculate again with different type

### Network Monitoring Flow
1. [ ] User opens http://localhost:3001
2. [ ] Network status shows current congestion
3. [ ] Wait 30 seconds
4. [ ] Network status updates automatically
5. [ ] Congestion level may change

## 🚀 Startup Scripts

### Start Script
- [ ] `./start-dev.sh` runs without errors
- [ ] All services start automatically
- [ ] Success message is displayed
- [ ] URLs are shown
- [ ] PID files are created

### Stop Script
- [ ] `./stop-dev.sh` runs without errors
- [ ] All services stop
- [ ] Docker containers stop
- [ ] PID files are removed
- [ ] Log files are cleaned up

## 🔄 Restart Capability

- [ ] Can stop and start multiple times
- [ ] Data persists across restarts
- [ ] No port conflicts on restart
- [ ] Cache is cleared on restart

## 📈 Monitoring

### Health Monitoring
- [ ] Health endpoint always responds
- [ ] Health check includes all services
- [ ] Unhealthy services are detected
- [ ] Health status is accurate

### Performance Monitoring
- [ ] Response times are logged
- [ ] Slow queries are identified
- [ ] Cache hit rates are tracked
- [ ] Error rates are monitored

## ✅ Final Verification

### All Systems Go
- [ ] All services are running
- [ ] All endpoints respond correctly
- [ ] Frontend displays correctly
- [ ] Calculations are accurate
- [ ] Prices are real-time
- [ ] Caching works
- [ ] Errors are handled
- [ ] Documentation is complete

### Ready for Development
- [ ] Can make code changes
- [ ] Hot reload works (frontend)
- [ ] Auto-restart works (backend)
- [ ] Can debug easily
- [ ] Logs are helpful

### Ready for Testing
- [ ] All features work
- [ ] No critical bugs
- [ ] Performance is acceptable
- [ ] User experience is smooth
- [ ] Error messages are clear

## 🎉 Success Criteria

All checkboxes above should be checked (✅) for the integration to be considered complete and successful.

## 📞 If Something Fails

1. Check the specific section that failed
2. Review logs: `tail -f backend.log` or `tail -f frontend.log`
3. Check health endpoint: `curl http://localhost:3000/health`
4. Restart services: `./stop-dev.sh && ./start-dev.sh`
5. Review documentation: SETUP.md, TROUBLESHOOTING section
6. Check Docker: `docker ps` and `docker logs`

---

**Once all items are checked, your Zerlin integration is complete! 🎊**
