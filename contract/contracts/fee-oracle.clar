;; ============================================
;; CONTRACT #1: ZERLIN FEE ORACLE
;; ============================================
;; Main contract that stores canonical fee data for the Stacks network
;; This is the source of truth for current and historical gas prices
;; Other contracts and dApps can read from this oracle

;; Contract identifier for cross-contract calls
;; After deployment, this will be something like: SP123...ABC.zerlin-fee-oracle

;; ============================================
;; ERROR CODES
;; ============================================
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-INVALID-FEE (err u101))
(define-constant ERR-INVALID-BLOCK (err u102))
(define-constant ERR-ALREADY-INITIALIZED (err u103))
(define-constant ERR-NOT-INITIALIZED (err u104))

;; ============================================
;; DATA VARIABLES
;; ============================================
(define-data-var contract-owner principal tx-sender)
(define-data-var is-initialized bool false)
(define-data-var latest-fee-rate uint u0)
(define-data-var latest-update-block uint u0)
(define-data-var total-updates uint u0)

;; Authorized oracle addresses (for multi-oracle setup in future)
(define-map authorized-oracles principal bool)

;; ============================================
;; DATA MAPS
;; ============================================

;; Historical fee data indexed by block height
(define-map fee-history
  { block-height: uint }
  {
    fee-rate: uint,                    ;; Fee rate in microSTX per byte
    timestamp: uint,                   ;; Bitcoin block height (burn-block-height)
    network-congestion: (string-ascii 10), ;; "low", "medium", "high"
    recorded-by: principal             ;; Oracle that submitted this data
  }
)

;; Rolling average fees for transaction types (populated by observation)
(define-map transaction-averages
  { tx-type: (string-ascii 30) }
  { 
    avg-fee: uint,                     ;; Average fee in microSTX
    sample-count: uint,                ;; Number of samples used
    last-updated: uint                 ;; Block height of last update
  }
)

;; Fee statistics for analysis
(define-map daily-stats
  { day: uint }                        ;; Days since epoch
  {
    min-fee: uint,
    max-fee: uint,
    avg-fee: uint,
    sample-count: uint
  }
)

;; ============================================
;; INITIALIZATION
;; ============================================

