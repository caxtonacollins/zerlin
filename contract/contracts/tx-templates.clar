;; ============================================
;; CONTRACT #2: ZERLIN TRANSACTION TEMPLATES
;; ============================================
;; Stores pre-calculated gas costs for common Stacks operations
;; This enables instant fee estimates without simulating each transaction
;; Integrates with fee-oracle contract to provide real-time cost calculations

;; Contract identifier after deployment: SP123...ABC.zerlin-transaction-templates

;; ============================================
;; ERROR CODES
;; ============================================
(define-constant ERR-UNAUTHORIZED (err u200))
(define-constant ERR-TEMPLATE-NOT-FOUND (err u201))
(define-constant ERR-INVALID-GAS (err u202))
(define-constant ERR-TEMPLATE-EXISTS (err u203))
(define-constant ERR-INVALID-CATEGORY (err u204))

;; ============================================
;; DATA VARIABLES
;; ============================================
(define-data-var contract-owner principal tx-sender)
(define-data-var fee-oracle-contract principal tx-sender) ;; Will be updated after oracle deployment
(define-data-var total-templates uint u0)

;; ============================================
;; DATA MAPS
;; ============================================

;; Transaction template structure
(define-map transaction-templates
  { template-id: (string-ascii 30) }
  {
    avg-gas-units: uint,           ;; Average gas consumption in compute units
    avg-size-bytes: uint,          ;; Average transaction size in bytes
    description: (string-ascii 100),
    category: (string-ascii 20),   ;; "transfer", "dex", "nft", "defi", "sbtc"
    last-updated: uint,            ;; Block height of last update
    sample-count: uint             ;; Number of samples used for average
  }
)

;; Category index for efficient querying
(define-map category-templates
  { category: (string-ascii 20) }
  { count: uint }
)

;; ============================================
;; INITIALIZATION
;; ============================================

;; Initialize all common transaction templates
(define-public (initialize-templates)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    
    ;; =============== BASIC TRANSFERS ===============
    (try! (add-template 
      "stx-transfer"
      u180    ;; bytes
      u1000   ;; gas units
      "Simple STX transfer"
      "transfer"
    ))
    
    (try! (add-template 
      "stx-transfer-memo"
      u250
      u1200
      "STX transfer with memo"
      "transfer"
    ))
    
    ;; =============== TOKEN OPERATIONS (SIP-010) ===============
    (try! (add-template 
      "ft-transfer"
      u300
      u2500
      "Fungible token transfer"
      "token"
    ))
    
    (try! (add-template 
      "ft-mint"
      u350
      u3000
      "Mint fungible tokens"
      "token"
    ))
    
    (try! (add-template 
      "ft-burn"
      u320
      u2800
      "Burn fungible tokens"
      "token"
    ))
    
    ;; =============== NFT OPERATIONS (SIP-009) ===============
    (try! (add-template 
      "nft-mint"
      u450
      u5500
      "Mint NFT"
      "nft"
    ))
    
    (try! (add-template 
      "nft-transfer"
      u400
      u4000
      "Transfer NFT"
      "nft"
    ))
    
    (try! (add-template 
      "nft-mint-metadata"
      u800
      u8000
      "Mint NFT with metadata"
      "nft"
    ))
    
    (try! (add-template 
      "nft-list-marketplace"
      u500
      u6000
      "List NFT on marketplace"
      "nft"
    ))
    
    ;; =============== DEX OPERATIONS ===============
    (try! (add-template 
      "dex-swap-alex"
      u500
      u3950
      "Token swap on ALEX"
      "dex"
    ))
    
    (try! (add-template 
      "dex-swap-bitflow"
      u550
      u4200
      "Token swap on Bitflow"
      "dex"
    ))
    
    (try! (add-template 
      "dex-swap-velar"
      u520
      u4100
      "Token swap on Velar"
      "dex"
    ))
    
    (try! (add-template 
      "dex-add-liquidity"
      u650
      u6500
      "Add liquidity to pool"
      "dex"
    ))
    
    (try! (add-template 
      "dex-remove-liquidity"
      u600
      u6000
      "Remove liquidity"
      "dex"
    ))
    
    ;; =============== sBTC OPERATIONS ===============
    (try! (add-template 
      "sbtc-peg-in"
      u700
      u8000
      "sBTC peg-in (BTC->sBTC)"
      "sbtc"
    ))
    
    (try! (add-template 
      "sbtc-peg-out"
      u750
      u8500
      "sBTC peg-out (sBTC->BTC)"
      "sbtc"
    ))
    
    (try! (add-template 
      "sbtc-transfer"
      u300
      u2800
      "Transfer sBTC"
      "sbtc"
    ))
    
    ;; =============== DEFI OPERATIONS ===============
    (try! (add-template 
      "defi-lend"
      u600
      u7000
      "Lend assets"
      "defi"
    ))
    
    (try! (add-template 
      "defi-borrow"
      u650
      u7500
      "Borrow assets"
      "defi"
    ))
    
    (try! (add-template 
      "defi-repay"
      u550
      u6500
      "Repay loan"
      "defi"
    ))
    
    (try! (add-template 
      "defi-stake"
      u450
      u5000
      "Stake tokens"
      "defi"
    ))
    
    (try! (add-template 
      "defi-unstake"
      u470
      u5200
      "Unstake tokens"
      "defi"
    ))
    
    ;; =============== CONTRACT OPERATIONS ===============
    (try! (add-template 
      "contract-deploy-tiny"
      u5000
      u50000
      "Deploy contract <1KB"
      "contract"
    ))
    
    (try! (add-template 
      "contract-deploy-small"
      u20000
      u150000
      "Deploy contract 1-10KB"
      "contract"
    ))
    
    (try! (add-template 
      "contract-deploy-medium"
      u50000
      u350000
      "Deploy contract 10-50KB"
      "contract"
    ))
    
    ;; =============== STACKING OPERATIONS ===============
    (try! (add-template 
      "stack-stx"
      u400
      u5000
      "Stack STX"
      "stacking"
    ))
    
    (try! (add-template 
      "delegate-stack-stx"
      u450
      u5500
      "Delegate stack STX"
      "stacking"
    ))
    
    (try! (add-template 
      "revoke-delegate-stx"
      u350
      u4000
      "Revoke delegation"
      "stacking"
    ))
    
    ;; =============== MULTI-SIG OPERATIONS ===============
    (try! (add-template 
      "multisig-submit"
      u500
      u6000
      "Submit multisig tx"
      "multisig"
    ))
    
    (try! (add-template 
      "multisig-confirm"
      u350
      u4000
      "Confirm multisig tx"
      "multisig"
    ))
    
    (try! (add-template 
      "multisig-revoke"
      u300
      u3500
      "Revoke multisig confirmation"
      "multisig"
    ))
    
    (print { event: "templates-initialized", count: (var-get total-templates) })
    (ok true)
  )
)

