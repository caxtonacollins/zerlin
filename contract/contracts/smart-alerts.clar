;; CONTRACT #3: ZERLIN SMART ALERTS
;; ============================================
;; Allows users to set on-chain alerts that trigger when fees hit target levels
;; This is a premium feature that enables decentralized notifications
;; Integrates with fee-oracle contract to check alert conditions

;; ============================================
;; ERROR CODES
;; ============================================
(define-constant ERR-UNAUTHORIZED (err u300))
(define-constant ERR-ALERT-NOT-FOUND (err u301))
(define-constant ERR-ALERT-LIMIT-REACHED (err u302))
(define-constant ERR-INVALID-THRESHOLD (err u303))
(define-constant ERR-INVALID-ALERT-TYPE (err u304))
(define-constant ERR-ALERT-INACTIVE (err u305))

;; ============================================
;; CONFIGURATION
;; ============================================
(define-constant MAX-ALERTS-PER-USER u10)
(define-constant MIN-FEE-THRESHOLD u100)  ;; Minimum 100 microSTX

;; ============================================
;; DATA VARIABLES
;; ============================================
(define-data-var contract-owner principal tx-sender)
(define-data-var fee-oracle-contract principal tx-sender)
(define-data-var next-alert-id uint u1)
(define-data-var total-alerts-created uint u0)
(define-data-var total-alerts-triggered uint u0)

;; ============================================
;; DATA MAPS
;; ============================================

;; User alerts storage
(define-map user-alerts
  { user: principal, alert-id: uint }
  {
   target-fee: uint,                  ;; Fee threshold in microSTX
   alert-type: (string-ascii 10),     ;; "below" or "above"
   tx-type: (string-ascii 30),        ;; Transaction type to monitor
   is-active: bool,                   ;; Alert enabled/disabled
   created-at: uint,                  ;; Block height when created
   last-triggered: uint,              ;; Block height of last trigger
   trigger-count: uint                ;; Number of times triggered
  }
)

