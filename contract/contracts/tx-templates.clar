;; ============================================
;; CONTRACT #2: ZERLIN TRANSACTION TEMPLATES (MVP)
;; ============================================
;; Stores pre-calculated gas costs for common Stacks operations
;; Essential templates only for MVP

;; ============================================
;; ERROR CODES
;; ============================================
(define-constant ERR-UNAUTHORIZED (err u200))
(define-constant ERR-TEMPLATE-NOT-FOUND (err u201))
(define-constant ERR-INVALID-GAS (err u202))
(define-constant ERR-TEMPLATE-EXISTS (err u203))

;; ============================================
;; DATA VARIABLES
;; ============================================
(define-data-var contract-owner principal tx-sender)
(define-data-var fee-oracle-contract principal tx-sender)
(define-data-var total-templates uint u0)

;; ============================================
;; DATA MAPS
;; ============================================

(define-map transaction-templates
  { template-id: (string-ascii 30) }
  {
    avg-gas-units: uint,
    avg-size-bytes: uint,
    description: (string-ascii 100),
    category: (string-ascii 20),
    last-updated: uint,
    sample-count: uint
  }
)

;; ============================================
;; INITIALIZATION
;; ============================================

(define-public (initialize-templates)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    
    ;; Essential templates for MVP
    (try! (add-template "stx-transfer" u180 u1000 "Simple STX transfer" "transfer"))
    (try! (add-template "ft-transfer" u300 u2500 "Fungible token transfer" "token"))
    (try! (add-template "nft-mint" u450 u5500 "Mint NFT" "nft"))
    (try! (add-template "dex-swap-alex" u500 u3950 "Token swap on ALEX" "dex"))
    (try! (add-template "sbtc-peg-in" u700 u8000 "sBTC peg-in (BTC->sBTC)" "sbtc"))
    (try! (add-template "sbtc-peg-out" u750 u8500 "sBTC peg-out (sBTC->BTC)" "sbtc"))
    (try! (add-template "contract-deploy-small" u20000 u150000 "Deploy contract 1-10KB" "contract"))
    (try! (add-template "defi-stake" u450 u5000 "Stake tokens" "defi"))
    
    (print { event: "templates-initialized", count: (var-get total-templates) })
    (ok true)
  )
)

(define-private (add-template
  (template-id (string-ascii 30))
  (size-bytes uint)
  (gas-units uint)
  (description (string-ascii 100))
  (category (string-ascii 20))
)
  (begin
    (map-set transaction-templates
      { template-id: template-id }
      {
        avg-gas-units: gas-units,
        avg-size-bytes: size-bytes,
        description: description,
        category: category,
        last-updated: block-height,
        sample-count: u1
      }
    )
    (var-set total-templates (+ (var-get total-templates) u1))
    (ok true)
  )
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

(define-read-only (get-template (template-id (string-ascii 30)))
  (map-get? transaction-templates { template-id: template-id })
)

(define-read-only (get-template-gas (template-id (string-ascii 30)))
  (match (get-template template-id)
    template-data (ok (get avg-gas-units template-data))
    ERR-TEMPLATE-NOT-FOUND
  )
)

(define-read-only (get-template-size (template-id (string-ascii 30)))
  (match (get-template template-id)
    template-data (ok (get avg-size-bytes template-data))
    ERR-TEMPLATE-NOT-FOUND
  )
)

(define-read-only (estimate-fee-for-template 
  (template-id (string-ascii 30))
  (fee-rate-per-byte uint)
)
  (match (get-template template-id)
    template-data (ok (* (get avg-size-bytes template-data) fee-rate-per-byte))
    ERR-TEMPLATE-NOT-FOUND
  )
)

(define-read-only (get-full-estimate (template-id (string-ascii 30)))
  (match (get-template template-id)
    template-data 
      (ok {
        template: template-id,
        gas-units: (get avg-gas-units template-data),
        size-bytes: (get avg-size-bytes template-data),
        description: (get description template-data),
        category: (get category template-data),
        estimated-fee-micro-stx: (* (get avg-size-bytes template-data) u2)
      })
    ERR-TEMPLATE-NOT-FOUND
  )
)

(define-read-only (get-total-templates)
  (ok (var-get total-templates))
)

;; ============================================
;; WRITE FUNCTIONS
;; ============================================

(define-public (update-template
  (template-id (string-ascii 30))
  (new-size-bytes uint)
  (new-gas-units uint)
)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (asserts! (> new-gas-units u0) ERR-INVALID-GAS)
    (asserts! (> new-size-bytes u0) ERR-INVALID-GAS)
    
    (match (get-template template-id)
      existing (let (
        (old-gas (get avg-gas-units existing))
        (old-size (get avg-size-bytes existing))
        (old-count (get sample-count existing))
        (new-count (+ old-count u1))
        (new-avg-gas (/ (+ (* old-gas old-count) new-gas-units) new-count))
        (new-avg-size (/ (+ (* old-size old-count) new-size-bytes) new-count))
      )
        (map-set transaction-templates
          { template-id: template-id }
          {
            avg-gas-units: new-avg-gas,
            avg-size-bytes: new-avg-size,
            description: (get description existing),
            category: (get category existing),
            last-updated: block-height,
            sample-count: new-count
          }
        )
        (print { event: "template-updated", template: template-id, samples: new-count })
        (ok true)
      )
      ERR-TEMPLATE-NOT-FOUND
    )
  )
)

(define-public (create-template
  (template-id (string-ascii 30))
  (size-bytes uint)
  (gas-units uint)
  (description (string-ascii 100))
  (category (string-ascii 20))
)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (asserts! (> gas-units u0) ERR-INVALID-GAS)
    (asserts! (> size-bytes u0) ERR-INVALID-GAS)
    (asserts! (is-none (get-template template-id)) ERR-TEMPLATE-EXISTS)
    
    (map-set transaction-templates
      { template-id: template-id }
      {
        avg-gas-units: gas-units,
        avg-size-bytes: size-bytes,
        description: description,
        category: category,
        last-updated: block-height,
        sample-count: u1
      }
    )
    
    (var-set total-templates (+ (var-get total-templates) u1))
    (print { event: "template-created", template: template-id })
    (ok true)
  )
)

;; ============================================
;; ADMIN FUNCTIONS
;; ============================================

(define-public (set-fee-oracle (oracle-address principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (var-set fee-oracle-contract oracle-address)
    (print { event: "fee-oracle-set", oracle: oracle-address })
    (ok true)
  )
)

(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (var-set contract-owner new-owner)
    (print { event: "ownership-transferred", new-owner: new-owner })
    (ok true)
  )
)