;; Helper function to add templates during initialization
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
        last-updated: stacks-block-height,
        sample-count: u1
      }
    )
    
    ;; Update category count
    (match (map-get? category-templates { category: category })
      existing (map-set category-templates 
        { category: category }
        { count: (+ (get count existing) u1) }
      )
      (map-set category-templates 
        { category: category }
        { count: u1 }
      )
    )
    
    (var-set total-templates (+ (var-get total-templates) u1))
    (if false (err u0) (ok true))
  )
)

;; ============================================
;; READ-ONLY FUNCTIONS (PUBLIC API)
;; ============================================

;; Get complete template data
(define-read-only (get-template (template-id (string-ascii 30)))
  (map-get? transaction-templates { template-id: template-id })
)

;; Get just gas units for a template
(define-read-only (get-template-gas (template-id (string-ascii 30)))
  (match (get-template template-id)
    template-data (ok (get avg-gas-units template-data))
    ERR-TEMPLATE-NOT-FOUND
  )
)

;; Get just size in bytes for a template
(define-read-only (get-template-size (template-id (string-ascii 30)))
  (match (get-template template-id)
    template-data (ok (get avg-size-bytes template-data))
    ERR-TEMPLATE-NOT-FOUND
  )
)

;; Calculate fee for template using provided fee rate
(define-read-only (estimate-fee-for-template 
  (template-id (string-ascii 30))
  (fee-rate-per-byte uint)
)
  (match (get-template template-id)
    template-data (ok (* (get avg-size-bytes template-data) fee-rate-per-byte))
    ERR-TEMPLATE-NOT-FOUND
  )
)

;; Get comprehensive estimate (integrates with fee oracle if available)
(define-read-only (get-full-estimate (template-id (string-ascii 30)))
  (match (get-template template-id)
    template-data 
      (ok {
        template: template-id,
        gas-units: (get avg-gas-units template-data),
        size-bytes: (get avg-size-bytes template-data),
        description: (get description template-data),
        category: (get category template-data),
        ;; Default fee estimate (will integrate with oracle in production)
        estimated-fee-micro-stx: (* (get avg-size-bytes template-data) u2)
      })
    ERR-TEMPLATE-NOT-FOUND
  )
)

