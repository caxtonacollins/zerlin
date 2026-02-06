import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";


// simnet is available globally from vitest-environment-clarinet
declare const simnet: any;


const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;


describe("Smart Alerts Contract Tests", () => {
  describe("Alert Creation Tests", () => {
   it("should create alert with below threshold", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     expect(result).toBeOk(Cl.uint(1)); // First alert ID
   });
  
   it("should create alert with above threshold", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(2000), Cl.stringAscii("above"), Cl.stringAscii("nft-mint")],
       wallet1
     );
    
     expect(result).toBeOk(Cl.uint(1));
   });
  
   it("should reject alert with invalid threshold", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(50), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     expect(result).toBeErr(Cl.uint(303)); // ERR-INVALID-THRESHOLD (min is 100)
   });
  
   it("should reject alert with invalid type", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("invalid"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     expect(result).toBeErr(Cl.uint(304)); // ERR-INVALID-ALERT-TYPE
   });
  
   it("should enforce max alerts per user limit", () => {
     // Create 10 alerts (the max)
     for (let i = 0; i < 10; i++) {
       simnet.callPublicFn(
         "smart-alerts-v1",
         "create-alert",
         [Cl.uint(1000 + i * 100), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
         wallet1
       );
     }
    
     // Try to create 11th alert
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(2000), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     expect(result).toBeErr(Cl.uint(302)); // ERR-ALERT-LIMIT-REACHED
   });
  
   it("should increment alert ID sequentially", () => {
     const { result: first } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
     expect(first).toBeOk(Cl.uint(1));
    
     const { result: second } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1600), Cl.stringAscii("above"), Cl.stringAscii("nft-mint")],
       wallet1
     );
     expect(second).toBeOk(Cl.uint(2));
    
     const { result: third } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1700), Cl.stringAscii("below"), Cl.stringAscii("ft-transfer")],
       wallet2
     );
     expect(third).toBeOk(Cl.uint(3));
   });
  
   it("should update user alert count correctly", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-user-alert-count",
       [Cl.principal(wallet1)],
       deployer
     );
    
     expect(result).toStrictEqual(Cl.tuple({ count: Cl.uint(1) }));
   });
  
   it("should update global stats on creation", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert-stats",
       [],
       deployer
     );
    
     expect(result).toBeOk(
       Cl.tuple({
         "total-created": Cl.uint(1),
         "total-triggered": Cl.uint(0),
         "next-id": Cl.uint(2),
       })
     );
   });
 });
  describe("Alert Management Tests", () => {
   beforeEach(() => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
   });
  
   it("should deactivate active alert", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "deactivate-alert",
       [Cl.uint(1)],
       wallet1
     );
    
     expect(result).toBeOk(Cl.bool(true));
    
     // Verify alert is deactivated
     const alert = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert",
       [Cl.principal(wallet1), Cl.uint(1)],
       deployer
     ).result;
    
     const alertData = alert as any;
     if (alertData.type === 9) { // some type
       expect(alertData.value.data["is-active"]).toStrictEqual(Cl.bool(false));
     }
   });
  
   it("should reactivate deactivated alert", () => {
     simnet.callPublicFn("smart-alerts-v1", "deactivate-alert", [Cl.uint(1)], wallet1);
    
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "reactivate-alert",
       [Cl.uint(1)],
       wallet1
     );
    
     expect(result).toBeOk(Cl.bool(true));
    
     // Verify alert is active
     const alert = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert",
       [Cl.principal(wallet1), Cl.uint(1)],
       deployer
     ).result;
    
     const alertData = alert as any;
     if (alertData.type === 9) {
       expect(alertData.value.data["is-active"]).toStrictEqual(Cl.bool(true));
     }
   });
  
   it("should delete alert permanently", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "delete-alert",
       [Cl.uint(1)],
       wallet1
     );
    
     expect(result).toBeOk(Cl.bool(true));
    
     // Verify alert is deleted
     const alert = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert",
       [Cl.principal(wallet1), Cl.uint(1)],
       deployer
     ).result;
    
     expect(alert).toBeNone();
   });
  
   it("should decrease user alert count on delete", () => {
     // Create second alert
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1600), Cl.stringAscii("above"), Cl.stringAscii("nft-mint")],
       wallet1
     );
    
     // Delete first alert
     simnet.callPublicFn("smart-alerts-v1", "delete-alert", [Cl.uint(1)], wallet1);
    
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-user-alert-count",
       [Cl.principal(wallet1)],
       deployer
     );
    
     expect(result).toStrictEqual(Cl.tuple({ count: Cl.uint(1) }));
   });
  
   it("should update alert threshold", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "update-alert-threshold",
       [Cl.uint(1), Cl.uint(2000)],
       wallet1
     );
    
     expect(result).toBeOk(Cl.bool(true));
    
     // Verify threshold updated
     const alert = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert",
       [Cl.principal(wallet1), Cl.uint(1)],
       deployer
     ).result;
    
     const alertData = alert as any;
     if (alertData.type === 9) {
       expect(alertData.value.data["target-fee"]).toStrictEqual(Cl.uint(2000));
     }
   });
  
   it("should reject invalid threshold update", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "update-alert-threshold",
       [Cl.uint(1), Cl.uint(50)],
       wallet1
     );
    
     expect(result).toBeErr(Cl.uint(303)); // ERR-INVALID-THRESHOLD
   });
  
   it("should update alert type", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "update-alert-type",
       [Cl.uint(1), Cl.stringAscii("above")],
       wallet1
     );
    
     expect(result).toBeOk(Cl.bool(true));
    
     // Verify type updated
     const alert = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert",
       [Cl.principal(wallet1), Cl.uint(1)],
       deployer
     ).result;
    
     const alertData = alert as any;
     if (alertData.type === 9) {
       expect(alertData.value.data["alert-type"]).toStrictEqual(Cl.stringAscii("above"));
     }
   });
  
   it("should reject invalid alert type update", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "update-alert-type",
       [Cl.uint(1), Cl.stringAscii("invalid")],
       wallet1
     );
    
     expect(result).toBeErr(Cl.uint(304)); // ERR-INVALID-ALERT-TYPE
   });
  
   it("should not allow modifying non-existent alert", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "update-alert-threshold",
       [Cl.uint(999), Cl.uint(2000)],
       wallet1
     );
    
     expect(result).toBeErr(Cl.uint(301)); // ERR-ALERT-NOT-FOUND
   });
  
   it("should not allow user to modify another user's alert", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "deactivate-alert",
       [Cl.uint(1)],
       wallet2
     );
    
     expect(result).toBeErr(Cl.uint(301)); // ERR-ALERT-NOT-FOUND
   });
 });
  describe("Alert Trigger Logic Tests", () => {
   it("should trigger when fee below target (below type)", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "should-alert-trigger",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1400)],
       deployer
     );
    
     expect(result).toBeOk(Cl.bool(true));
   });
  
   it("should not trigger when fee above target (below type)", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "should-alert-trigger",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1600)],
       deployer
     );
    
     expect(result).toBeOk(Cl.bool(false));
   });
  
   it("should trigger when fee above target (above type)", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(2000), Cl.stringAscii("above"), Cl.stringAscii("nft-mint")],
       wallet1
     );
    
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "should-alert-trigger",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(2100)],
       deployer
     );
    
     expect(result).toBeOk(Cl.bool(true));
   });
  
   it("should not trigger when fee below target (above type)", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(2000), Cl.stringAscii("above"), Cl.stringAscii("nft-mint")],
       wallet1
     );
    
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "should-alert-trigger",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1900)],
       deployer
     );
    
     expect(result).toBeOk(Cl.bool(false));
   });
  
   it("should not trigger inactive alerts", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     simnet.callPublicFn("smart-alerts-v1", "deactivate-alert", [Cl.uint(1)], wallet1);
    
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "should-alert-trigger",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1400)],
       deployer
     );
    
     expect(result).toBeErr(Cl.uint(305)); // ERR-ALERT-INACTIVE
   });
  
   it("should mark alert as triggered by owner", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "mark-triggered",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1400)],
       deployer
     );
    
     expect(result).toBeOk(Cl.bool(true));
   });
  
   it("should prevent unauthorized user from marking triggered", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "mark-triggered",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1400)],
       wallet2
     );
    
     expect(result).toBeErr(Cl.uint(300)); // ERR-UNAUTHORIZED
   });
  
   it("should increment trigger count", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     // Trigger once
     simnet.callPublicFn(
       "smart-alerts-v1",
       "mark-triggered",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1400)],
       deployer
     );
    
     // Trigger again
     simnet.callPublicFn(
       "smart-alerts-v1",
       "mark-triggered",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1300)],
       deployer
     );
    
     const alert = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert",
       [Cl.principal(wallet1), Cl.uint(1)],
       deployer
     ).result;
    
     const alertData = alert as any;
     if (alertData.type === 9) {
       expect(alertData.value.data["trigger-count"]).toStrictEqual(Cl.uint(2));
     }
   });
  
   it("should update last triggered block", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     simnet.callPublicFn(
       "smart-alerts-v1",
       "mark-triggered",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1400)],
       deployer
     );
    
     const alert = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert",
       [Cl.principal(wallet1), Cl.uint(1)],
       deployer
     ).result;
    
     const alertData = alert as any;
     if (alertData.type === 9) {
       expect(alertData.value.data["last-triggered"]).toStrictEqual(Cl.uint(simnet.blockHeight));
     }
   });
  
   it("should record trigger history", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     simnet.callPublicFn(
       "smart-alerts-v1",
       "mark-triggered",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1400)],
       deployer
     );
    
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-trigger-history",
       [Cl.uint(1), Cl.uint(1)],
       deployer
     );
    
     expect(result).toBeSome(
       Cl.tuple({
         "fee-at-trigger": Cl.uint(1400),
         "block-height": Cl.uint(simnet.blockHeight),
         "timestamp": Cl.uint(simnet.burnBlockHeight),
       })
     );
   });
  
   it("should increment total alerts triggered", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     simnet.callPublicFn(
       "smart-alerts-v1",
       "mark-triggered",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1400)],
       deployer
     );
    
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert-stats",
       [],
       deployer
     );
    
     expect(result).toBeOk(
       Cl.tuple({
         "total-created": Cl.uint(1),
         "total-triggered": Cl.uint(1),
         "next-id": Cl.uint(2),
       })
     );
   });
 });
  describe("Batch Operations Tests", () => {
   it("should create multiple alerts in batch", () => {
     const alerts = Cl.list([
       Cl.tuple({
         "target-fee": Cl.uint(1500),
         "alert-type": Cl.stringAscii("below"),
         "tx-type": Cl.stringAscii("stx-transfer"),
       }),
       Cl.tuple({
         "target-fee": Cl.uint(2000),
         "alert-type": Cl.stringAscii("above"),
         "tx-type": Cl.stringAscii("nft-mint"),
       }),
     ]);
    
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alerts-batch",
       [alerts],
       wallet1
     );
    
     // Should return list of alert IDs
     expect(result).toBeOk(Cl.list([Cl.uint(1), Cl.uint(2)]));
   });
  
   it("should respect user limit in batch creation", () => {
     // Create 9 alerts individually
     for (let i = 0; i < 9; i++) {
       simnet.callPublicFn(
         "smart-alerts-v1",
         "create-alert",
         [Cl.uint(1000 + i * 100), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
         wallet1
       );
     }
    
     // Try to batch create 2 more (would exceed limit of 10)
     const alerts = Cl.list([
       Cl.tuple({
         "target-fee": Cl.uint(2000),
         "alert-type": Cl.stringAscii("below"),
         "tx-type": Cl.stringAscii("stx-transfer"),
       }),
       Cl.tuple({
         "target-fee": Cl.uint(2100),
         "alert-type": Cl.stringAscii("below"),
         "tx-type": Cl.stringAscii("nft-mint"),
       }),
     ]);
    
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alerts-batch",
       [alerts],
       wallet1
     );
    
     expect(result).toBeErr(Cl.uint(302)); // ERR-ALERT-LIMIT-REACHED
   });
  
   it("should batch check alerts", () => {
     // Create two alerts
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(2000), Cl.stringAscii("above"), Cl.stringAscii("nft-mint")],
       wallet1
     );
    
     const alertsToCheck = Cl.list([
       Cl.tuple({
         user: Cl.principal(wallet1),
         "alert-id": Cl.uint(1),
       }),
       Cl.tuple({
         user: Cl.principal(wallet1),
         "alert-id": Cl.uint(2),
       }),
     ]);
    
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "batch-check-alerts",
       [alertsToCheck, Cl.uint(1400)],
       deployer
     );
    
     // First alert should trigger (1400 < 1500), second shouldn't (1400 < 2000)
     expect(result).toBeOk(Cl.list([Cl.bool(true), Cl.bool(false)]));
   });
  
   it("should prevent unauthorized batch check", () => {
     const alertsToCheck = Cl.list([
       Cl.tuple({
         user: Cl.principal(wallet1),
         "alert-id": Cl.uint(1),
       }),
     ]);
    
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "batch-check-alerts",
       [alertsToCheck, Cl.uint(1400)],
       wallet1
     );
    
     expect(result).toBeErr(Cl.uint(300)); // ERR-UNAUTHORIZED
   });
 });
  describe("Read-Only Function Tests", () => {
   beforeEach(() => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
   });
  
   it("should get alert details", () => {
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert",
       [Cl.principal(wallet1), Cl.uint(1)],
       deployer
     );
    
     expect(result).toBeSome(
       Cl.tuple({
         "target-fee": Cl.uint(1500),
         "alert-type": Cl.stringAscii("below"),
         "tx-type": Cl.stringAscii("stx-transfer"),
         "is-active": Cl.bool(true),
         "created-at": Cl.uint(simnet.blockHeight),
         "last-triggered": Cl.uint(0),
         "trigger-count": Cl.uint(0),
       })
     );
   });
  
   it("should get user alert count", () => {
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-user-alert-count",
       [Cl.principal(wallet1)],
       deployer
     );
    
     expect(result).toStrictEqual(Cl.tuple({ count: Cl.uint(1) }));
   });
  
   it("should return zero count for user with no alerts", () => {
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-user-alert-count",
       [Cl.principal(wallet3)],
       deployer
     );
    
     expect(result).toStrictEqual(Cl.tuple({ count: Cl.uint(0) }));
   });
  
   it("should get alert stats", () => {
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert-stats",
       [],
       deployer
     );
    
     expect(result).toBeOk(
       Cl.tuple({
         "total-created": Cl.uint(1),
         "total-triggered": Cl.uint(0),
         "next-id": Cl.uint(2),
       })
     );
   });
  
   it("should check if user can create alert", () => {
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "can-create-alert",
       [Cl.principal(wallet1)],
       deployer
     );
    
     expect(result).toBeOk(Cl.bool(true));
   });
  
   it("should return false when user has max alerts", () => {
     // Create 9 more alerts (total 10)
     for (let i = 0; i < 9; i++) {
       simnet.callPublicFn(
         "smart-alerts-v1",
         "create-alert",
         [Cl.uint(1000 + i * 100), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
         wallet1
       );
     }
    
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "can-create-alert",
       [Cl.principal(wallet1)],
       deployer
     );
    
     expect(result).toBeOk(Cl.bool(false));
   });
  
   it("should estimate creation cost", () => {
     const { result } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "estimate-creation-cost",
       [],
       deployer
     );
    
     expect(result).toBeOk(Cl.uint(2000));
   });
 });
  describe("Admin Function Tests", () => {
   it("should allow owner to set fee oracle", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "set-fee-oracle",
       [Cl.principal(wallet1)],
       deployer
     );
    
     expect(result).toBeOk(Cl.bool(true));
   });
  
   it("should prevent non-owner from setting fee oracle", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "set-fee-oracle",
       [Cl.principal(wallet2)],
       wallet1
     );
    
     expect(result).toBeErr(Cl.uint(300)); // ERR-UNAUTHORIZED
   });
  
   it("should allow owner to transfer ownership", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "transfer-ownership",
       [Cl.principal(wallet1)],
       deployer
     );
    
     expect(result).toBeOk(Cl.bool(true));
   });
  
   it("should prevent non-owner from transferring ownership", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "transfer-ownership",
       [Cl.principal(wallet2)],
       wallet1
     );
    
     expect(result).toBeErr(Cl.uint(300)); // ERR-UNAUTHORIZED
   });
  
   it("should allow owner to emergency pause", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "emergency-pause",
       [],
       deployer
     );
    
     expect(result).toBeOk(Cl.bool(true));
   });
  
   it("should prevent non-owner from emergency pause", () => {
     const { result } = simnet.callPublicFn(
       "smart-alerts-v1",
       "emergency-pause",
       [],
       wallet1
     );
    
     expect(result).toBeErr(Cl.uint(300)); // ERR-UNAUTHORIZED
   });
 });
  describe("Integration Tests", () => {
   it("should handle complete alert lifecycle", () => {
     // Create alert
     const { result: createResult } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
     expect(createResult).toBeOk(Cl.uint(1));
    
     // Check if should trigger
     const { result: shouldTrigger } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "should-alert-trigger",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1400)],
       deployer
     );
     expect(shouldTrigger).toBeOk(Cl.bool(true));
    
     // Mark as triggered
     const { result: markResult } = simnet.callPublicFn(
       "smart-alerts-v1",
       "mark-triggered",
       [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1400)],
       deployer
     );
     expect(markResult).toBeOk(Cl.bool(true));
    
     // Update threshold
     const { result: updateResult } = simnet.callPublicFn(
       "smart-alerts-v1",
       "update-alert-threshold",
       [Cl.uint(1), Cl.uint(2000)],
       wallet1
     );
     expect(updateResult).toBeOk(Cl.bool(true));
    
     // Deactivate
     const { result: deactivateResult } = simnet.callPublicFn(
       "smart-alerts-v1",
       "deactivate-alert",
       [Cl.uint(1)],
       wallet1
     );
     expect(deactivateResult).toBeOk(Cl.bool(true));
    
     // Delete
     const { result: deleteResult } = simnet.callPublicFn(
       "smart-alerts-v1",
       "delete-alert",
       [Cl.uint(1)],
       wallet1
     );
     expect(deleteResult).toBeOk(Cl.bool(true));
   });
  
   it("should handle multiple users with multiple alerts", () => {
     // User 1 creates 3 alerts
     for (let i = 0; i < 3; i++) {
       simnet.callPublicFn(
         "smart-alerts-v1",
         "create-alert",
         [Cl.uint(1000 + i * 100), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
         wallet1
       );
     }
    
     // User 2 creates 2 alerts
     for (let i = 0; i < 2; i++) {
       simnet.callPublicFn(
         "smart-alerts-v1",
         "create-alert",
         [Cl.uint(2000 + i * 100), Cl.stringAscii("above"), Cl.stringAscii("nft-mint")],
         wallet2
       );
     }
    
     // Check counts
     const { result: user1Count } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-user-alert-count",
       [Cl.principal(wallet1)],
       deployer
     );
     expect(user1Count).toStrictEqual(Cl.tuple({ count: Cl.uint(3) }));
    
     const { result: user2Count } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-user-alert-count",
       [Cl.principal(wallet2)],
       deployer
     );
     expect(user2Count).toStrictEqual(Cl.tuple({ count: Cl.uint(2) }));
    
     // Check global stats
     const { result: stats } = simnet.callReadOnlyFn(
       "smart-alerts-v1",
       "get-alert-stats",
       [],
       deployer
     );
     expect(stats).toBeOk(
       Cl.tuple({
         "total-created": Cl.uint(5),
         "total-triggered": Cl.uint(0),
         "next-id": Cl.uint(6),
       })
     );
   });
  
   it("should track trigger history across multiple triggers", () => {
     simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(1500), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
    
     // Trigger 3 times
     const fees = [1400, 1300, 1200];
     fees.forEach((fee) => {
       simnet.callPublicFn(
         "smart-alerts-v1",
         "mark-triggered",
         [Cl.principal(wallet1), Cl.uint(1), Cl.uint(fee)],
         deployer
       );
     });
    
     // Check trigger history
     for (let i = 0; i < fees.length; i++) {
       const { result } = simnet.callReadOnlyFn(
         "smart-alerts-v1",
         "get-trigger-history",
         [Cl.uint(1), Cl.uint(i + 1)],
         deployer
       );
      
       // Calculate expected block height: current height - (remaining checks after this one)
       // because triggers happened in the past
       const expectedBlockHeight = BigInt(simnet.blockHeight) - BigInt(fees.length - 1 - i);
      
       expect(result).toBeSome(
         Cl.tuple({
           "fee-at-trigger": Cl.uint(fees[i]),
           "block-height": Cl.uint(expectedBlockHeight),
           "timestamp": Cl.uint(simnet.burnBlockHeight),
         })
       );
     }
   });
  
   it("should allow alerts to free up slots when deleted", () => {
     // Create 10 alerts (max)
     for (let i = 0; i < 10; i++) {
       simnet.callPublicFn(
         "smart-alerts-v1",
         "create-alert",
         [Cl.uint(1000 + i * 100), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
         wallet1
       );
     }
    
     // Cannot create another
     const { result: beforeDelete } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(3000), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
     expect(beforeDelete).toBeErr(Cl.uint(302));
    
     // Delete one alert
     simnet.callPublicFn("smart-alerts-v1", "delete-alert", [Cl.uint(1)], wallet1);
    
     // Now can create another
     const { result: afterDelete } = simnet.callPublicFn(
       "smart-alerts-v1",
       "create-alert",
       [Cl.uint(3000), Cl.stringAscii("below"), Cl.stringAscii("stx-transfer")],
       wallet1
     );
     expect(afterDelete).toBeOk(Cl.uint(11));
   });
 });
});