;; Track number of active alerts per user
(define-map user-alert-count
  { user: principal }
  { count: uint }
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

;; Get a specific alert
(define-read-only (get-alert (user principal) (alert-id uint))
  (map-get? user-alerts { user: user, alert-id: alert-id })
)

;; Get user's total alert count
(define-read-only (get-user-alert-count (user principal))
  (default-to
    { count: u0 }
    (map-get? user-alert-count { user: user })
  )
)

;; Get global statistics
(define-read-only (get-alert-stats)
  (ok {
    total-created: (var-get total-alerts-created),
    total-triggered: (var-get total-alerts-triggered),
    next-id: (var-get next-alert-id)
  })
)

;; Check if user can create more alerts
(define-read-only (can-create-alert (user principal))
  (let ((current-count (get count (get-user-alert-count user))))
    (ok (< current-count MAX-ALERTS-PER-USER))
  )
)

;; Check if alert should trigger based on current fee
(define-read-only (should-alert-trigger
  (user principal)
  (alert-id uint)
  (current-fee uint)
)
  (match (get-alert user alert-id)
    alert-data
      (if (get is-active alert-data)
        (ok (if (is-eq (get alert-type alert-data) "below")
         ;; Trigger if current fee is below target
          (< current-fee (get target-fee alert-data))
         ;; Trigger if current fee is above target
          (> current-fee (get target-fee alert-data))
        ))
        ERR-ALERT-INACTIVE
      )
    ERR-ALERT-NOT-FOUND
  )
)

;; ============================================
;; PUBLIC FUNCTIONS (USER ACTIONS)
;; ============================================

;; Create a new alert
(define-public (create-alert
  (target-fee uint)
  (alert-type (string-ascii 10))
  (tx-type (string-ascii 30))
)
  (let (
    (user tx-sender)
    (alert-id (var-get next-alert-id))
    (current-count (get count (get-user-alert-count user)))
  )
    ;; Validations
    (asserts! (< current-count MAX-ALERTS-PER-USER) ERR-ALERT-LIMIT-REACHED)
    (asserts! (>= target-fee MIN-FEE-THRESHOLD) ERR-INVALID-THRESHOLD)
    (asserts! (or (is-eq alert-type "below") (is-eq alert-type "above")) ERR-INVALID-ALERT-TYPE)
    
    ;; Create the alert
    (map-set user-alerts
      { user: user, alert-id: alert-id }
      {
        target-fee: target-fee,
        alert-type: alert-type,
        tx-type: tx-type,
        is-active: true,
        created-at: stacks-block-height,
        last-triggered: u0,
        trigger-count: u0
      }
    )
    
    ;; Update counters
    (map-set user-alert-count
      { user: user }
      { count: (+ current-count u1) }
    )
    (var-set next-alert-id (+ alert-id u1))
    (var-set total-alerts-created (+ (var-get total-alerts-created) u1))
    
    (print {
      event: "alert-created",
      user: user,
      alert-id: alert-id,
      target-fee: target-fee,
      alert-type: alert-type
    })
    (ok alert-id)
  )
)

;; Deactivate an alert
(define-public (deactivate-alert (alert-id uint))
  (let ((user tx-sender))
    (match (get-alert user alert-id)
      alert-data (begin
        (map-set user-alerts
          { user: user, alert-id: alert-id }
          (merge alert-data { is-active: false })
        )
        (print { event: "alert-deactivated", user: user, alert-id: alert-id })
        (ok true)
      )
      ERR-ALERT-NOT-FOUND
    )
  )
)

;; Reactivate an alert
(define-public (reactivate-alert (alert-id uint))
  (let ((user tx-sender))
    (match (get-alert user alert-id)
      alert-data (begin
        (map-set user-alerts
          { user: user, alert-id: alert-id }
          (merge alert-data { is-active: true })
        )
        (print { event: "alert-reactivated", user: user, alert-id: alert-id })
        (ok true)
      )
      ERR-ALERT-NOT-FOUND
    )
  )
)

;; Delete an alert permanently
(define-public (delete-alert (alert-id uint))
  (let (
    (user tx-sender)
    (current-count (get count (get-user-alert-count user)))
  )
    (match (get-alert user alert-id)
      alert-data (begin
        (map-delete user-alerts { user: user, alert-id: alert-id })
        (map-set user-alert-count
          { user: user }
          { count: (- current-count u1) }
        )
        (print { event: "alert-deleted", user: user, alert-id: alert-id })
        (ok true)
      )
      ERR-ALERT-NOT-FOUND
    )
  )
)

;; Update alert threshold
(define-public (update-alert-threshold
  (alert-id uint)
  (new-target-fee uint)
)
  (let ((user tx-sender))
    (asserts! (>= new-target-fee MIN-FEE-THRESHOLD) ERR-INVALID-THRESHOLD)
    (match (get-alert user alert-id)
      alert-data (begin
        (map-set user-alerts
          { user: user, alert-id: alert-id }
          (merge alert-data { target-fee: new-target-fee })
        )
        (print { event: "threshold-updated", user: user, alert-id: alert-id, new-fee: new-target-fee })
        (ok true)
      )
      ERR-ALERT-NOT-FOUND
    )
  )
)

;; ============================================
;; ORACLE FUNCTIONS (TRIGGER ALERTS)
;; ============================================

;; Mark alert as triggered (called by authorized oracle/backend)
(define-public (mark-triggered
  (user principal)
  (alert-id uint)
  (current-fee uint)
)
  (begin
    ;; Only oracle or contract owner can call this
    (asserts!
      (or
        (is-eq tx-sender (var-get contract-owner))
        (is-eq tx-sender (var-get fee-oracle-contract))
      )
      ERR-UNAUTHORIZED
    )
    
    (match (get-alert user alert-id)
      alert-data (let (
        (new-trigger-count (+ (get trigger-count alert-data) u1))
      )
        ;; Update alert with trigger info
        (map-set user-alerts
          { user: user, alert-id: alert-id }
          (merge alert-data {
            last-triggered: stacks-block-height,
            trigger-count: new-trigger-count
          })
        )
        
        (var-set total-alerts-triggered (+ (var-get total-alerts-triggered) u1))
        
        (print {
          event: "alert-triggered",
          user: user,
          alert-id: alert-id,
          fee: current-fee,
          trigger-count: new-trigger-count
        })
        (ok true)
      )
      ERR-ALERT-NOT-FOUND
    )
  )
)

;; ============================================
;; ADMIN FUNCTIONS
;; ============================================

;; Set fee oracle contract address
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
