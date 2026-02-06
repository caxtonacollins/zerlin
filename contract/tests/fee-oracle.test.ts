import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

// simnet is available globally from vitest-environment-clarinet
declare const simnet: any;

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("Fee Oracle Contract Tests", () => {

    describe("Initialization Tests", () => {
        it("should initialize with valid fee rate", () => {
            const initialFeeRate = 1000;
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "initialize",
                [Cl.uint(initialFeeRate)],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));

            // Verify initialization state
            const { result: feeRate } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-current-fee-rate",
                [],
                deployer
            );
            expect(feeRate).toBeOk(Cl.uint(initialFeeRate));

            const { result: isInitialized } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "is-oracle-initialized",
                [],
                deployer
            );
            expect(isInitialized).toBeOk(Cl.bool(true));
        });

        it("should prevent double initialization", () => {
            simnet.callPublicFn("fee-oracle-v1", "initialize", [Cl.uint(1000)], deployer);

            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "initialize",
                [Cl.uint(2000)],
                deployer
            );

            expect(result).toBeErr(Cl.uint(103)); // ERR-ALREADY-INITIALIZED
        });

        it("should prevent non-owner from initializing", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "initialize",
                [Cl.uint(1000)],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(100)); // ERR-UNAUTHORIZED
        });

        it("should reject zero fee rate", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "initialize",
                [Cl.uint(0)],
                deployer
            );

            expect(result).toBeErr(Cl.uint(101)); // ERR-INVALID-FEE
        });
    });

    describe("Read-Only Function Tests", () => {
        beforeEach(() => {
            simnet.callPublicFn("fee-oracle-v1", "initialize", [Cl.uint(1500)], deployer);
        });

        it("should get current fee rate", () => {
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-current-fee-rate",
                [],
                deployer
            );

            expect(result).toBeOk(Cl.uint(1500));
        });

        it("should get last update block", () => {
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-last-update-block",
                [],
                deployer
            );

            expect(result).toBeOk(Cl.uint(simnet.blockHeight));
        });

        it("should get total updates", () => {
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-total-updates",
                [],
                deployer
            );

            expect(result).toBeOk(Cl.uint(1)); // Initialized once
        });

        it("should check initialization status", () => {
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "is-oracle-initialized",
                [],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should get fee at specific block", () => {
            const currentBlock = simnet.blockHeight;

            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-fee-at-block",
                [Cl.uint(currentBlock)],
                deployer
            );

            expect(result).toBeOk(
                Cl.tuple({
                    "fee-rate": Cl.uint(1500),
                    "timestamp": Cl.uint(simnet.burnBlockHeight),
                    "network-congestion": Cl.stringAscii("medium"),
                    "recorded-by": Cl.principal(deployer),
                })
            );
        });

        it("should return error for non-existent block", () => {
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-fee-at-block",
                [Cl.uint(999999)],
                deployer
            );

            expect(result).toBeErr(Cl.uint(102)); // ERR-INVALID-BLOCK
        });

        it("should get transaction average when exists", () => {
            // First set an average
            simnet.callPublicFn("fee-oracle-v1", "authorize-oracle", [Cl.principal(deployer)], deployer);
            simnet.callPublicFn(
                "fee-oracle-v1",
                "update-transaction-average",
                [Cl.stringAscii("nft-mint"), Cl.uint(5000)],
                deployer
            );

            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-transaction-average",
                [Cl.stringAscii("nft-mint")],
                deployer
            );

            expect(result).toBeOk(Cl.uint(5000));
        });

        it("should return 0 for non-existent transaction average", () => {
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-transaction-average",
                [Cl.stringAscii("unknown-tx-type")],
                deployer
            );

            expect(result).toBeOk(Cl.uint(0));
        });

        it("should get fee summary", () => {
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-fee-summary",
                [],
                deployer
            );

            expect(result).toBeOk(
                Cl.tuple({
                    "current-fee": Cl.uint(1500),
                    "last-update-block": Cl.uint(simnet.blockHeight),
                    "total-updates": Cl.uint(1),
                    "is-initialized": Cl.bool(true),
                })
            );
        });

        it("should get recommended buffer (2x current fee)", () => {
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-recommended-buffer",
                [],
                deployer
            );

            expect(result).toBeOk(Cl.uint(3000)); // 1500 * 2
        });

        it("should check if address is authorized oracle", () => {
            // Deployer is authorized during initialization
            const { result: deployerAuth } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "is-authorized-oracle",
                [Cl.principal(deployer)],
                deployer
            );
            expect(deployerAuth).toBeOk(Cl.bool(true));

            // Other addresses are not authorized
            const { result: wallet1Auth } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "is-authorized-oracle",
                [Cl.principal(wallet1)],
                deployer
            );
            expect(wallet1Auth).toBeOk(Cl.bool(false));
        });
    });

    describe("Fee Estimation Tests", () => {
        beforeEach(() => {
            simnet.callPublicFn("fee-oracle-v1", "initialize", [Cl.uint(2)], deployer);
        });

        it("should estimate transfer fee (180 bytes * fee rate)", () => {
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "estimate-transfer-fee",
                [],
                deployer
            );

            expect(result).toBeOk(Cl.uint(360)); // 180 * 2
        });

        it("should estimate contract call fee with varying complexity", () => {
            // Complexity 1
            const { result: low } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "estimate-contract-call-fee",
                [Cl.uint(1)],
                deployer
            );
            expect(low).toBeOk(Cl.uint(600)); // (250 + 1*50) * 2

            // Complexity 5
            const { result: medium } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "estimate-contract-call-fee",
                [Cl.uint(5)],
                deployer
            );
            expect(medium).toBeOk(Cl.uint(1000)); // (250 + 5*50) * 2

            // Complexity 10
            const { result: high } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "estimate-contract-call-fee",
                [Cl.uint(10)],
                deployer
            );
            expect(high).toBeOk(Cl.uint(1500)); // (250 + 10*50) * 2
        });

        it("should estimate NFT mint fee with fallback", () => {
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "estimate-nft-mint-fee",
                [],
                deployer
            );

            // Should use fallback since no average data exists
            expect(result).toBeOk(Cl.uint(900)); // 450 * 2
        });

        it("should estimate NFT mint fee with historical average", () => {
            // Set up transaction average
            simnet.callPublicFn("fee-oracle-v1", "authorize-oracle", [Cl.principal(deployer)], deployer);
            simnet.callPublicFn(
                "fee-oracle-v1",
                "update-transaction-average",
                [Cl.stringAscii("nft-mint"), Cl.uint(8000)],
                deployer
            );

            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "estimate-nft-mint-fee",
                [],
                deployer
            );

            expect(result).toBeOk(Cl.uint(8000));
        });

        it("should estimate swap fee for DEX", () => {
            // Without historical data
            const { result: fallback } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "estimate-swap-fee",
                [Cl.stringAscii("dex-swap-alex")],
                deployer
            );
            expect(fallback).toBeOk(Cl.uint(1000)); // 500 * 2

            // With historical data
            simnet.callPublicFn("fee-oracle-v1", "authorize-oracle", [Cl.principal(deployer)], deployer);
            simnet.callPublicFn(
                "fee-oracle-v1",
                "update-transaction-average",
                [Cl.stringAscii("dex-swap-alex"), Cl.uint(7500)],
                deployer
            );

            const { result: withData } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "estimate-swap-fee",
                [Cl.stringAscii("dex-swap-alex")],
                deployer
            );
            expect(withData).toBeOk(Cl.uint(7500));
        });

        it("should check sufficient balance - sufficient case", () => {
            const userBalance = simnet.getAssetsMap().get("STX")?.get(wallet1) || 0n;
            const requiredFee = 1000;

            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "check-sufficient-balance",
                [Cl.principal(wallet1), Cl.uint(requiredFee)],
                deployer
            );

            expect(result).toBeOk(Cl.bool(Number(userBalance) >= requiredFee));
        });

        it("should check sufficient balance - insufficient case", () => {
            const userBalance = simnet.getAssetsMap().get("STX")?.get(wallet1) || 0n;
            const requiredFee = Number(userBalance) + 1000000;

            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "check-sufficient-balance",
                [Cl.principal(wallet1), Cl.uint(requiredFee)],
                deployer
            );

            expect(result).toBeOk(Cl.bool(false));
        });
    });

    describe("Oracle Update Tests", () => {
        beforeEach(() => {
            simnet.callPublicFn("fee-oracle-v1", "initialize", [Cl.uint(1000)], deployer);
            simnet.callPublicFn("fee-oracle-v1", "authorize-oracle", [Cl.principal(wallet1)], deployer);
        });

        it("should allow authorized oracle to update fee rate", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "update-fee-rate",
                [Cl.uint(2000), Cl.stringAscii("high")],
                wallet1
            );

            expect(result).toBeOk(Cl.bool(true));

            // Verify update
            const { result: newFee } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-current-fee-rate",
                [],
                deployer
            );
            expect(newFee).toBeOk(Cl.uint(2000));

            // Verify total updates incremented
            const { result: totalUpdates } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-total-updates",
                [],
                deployer
            );
            expect(totalUpdates).toBeOk(Cl.uint(2)); // 1 from init + 1 from update
        });

        it("should prevent unauthorized user from updating fee rate", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "update-fee-rate",
                [Cl.uint(2000), Cl.stringAscii("high")],
                wallet2
            );

            expect(result).toBeErr(Cl.uint(100)); // ERR-UNAUTHORIZED
        });

        it("should reject zero fee rate update", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "update-fee-rate",
                [Cl.uint(0), Cl.stringAscii("low")],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(101)); // ERR-INVALID-FEE
        });

        it("should update with different congestion levels", () => {
            const congestionLevels = ["low", "medium", "high"];

            congestionLevels.forEach((congestion, index) => {
                const feeRate = 1000 + (index * 500);
                const { result } = simnet.callPublicFn(
                    "fee-oracle-v1",
                    "update-fee-rate",
                    [Cl.uint(feeRate), Cl.stringAscii(congestion)],
                    wallet1
                );

                expect(result).toBeOk(Cl.bool(true));
            });
        });

        it("should update transaction average", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "update-transaction-average",
                [Cl.stringAscii("ft-transfer"), Cl.uint(3000)],
                wallet1
            );

            expect(result).toBeOk(Cl.bool(true));

            // Verify average is set
            const { result: avg } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-transaction-average",
                [Cl.stringAscii("ft-transfer")],
                deployer
            );
            expect(avg).toBeOk(Cl.uint(3000));
        });

        it("should calculate rolling average correctly", () => {
            // First update
            simnet.callPublicFn(
                "fee-oracle-v1",
                "update-transaction-average",
                [Cl.stringAscii("test-tx"), Cl.uint(1000)],
                wallet1
            );

            // Second update
            simnet.callPublicFn(
                "fee-oracle-v1",
                "update-transaction-average",
                [Cl.stringAscii("test-tx"), Cl.uint(2000)],
                wallet1
            );

            // Average should be (1000 + 2000) / 2 = 1500
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-transaction-average",
                [Cl.stringAscii("test-tx")],
                deployer
            );
            expect(result).toBeOk(Cl.uint(1500));
        });

        it("should prevent unauthorized user from updating transaction average", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "update-transaction-average",
                [Cl.stringAscii("test-tx"), Cl.uint(3000)],
                wallet2
            );

            expect(result).toBeErr(Cl.uint(100)); // ERR-UNAUTHORIZED
        });

        it("should reject zero observed fee", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "update-transaction-average",
                [Cl.stringAscii("test-tx"), Cl.uint(0)],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(101)); // ERR-INVALID-FEE
        });

        it("should batch update averages", () => {
            const updates = Cl.list([
                Cl.tuple({
                    "tx-type": Cl.stringAscii("swap-1"),
                    "observed-fee": Cl.uint(5000),
                }),
                Cl.tuple({
                    "tx-type": Cl.stringAscii("swap-2"),
                    "observed-fee": Cl.uint(6000),
                }),
            ]);

            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "batch-update-averages",
                [updates],
                wallet1
            );

            expect(result).toBeOk(Cl.list([Cl.bool(true), Cl.bool(true)]));

            // Verify both were updated
            const { result: swap1 } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-transaction-average",
                [Cl.stringAscii("swap-1")],
                deployer
            );
            expect(swap1).toBeOk(Cl.uint(5000));

            const { result: swap2 } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-transaction-average",
                [Cl.stringAscii("swap-2")],
                deployer
            );
            expect(swap2).toBeOk(Cl.uint(6000));
        });

        it("should prevent unauthorized batch updates", () => {
            const updates = Cl.list([
                Cl.tuple({
                    "tx-type": Cl.stringAscii("swap-1"),
                    "observed-fee": Cl.uint(5000),
                }),
            ]);

            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "batch-update-averages",
                [updates],
                wallet2
            );

            expect(result).toBeErr(Cl.uint(100)); // ERR-UNAUTHORIZED
        });
    });

    describe("Admin Function Tests", () => {
        beforeEach(() => {
            simnet.callPublicFn("fee-oracle-v1", "initialize", [Cl.uint(1000)], deployer);
        });

        it("should allow owner to transfer ownership", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "transfer-ownership",
                [Cl.principal(wallet1)],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should prevent non-owner from transferring ownership", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "transfer-ownership",
                [Cl.principal(wallet2)],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(100)); // ERR-UNAUTHORIZED
        });

        it("should allow owner to authorize oracle", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "authorize-oracle",
                [Cl.principal(wallet2)],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));

            // Verify authorization
            const { result: isAuth } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "is-authorized-oracle",
                [Cl.principal(wallet2)],
                deployer
            );
            expect(isAuth).toBeOk(Cl.bool(true));
        });

        it("should allow owner to revoke oracle", () => {
            // First authorize
            simnet.callPublicFn("fee-oracle-v1", "authorize-oracle", [Cl.principal(wallet2)], deployer);

            // Then revoke
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "revoke-oracle",
                [Cl.principal(wallet2)],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));

            // Verify revocation
            const { result: isAuth } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "is-authorized-oracle",
                [Cl.principal(wallet2)],
                deployer
            );
            expect(isAuth).toBeOk(Cl.bool(false));
        });

        it("should prevent non-owner from authorizing oracle", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "authorize-oracle",
                [Cl.principal(wallet3)],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(100)); // ERR-UNAUTHORIZED
        });

        it("should prevent non-owner from revoking oracle", () => {
            const { result } = simnet.callPublicFn(
                "fee-oracle-v1",
                "revoke-oracle",
                [Cl.principal(deployer)],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(100)); // ERR-UNAUTHORIZED
        });
    });

    describe("Edge Cases and Integration", () => {
        it("should handle multiple oracles updating independently", () => {
            simnet.callPublicFn("fee-oracle-v1", "initialize", [Cl.uint(1000)], deployer);
            simnet.callPublicFn("fee-oracle-v1", "authorize-oracle", [Cl.principal(wallet1)], deployer);
            simnet.callPublicFn("fee-oracle-v1", "authorize-oracle", [Cl.principal(wallet2)], deployer);

            // Both oracles update
            simnet.callPublicFn(
                "fee-oracle-v1",
                "update-fee-rate",
                [Cl.uint(1500), Cl.stringAscii("medium")],
                wallet1
            );

            simnet.callPublicFn(
                "fee-oracle-v1",
                "update-fee-rate",
                [Cl.uint(2000), Cl.stringAscii("high")],
                wallet2
            );

            // Latest update should be 2000
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-current-fee-rate",
                [],
                deployer
            );
            expect(result).toBeOk(Cl.uint(2000));

            // Total updates should be 3 (init + 2 updates)
            const { result: totalUpdates } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-total-updates",
                [],
                deployer
            );
            expect(totalUpdates).toBeOk(Cl.uint(3));
        });

        it("should preserve historical data across updates", () => {
            simnet.callPublicFn("fee-oracle-v1", "initialize", [Cl.uint(1000)], deployer);
            const initBlock = simnet.blockHeight;

            simnet.callPublicFn("fee-oracle-v1", "authorize-oracle", [Cl.principal(wallet1)], deployer);
            simnet.mineBlock([]);

            simnet.callPublicFn(
                "fee-oracle-v1",
                "update-fee-rate",
                [Cl.uint(2000), Cl.stringAscii("high")],
                wallet1
            );

            // Check historical data at init block
            const { result } = simnet.callReadOnlyFn(
                "fee-oracle-v1",
                "get-fee-at-block",
                [Cl.uint(initBlock)],
                deployer
            );

            expect(result).toBeOk(
                Cl.tuple({
                    "fee-rate": Cl.uint(1000),
                    "timestamp": Cl.uint(simnet.burnBlockHeight),
                    "network-congestion": Cl.stringAscii("medium"),
                    "recorded-by": Cl.principal(deployer),
                })
            );
        });

        it("should handle rolling average with multiple samples correctly", () => {
            simnet.callPublicFn("fee-oracle-v1", "initialize", [Cl.uint(1000)], deployer);
            simnet.callPublicFn("fee-oracle-v1", "authorize-oracle", [Cl.principal(deployer)], deployer);

          const samples = [1000, 2000, 3000, 4000, 5000];
          samples.forEach(fee => {
              simnet.callPublicFn(
                  "fee-oracle-v1",
                  "update-transaction-average",
                  [Cl.stringAscii("multi-sample"), Cl.uint(fee)],
                  deployer
              );
          });

          // Average should be (1000+2000+3000+4000+5000)/5 = 3000
          const { result } = simnet.callReadOnlyFn(
              "fee-oracle-v1",
              "get-transaction-average",
              [Cl.stringAscii("multi-sample")],
              deployer
          );
          expect(result).toBeOk(Cl.uint(3000));
      });
    });
});