;; Initialize the contract with first fee reading
(define-public (initialize (initial-fee-rate uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (asserts! (not (var-get is-initialized)) ERR-ALREADY-INITIALIZED)
    (asserts! (> initial-fee-rate u0) ERR-INVALID-FEE)
    
    (var-set latest-fee-rate initial-fee-rate)
    (var-set latest-update-block stacks-block-height)
    (var-set is-initialized true)
    (var-set total-updates u1)
    
    ;; Record first historical entry
    (map-set fee-history
      { block-height: stacks-block-height }
      {
        fee-rate: initial-fee-rate,
        timestamp: burn-block-height,
        network-congestion: "medium",
        recorded-by: tx-sender
      }
    )
    
    ;; Authorize contract owner as oracle
    (map-set authorized-oracles tx-sender true)
    
    (print { event: "oracle-initialized", fee-rate: initial-fee-rate })
    (ok true)
  )
)

;; ============================================
;; READ-ONLY FUNCTIONS (PUBLIC API)
;; ============================================

;; Get the current network fee rate (most commonly used function)
(define-read-only (get-current-fee-rate)
  (ok (var-get latest-fee-rate))
)

;; Get when fee was last updated
(define-read-only (get-last-update-block)
  (ok (var-get latest-update-block))
)

;; Get total number of updates received
(define-read-only (get-total-updates)
  (ok (var-get total-updates))
)

;; Check if oracle is initialized
(define-read-only (is-oracle-initialized)
  (ok (var-get is-initialized))
)

;; Get fee data for a specific block height
(define-read-only (get-fee-at-block (block-height-input uint))
  (match (map-get? fee-history { block-height: block-height-input })
    fee-data (ok fee-data)
    ERR-INVALID-BLOCK
  )
)

;; Get average fee for a transaction type
(define-read-only (get-transaction-average (tx-type (string-ascii 30)))
  (match (map-get? transaction-averages { tx-type: tx-type })
    avg-data (ok (get avg-fee avg-data))
    (ok u0) ;; Return 0 if no data exists yet
  )
)

;; Get comprehensive fee information (for dashboards)
(define-read-only (get-fee-summary)
  (ok {
    current-fee: (var-get latest-fee-rate),
    last-update-block: (var-get latest-update-block),
    total-updates: (var-get total-updates),
    is-initialized: (var-get is-initialized)
  })
)

;; Calculate recommended STX buffer (2x current fee for safety)
(define-read-only (get-recommended-buffer)
  (let ((current-fee (var-get latest-fee-rate)))
    (ok (* current-fee u2))
  )
)

;; Get fee history range (for charts)
(define-read-only (get-fee-range (start-block uint) (end-block uint))
  (ok {
    start: start-block,
    end: end-block,
    current-fee: (var-get latest-fee-rate),
    latest-block: (var-get latest-update-block)
  })
)

;; Check if address is authorized oracle
(define-read-only (is-authorized-oracle (address principal))
  (ok (default-to false (map-get? authorized-oracles address)))
)

;; ============================================
;; ESTIMATION FUNCTIONS (PUBLIC API)
;; ============================================

;; Estimate fee for a simple STX transfer
(define-read-only (estimate-transfer-fee)
  (let (
    (base-fee (var-get latest-fee-rate))
    (tx-size u180) ;; Typical transfer transaction size
  )
    (ok (* base-fee tx-size))
  )
)

;; Estimate fee for contract call (with complexity parameter)
(define-read-only (estimate-contract-call-fee (function-complexity uint))
  (let (
    (base-fee (var-get latest-fee-rate))
    ;; Base size ~250 bytes + complexity factor
    (estimated-size (+ u250 (* function-complexity u50)))
  )
    (ok (* base-fee estimated-size))
  )
)

;; Estimate fee for NFT mint (uses historical average if available)
(define-read-only (estimate-nft-mint-fee)
  (match (map-get? transaction-averages { tx-type: "nft-mint" })
    avg-data (ok (get avg-fee avg-data))
    ;; Fallback to estimation if no data
    (ok (* (var-get latest-fee-rate) u450))
  )
)

;; Estimate fee for token swap (uses historical average)
(define-read-only (estimate-swap-fee (dex-name (string-ascii 30)))
  (match (map-get? transaction-averages { tx-type: dex-name })
    avg-data (ok (get avg-fee avg-data))
    ;; Fallback estimation
    (ok (* (var-get latest-fee-rate) u500))
  )
)

;; Check if user has sufficient balance for an operation
(define-read-only (check-sufficient-balance 
  (user-address principal)
  (required-fee uint)
)
  (let ((user-balance (stx-get-balance user-address)))
    (ok (>= user-balance required-fee))
  )
)

;; ============================================
;; WRITE FUNCTIONS (ORACLE UPDATES)
;; ============================================

;; Update the current fee rate (called by authorized oracle)
(define-public (update-fee-rate 
  (new-fee-rate uint)
  (congestion (string-ascii 10))
)
  (let (
    (current-block stacks-block-height)
    (is-authorized (default-to false (map-get? authorized-oracles tx-sender)))
  )
    ;; Check authorization
    (asserts! is-authorized ERR-UNAUTHORIZED)
    (asserts! (var-get is-initialized) ERR-NOT-INITIALIZED)
    (asserts! (> new-fee-rate u0) ERR-INVALID-FEE)
    
    ;; Update global state
    (var-set latest-fee-rate new-fee-rate)
    (var-set latest-update-block current-block)
    (var-set total-updates (+ (var-get total-updates) u1))
    
    ;; Store in historical map
    (map-set fee-history
      { block-height: current-block }
      {
        fee-rate: new-fee-rate,
        timestamp: burn-block-height,
        network-congestion: congestion,
        recorded-by: tx-sender
      }
    )
    
    ;; Emit event for off-chain listeners
    (print { 
      event: "fee-updated", 
      fee-rate: new-fee-rate, 
      congestion: congestion,
      block: current-block
    })
    
    (ok true)
  )
)

;; Update average fee for a transaction type (based on observed data)
(define-public (update-transaction-average
  (tx-type (string-ascii 30))
  (observed-fee uint)
)
  (begin
    (asserts! (default-to false (map-get? authorized-oracles tx-sender)) ERR-UNAUTHORIZED)
    (asserts! (> observed-fee u0) ERR-INVALID-FEE)
    
    ;; Get existing average or initialize
    (match (map-get? transaction-averages { tx-type: tx-type })
      existing (let (
        (old-avg (get avg-fee existing))
        (old-count (get sample-count existing))
        (new-count (+ old-count u1))
        ;; Calculate rolling average
        (new-avg (/ (+ (* old-avg old-count) observed-fee) new-count))
      )
        (map-set transaction-averages
          { tx-type: tx-type }
          { 
            avg-fee: new-avg, 
            sample-count: new-count,
            last-updated: stacks-block-height
          }
        )
      )
      ;; First data point
      (map-set transaction-averages
        { tx-type: tx-type }
        { 
          avg-fee: observed-fee, 
          sample-count: u1,
          last-updated: stacks-block-height
        }
      )
    )
    
    (print { event: "average-updated", tx-type: tx-type, fee: observed-fee })
    (ok true)
  )
)

;; Batch update multiple transaction averages (gas efficient)
(define-public (batch-update-averages
  (updates (list 10 { tx-type: (string-ascii 30), observed-fee: uint }))
)
  (begin
    (asserts! (default-to false (map-get? authorized-oracles tx-sender)) ERR-UNAUTHORIZED)
    (ok (map update-single-average updates))
  )
)

;; Helper for batch updates
(define-private (update-single-average (update-data { tx-type: (string-ascii 30), observed-fee: uint }))
  (match (update-transaction-average 
    (get tx-type update-data)
    (get observed-fee update-data)
  )
    success true
    error false
  )
)

;; ============================================
;; ADMIN FUNCTIONS
;; ============================================

;; Transfer contract ownership
(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (var-set contract-owner new-owner)
    (print { event: "ownership-transferred", new-owner: new-owner })
    (ok true)
  )
)

