;; CONTRACT #3: ZERLIN SMART ALERTS
;; ============================================
;; Allows users to set on-chain alerts that trigger when fees hit target levels
;; This is a premium feature that enables decentralized notifications
;; Integrates with fee-oracle contract to check alert conditions


;; Contract identifier after deployment: SP123...ABC.zerlin-smart-alerts


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
(define-data-var fee-oracle-contract principal tx-sender) ;; Will be updated after oracle deployment
(define-data-var next-alert-id uint u1)
(define-data-var total-alerts-created uint u0)
(define-data-var total-alerts-triggered uint u0)
(define-data-var temp-batch-fee uint u0)


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


;; Alert trigger history (for analytics)
(define-map trigger-history
 { alert-id: uint, trigger-index: uint }
 {
   fee-at-trigger: uint,
   block-height: uint,
   timestamp: uint
 }
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


;; Get trigger history for an alert
(define-read-only (get-trigger-history (alert-id uint) (trigger-index uint))
 (map-get? trigger-history { alert-id: alert-id, trigger-index: trigger-index })
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


;; Deactivate an alert (keeps it but disables)
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


;; Delete an alert permanently (frees up slot)
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


;; Update alert threshold (change target fee)
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


;; Update alert type (switch between "below" and "above")
(define-public (update-alert-type
 (alert-id uint)
 (new-alert-type (string-ascii 10))
)
 (let ((user tx-sender))
   (asserts! (or (is-eq new-alert-type "below") (is-eq new-alert-type "above")) ERR-INVALID-ALERT-TYPE)
   (match (get-alert user alert-id)
     alert-data (begin
       (map-set user-alerts
         { user: user, alert-id: alert-id }
         (merge alert-data { alert-type: new-alert-type })
       )
       (print { event: "alert-type-updated", user: user, alert-id: alert-id, type: new-alert-type })
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
      
       ;; Record in trigger history
       (map-set trigger-history
         { alert-id: alert-id, trigger-index: new-trigger-count }
         {
           fee-at-trigger: current-fee,
           block-height: stacks-block-height,
           timestamp: burn-block-height
         }
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


;; Batch check and trigger multiple alerts (called by oracle)
(define-public (batch-check-alerts
 (alerts-to-check (list 20 { user: principal, alert-id: uint }))
 (current-fee uint)
)
 (begin
   (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
   (var-set temp-batch-fee current-fee)
   (ok (fold check-and-trigger-fold alerts-to-check (list)))
 )
)


;; Fold helper for batch checking - returns accumulated list of results
(define-private (check-and-trigger-fold
 (alert-info { user: principal, alert-id: uint })
 (accumulated (list 20 bool))
)
 (let (
   (current-fee (var-get temp-batch-fee))
 )
   (unwrap-panic (as-max-len? (append accumulated (check-and-trigger-single-alert alert-info current-fee)) u20))
 )
)


;; Helper function for batch checking
(define-private (check-and-trigger-single-alert
 (alert-info { user: principal, alert-id: uint })
 (current-fee uint)
)
 (match (should-alert-trigger
   (get user alert-info)
   (get alert-id alert-info)
   current-fee
 )
   should-trigger (if should-trigger
     (match (mark-triggered (get user alert-info) (get alert-id alert-info) current-fee)
       success true
       error false
     )
     false
   )
   error false
 )
)


;; ============================================
;; PREMIUM FEATURES
;; ============================================


;; Create multiple alerts at once (batch creation)
(define-public (create-alerts-batch
 (alerts (list 5 {
   target-fee: uint,
   alert-type: (string-ascii 10),
   tx-type: (string-ascii 30)
 }))
)
 (let (
   (user tx-sender)
   (current-count (get count (get-user-alert-count user)))
   (new-alert-count (len alerts))
 )
   ;; Check if user has room for all alerts
   (asserts! (<= (+ current-count new-alert-count) MAX-ALERTS-PER-USER) ERR-ALERT-LIMIT-REACHED)
  
   ;; Create all alerts
   (ok (map create-single-alert-from-batch alerts))
 )
)


;; Helper for batch creation
(define-private (create-single-alert-from-batch
 (alert-params {
   target-fee: uint,
   alert-type: (string-ascii 10),
   tx-type: (string-ascii 30)
 })
)
 (match (create-alert
   (get target-fee alert-params)
   (get alert-type alert-params)
   (get tx-type alert-params)
 )
   success success
   error u0
 )
)


;; Delete all inactive alerts (cleanup)
(define-public (delete-all-inactive-alerts)
 (let ((user tx-sender))
   ;; In production, would iterate through user's alerts
   ;; For now, returns ok - full implementation requires off-chain indexing
   (print { event: "cleanup-requested", user: user })
   (ok true)
 )
)


;; ============================================
;; ADMIN FUNCTIONS
;; ============================================


;; Set fee oracle contract address for integration
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


;; Update max alerts per user (for premium users in future)
;; Note: Would require additional data structure to implement per-user limits
(define-public (emergency-pause)
 (begin
   (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
   ;; In production, would set a paused flag
   (print { event: "contract-paused" })
   (ok true)
 )
)


;; ============================================
;; INTEGRATION HELPER FUNCTIONS
;; ============================================


;; Check all of a user's alerts against current fee (read-only)
(define-read-only (get-triggered-alerts
 (user principal)
 (current-fee uint)
)
 (ok {
   user: user,
   current-fee: current-fee,
   ;; In production, would return list of triggered alert IDs
   ;; Requires off-chain indexing of user's alerts
   checked: true
 })
)


;; Estimate cost to create alert
(define-read-only (estimate-creation-cost)
 ;; Approximate cost to create one alert
 (ok u2000) ;; ~0.002 STX
)


;; ============================================
;; USAGE EXAMPLES (in comments)
;; ============================================


;; Example 1: User creates an alert for low fees
;; (contract-call? .zerlin-smart-alerts create-alert u1500 "below" "stx-transfer")
;; Returns: (ok u1) ;; Alert ID


;; Example 2: User updates their alert threshold
;; (contract-call? .zerlin-smart-alerts update-alert-threshold u1 u1200)
;; Returns: (ok true)


;; Example 3: Oracle checks if alert should trigger
;; (contract-call? .zerlin-smart-alerts should-alert-trigger user-principal u1 u1400)
;; Returns: (ok true) if should trigger, (ok false) if not


;; Example 4: Oracle marks alert as triggered
;; (contract-call? .zerlin-smart-alerts mark-triggered user-principal u1 u1400)
;; Returns: (ok true)