;; Compare two templates to see which is cheaper
(define-read-only (compare-templates 
  (template-id-1 (string-ascii 30))
  (template-id-2 (string-ascii 30))
)
  (match (get-template template-id-1)
    template-1 (match (get-template template-id-2)
      template-2 (ok {
        template-1: template-id-1,
        gas-1: (get avg-gas-units template-1),
        size-1: (get avg-size-bytes template-1),
        template-2: template-id-2,
        gas-2: (get avg-gas-units template-2),
        size-2: (get avg-size-bytes template-2),
        cheaper: (if (< (get avg-size-bytes template-1) (get avg-size-bytes template-2))
          template-id-1
          template-id-2
        )
      })
      ERR-TEMPLATE-NOT-FOUND
    )
    ERR-TEMPLATE-NOT-FOUND
  )
)

;; Get all templates in a category (returns count)
(define-read-only (get-category-count (category (string-ascii 20)))
  (match (map-get? category-templates { category: category })
    data (ok (get count data))
    (ok u0)
  )
)

;; Get total number of templates
(define-read-only (get-total-templates)
  (ok (var-get total-templates))
)

;; ============================================
;; CATEGORY-SPECIFIC HELPERS
;; ============================================

;; Get the cheapest DEX swap option
(define-read-only (get-cheapest-dex-swap)
  (let (
    (alex-size (default-to u500 (get avg-size-bytes (get-template "dex-swap-alex"))))
    (bitflow-size (default-to u550 (get avg-size-bytes (get-template "dex-swap-bitflow"))))
    (velar-size (default-to u520 (get avg-size-bytes (get-template "dex-swap-velar"))))
  )
    (ok (if (and (< alex-size bitflow-size) (< alex-size velar-size))
      "dex-swap-alex"
      (if (< bitflow-size velar-size)
        "dex-swap-bitflow"
        "dex-swap-velar"
      )
    ))
  )
)

;; Get sBTC operation templates (helper for UI)
(define-read-only (get-sbtc-operations)
  (ok {
    peg-in: (get-template "sbtc-peg-in"),
    peg-out: (get-template "sbtc-peg-out"),
    transfer: (get-template "sbtc-transfer")
  })
)

;; Get DeFi lending operations
(define-read-only (get-defi-lending-operations)
  (ok {
    lend: (get-template "defi-lend"),
    borrow: (get-template "defi-borrow"),
    repay: (get-template "defi-repay")
  })
)

;; ============================================
;; WRITE FUNCTIONS (ORACLE/ADMIN ONLY)
;; ============================================

;; Update template with new measured data (rolling average)
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
        ;; Calculate rolling averages
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
            last-updated: stacks-block-height,
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

;; Create a completely new template (admin only)
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
        last-updated: stacks-block-height,
        sample-count: u1
      }
    )
    
    ;; Update category count
    (match (map-get? category-templates { category: category })
      existing (map-set category-templates 
        { category: category }
        { count: (+ (get count existing) u1) }
      )
      (map-set category-templates 
        { category: category }
        { count: u1 }
      )
    )
    
    (var-set total-templates (+ (var-get total-templates) u1))
    (print { event: "template-created", template: template-id })
    (ok true)
  )
)

;; Batch update multiple templates (gas efficient)
(define-public (batch-update-templates
  (updates (list 10 { 
    template-id: (string-ascii 30), 
    size-bytes: uint, 
    gas-units: uint 
  }))
)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (ok (map update-single-template updates))
  )
)

;; Helper for batch updates
(define-private (update-single-template 
  (update-data { template-id: (string-ascii 30), size-bytes: uint, gas-units: uint })
)
  (match (update-template 
    (get template-id update-data)
    (get size-bytes update-data)
    (get gas-units update-data)
  )
    success true
    error false
  )
)

;; ============================================
;; ADMIN FUNCTIONS
;; ============================================

;; Update fee oracle contract address for integration
(define-public (set-fee-oracle (oracle-address principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (var-set fee-oracle-contract oracle-address)
    (print { event: "fee-oracle-set", oracle: oracle-address })
    (ok true)
  )
)

;; Transfer contract ownership
(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (var-set contract-owner new-owner)
    (print { event: "ownership-transferred", new-owner: new-owner })
    (ok true)
  )
)