;; Authorize a new oracle address
(define-public (authorize-oracle (oracle-address principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (map-set authorized-oracles oracle-address true)
    (print { event: "oracle-authorized", oracle: oracle-address })
    (ok true)
  )
)

;; Revoke oracle authorization
(define-public (revoke-oracle (oracle-address principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (map-set authorized-oracles oracle-address false)
    (print { event: "oracle-revoked", oracle: oracle-address })
    (ok true)
  )
)

;; ============================================
;; INTEGRATION EXAMPLES (in comments)
;; ============================================

;; Example: How another contract would read fee data
;; (define-read-only (my-function)
;;   (match (contract-call? .zerlin-fee-oracle get-current-fee-rate)
;;     fee-rate (ok fee-rate)
;;     error (err u500)
;;   )
;; )

;; Example: How to check if user can afford an operation
;; (define-public (do-expensive-thing)
;;   (let (
;;     (estimated-fee (unwrap! (contract-call? .zerlin-fee-oracle estimate-contract-call-fee u5) (err u1)))
;;     (has-balance (unwrap! (contract-call? .zerlin-fee-oracle check-sufficient-balance tx-sender estimated-fee) (err u2)))
;;   )
;;     (asserts! has-balance (err u3))
;;     ;; Proceed with operation...
;;     (ok true)
;;   )
;; )
