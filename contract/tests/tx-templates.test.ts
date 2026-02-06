import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

// simnet is available globally from vitest-environment-clarinet
declare const simnet: any;

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Transaction Templates Contract Tests", () => {
  
  describe("Initialization Tests", () => {
    it("should initialize all templates successfully", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "initialize-templates",
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
    
    it("should have correct template count after initialization", () => {
      simnet.callPublicFn("tx-templates-v1", "initialize-templates", [], deployer);
      
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-total-templates",
        [],
        deployer
      );
      
      // Should have 31 templates based on initialization function
      expect(result).toBeOk(Cl.uint(31));
    });
    
    it("should prevent non-owner from initializing", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "initialize-templates",
        [],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(200)); // ERR-UNAUTHORIZED
    });
    
    it("should populate category counts correctly", () => {
      simnet.callPublicFn("tx-templates-v1", "initialize-templates", [], deployer);
      
      // Check various category counts
      const { result: transferCount } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-category-count",
        [Cl.stringAscii("transfer")],
        deployer
      );
      expect(transferCount).toBeOk(Cl.uint(2)); // stx-transfer, stx-transfer-memo
      
      const { result: dexCount } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-category-count",
        [Cl.stringAscii("dex")],
        deployer
      );
      expect(dexCount).toBeOk(Cl.uint(5)); // 5 DEX operations
    });
  });
  
  describe("Template Retrieval Tests", () => {
    beforeEach(() => {
      simnet.callPublicFn("tx-templates-v1", "initialize-templates", [], deployer);
    });
    
    it("should get template by ID - stx-transfer", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template",
        [Cl.stringAscii("stx-transfer")],
        deployer
      );
      
      expect(result).toBeSome(
        Cl.tuple({
          "avg-gas-units": Cl.uint(1000),
          "avg-size-bytes": Cl.uint(180),
          "description": Cl.stringAscii("Simple STX transfer"),
          "category": Cl.stringAscii("transfer"),
          "last-updated": Cl.uint(simnet.blockHeight),
          "sample-count": Cl.uint(1),
        })
      );
    });
    
    it("should get template by ID - nft-mint", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template",
        [Cl.stringAscii("nft-mint")],
        deployer
      );
      
      expect(result).toBeSome(
        Cl.tuple({
          "avg-gas-units": Cl.uint(5500),
          "avg-size-bytes": Cl.uint(450),
          "description": Cl.stringAscii("Mint NFT"),
          "category": Cl.stringAscii("nft"),
          "last-updated": Cl.uint(simnet.blockHeight),
          "sample-count": Cl.uint(1),
        })
      );
    });
    
    it("should return none for non-existent template", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template",
        [Cl.stringAscii("non-existent-template")],
        deployer
      );
      
      expect(result).toBeNone();
    });
    
    it("should get template gas units", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template-gas",
        [Cl.stringAscii("dex-swap-alex")],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(3950));
    });
    
    it("should return error for non-existent template gas", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template-gas",
        [Cl.stringAscii("non-existent")],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(201)); // ERR-TEMPLATE-NOT-FOUND
    });
    
    it("should get template size", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template-size",
        [Cl.stringAscii("ft-transfer")],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(300));
    });
    
    it("should get full estimate", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-full-estimate",
        [Cl.stringAscii("nft-transfer")],
        deployer
      );
      
      expect(result).toBeOk(
        Cl.tuple({
          "template": Cl.stringAscii("nft-transfer"),
          "gas-units": Cl.uint(4000),
          "size-bytes": Cl.uint(400),
          "description": Cl.stringAscii("Transfer NFT"),
          "category": Cl.stringAscii("nft"),
          "estimated-fee-micro-stx": Cl.uint(800), // 400 * 2
        })
      );
    });
  });
  
  describe("Template Comparison Tests", () => {
    beforeEach(() => {
      simnet.callPublicFn("tx-templates-v1", "initialize-templates", [], deployer);
    });
    
    it("should compare two templates and identify cheaper", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "compare-templates",
        [Cl.stringAscii("dex-swap-alex"), Cl.stringAscii("dex-swap-bitflow")],
        deployer
      );
      
      // ALEX (500 bytes) should be cheaper than Bitflow (550 bytes)
      expect(result).toBeOk(
        Cl.tuple({
          "template-1": Cl.stringAscii("dex-swap-alex"),
          "gas-1": Cl.uint(3950),
          "size-1": Cl.uint(500),
          "template-2": Cl.stringAscii("dex-swap-bitflow"),
          "gas-2": Cl.uint(4200),
          "size-2": Cl.uint(550),
          "cheaper": Cl.stringAscii("dex-swap-alex"),
        })
      );
    });
    
    it("should handle comparison with identical templates", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "compare-templates",
        [Cl.stringAscii("stx-transfer"), Cl.stringAscii("stx-transfer")],
        deployer
      );
      
      expect(result).toBeOk(
        Cl.tuple({
          "template-1": Cl.stringAscii("stx-transfer"),
          "gas-1": Cl.uint(1000),
          "size-1": Cl.uint(180),
          "template-2": Cl.stringAscii("stx-transfer"),
          "gas-2": Cl.uint(1000),
          "size-2": Cl.uint(180),
          "cheaper": Cl.stringAscii("stx-transfer"),
        })
      );
    });
    
    it("should return error when comparing with non-existent template", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "compare-templates",
        [Cl.stringAscii("stx-transfer"), Cl.stringAscii("non-existent")],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(201)); // ERR-TEMPLATE-NOT-FOUND
    });
  });
  
  describe("Category Tests", () => {
    beforeEach(() => {
      simnet.callPublicFn("tx-templates-v1", "initialize-templates", [], deployer);
    });
    
    it("should get category count for transfer", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-category-count",
        [Cl.stringAscii("transfer")],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(2));
    });
    
    it("should get category count for dex", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-category-count",
        [Cl.stringAscii("dex")],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(5));
    });
    
    it("should get category count for nft", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-category-count",
        [Cl.stringAscii("nft")],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(4));
    });
    
    it("should return 0 for non-existent category", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-category-count",
        [Cl.stringAscii("unknown-category")],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(0));
    });
    
    it("should get total templates", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-total-templates",
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(31));
    });
    
    it("should get cheapest DEX swap", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-cheapest-dex-swap",
        [],
        deployer
      );
      
      // ALEX (500 bytes) is cheapest
      expect(result).toBeOk(Cl.stringAscii("dex-swap-alex"));
    });
    
    it("should get sBTC operations", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-sbtc-operations",
        [],
        deployer
      );
      
      const pegIn = Cl.some(
        Cl.tuple({
          "avg-gas-units": Cl.uint(8000),
          "avg-size-bytes": Cl.uint(700),
          "description": Cl.stringAscii("sBTC peg-in (BTC->sBTC)"),
          "category": Cl.stringAscii("sbtc"),
          "last-updated": Cl.uint(simnet.blockHeight),
          "sample-count": Cl.uint(1),
        })
      );
      
      expect(result).toBeOk(
        Cl.tuple({
          "peg-in": pegIn,
          "peg-out": Cl.some(Cl.tuple({
            "avg-gas-units": Cl.uint(8500),
            "avg-size-bytes": Cl.uint(750),
            "description": Cl.stringAscii("sBTC peg-out (sBTC->BTC)"),
            "category": Cl.stringAscii("sbtc"),
            "last-updated": Cl.uint(simnet.blockHeight),
            "sample-count": Cl.uint(1),
          })),
          "transfer": Cl.some(Cl.tuple({
            "avg-gas-units": Cl.uint(2800),
            "avg-size-bytes": Cl.uint(300),
            "description": Cl.stringAscii("Transfer sBTC"),
            "category": Cl.stringAscii("sbtc"),
            "last-updated": Cl.uint(simnet.blockHeight),
            "sample-count": Cl.uint(1),
          })),
        })
      );
    });
    
    it("should get DeFi lending operations", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-defi-lending-operations",
        [],
        deployer
      );
      
      expect(result).toBeOk(
        Cl.tuple({
          "lend": Cl.some(Cl.tuple({
            "avg-gas-units": Cl.uint(7000),
            "avg-size-bytes": Cl.uint(600),
            "description": Cl.stringAscii("Lend assets"),
            "category": Cl.stringAscii("defi"),
            "last-updated": Cl.uint(simnet.blockHeight),
            "sample-count": Cl.uint(1),
          })),
          "borrow": Cl.some(Cl.tuple({
            "avg-gas-units": Cl.uint(7500),
            "avg-size-bytes": Cl.uint(650),
            "description": Cl.stringAscii("Borrow assets"),
            "category": Cl.stringAscii("defi"),
            "last-updated": Cl.uint(simnet.blockHeight),
            "sample-count": Cl.uint(1),
          })),
          "repay": Cl.some(Cl.tuple({
            "avg-gas-units": Cl.uint(6500),
            "avg-size-bytes": Cl.uint(550),
            "description": Cl.stringAscii("Repay loan"),
            "category": Cl.stringAscii("defi"),
            "last-updated": Cl.uint(simnet.blockHeight),
            "sample-count": Cl.uint(1),
          })),
        })
      );
    });
  });
  
  describe("Template Update Tests", () => {
    beforeEach(() => {
      simnet.callPublicFn("tx-templates-v1", "initialize-templates", [], deployer);
    });
    
    it("should update existing template", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "update-template",
        [Cl.stringAscii("stx-transfer"), Cl.uint(190), Cl.uint(1100)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify rolling average - (180*1 + 190*1) / 2 = 185
      const { result: size } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template-size",
        [Cl.stringAscii("stx-transfer")],
        deployer
      );
      expect(size).toBeOk(Cl.uint(185));
      
      // Gas: (1000*1 + 1100*1) / 2 = 1050
      const { result: gas } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template-gas",
        [Cl.stringAscii("stx-transfer")],
        deployer
      );
      expect(gas).toBeOk(Cl.uint(1050));
    });
    
    it("should increment sample count on update", () => {
      simnet.callPublicFn(
        "tx-templates-v1",
        "update-template",
        [Cl.stringAscii("stx-transfer"), Cl.uint(190), Cl.uint(1100)],
        deployer
      );
      
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template",
        [Cl.stringAscii("stx-transfer")],
        deployer
      );
      
      expect(result).toBeSome(
        Cl.tuple({
          "avg-gas-units": Cl.uint(1050),
          "avg-size-bytes": Cl.uint(185),
          "description": Cl.stringAscii("Simple STX transfer"),
          "category": Cl.stringAscii("transfer"),
          "last-updated": Cl.uint(simnet.blockHeight),
          "sample-count": Cl.uint(2),
        })
      );
    });
    
    it("should prevent non-owner from updating template", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "update-template",
        [Cl.stringAscii("stx-transfer"), Cl.uint(190), Cl.uint(1100)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(200)); // ERR-UNAUTHORIZED
    });
    
    it("should return error when updating non-existent template", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "update-template",
        [Cl.stringAscii("non-existent"), Cl.uint(100), Cl.uint(1000)],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(201)); // ERR-TEMPLATE-NOT-FOUND
    });
    
    it("should reject zero gas units", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "update-template",
        [Cl.stringAscii("stx-transfer"), Cl.uint(180), Cl.uint(0)],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(202)); // ERR-INVALID-GAS
    });
    
    it("should reject zero size", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "update-template",
        [Cl.stringAscii("stx-transfer"), Cl.uint(0), Cl.uint(1000)],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(202)); // ERR-INVALID-GAS
    });
    
    it("should calculate rolling average correctly with multiple updates", () => {
      // Initial: 180 bytes
      // Update 1: 200 bytes -> avg = (180 + 200) / 2 = 190
      simnet.callPublicFn(
        "tx-templates-v1",
        "update-template",
        [Cl.stringAscii("stx-transfer"), Cl.uint(200), Cl.uint(1000)],
        deployer
      );
      
      // Update 2: 210 bytes -> avg = (190*2 + 210) / 3 = 196.67 ≈ 196
      simnet.callPublicFn(
        "tx-templates-v1",
        "update-template",
        [Cl.stringAscii("stx-transfer"), Cl.uint(210), Cl.uint(1000)],
        deployer
      );
      
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template-size",
        [Cl.stringAscii("stx-transfer")],
        deployer
      );
      
      // (180 + 200 + 210) / 3 = 196
      expect(result).toBeOk(Cl.uint(196));
    });
  });
  
  describe("Template Creation Tests", () => {
    beforeEach(() => {
      simnet.callPublicFn("tx-templates-v1", "initialize-templates", [], deployer);
    });
    
    it("should create new template", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "create-template",
        [
          Cl.stringAscii("custom-operation"),
          Cl.uint(350),
          Cl.uint(4500),
          Cl.stringAscii("Custom operation"),
          Cl.stringAscii("custom"),
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify template was created
      const { result: template } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template",
        [Cl.stringAscii("custom-operation")],
        deployer
      );
      
      expect(template).toBeSome(
        Cl.tuple({
          "avg-gas-units": Cl.uint(4500),
          "avg-size-bytes": Cl.uint(350),
          "description": Cl.stringAscii("Custom operation"),
          "category": Cl.stringAscii("custom"),
          "last-updated": Cl.uint(simnet.blockHeight),
          "sample-count": Cl.uint(1),
        })
      );
    });
    
    it("should increment total templates count", () => {
      const { result: before } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-total-templates",
        [],
        deployer
      );
      
      simnet.callPublicFn(
        "tx-templates-v1",
        "create-template",
        [
          Cl.stringAscii("new-template"),
          Cl.uint(100),
          Cl.uint(1000),
          Cl.stringAscii("New template"),
          Cl.stringAscii("test"),
        ],
        deployer
      );
      
      const { result: after } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-total-templates",
        [],
        deployer
      );
      
      expect(before).toBeOk(Cl.uint(31));
      expect(after).toBeOk(Cl.uint(32));
    });
    
    it("should update category count on creation", () => {
      const { result: before } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-category-count",
        [Cl.stringAscii("new-category")],
        deployer
      );
      expect(before).toBeOk(Cl.uint(0));
      
      simnet.callPublicFn(
        "tx-templates-v1",
        "create-template",
        [
          Cl.stringAscii("test-template"),
          Cl.uint(100),
          Cl.uint(1000),
          Cl.stringAscii("Test"),
          Cl.stringAscii("new-category"),
        ],
        deployer
      );
      
      const { result: after } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-category-count",
        [Cl.stringAscii("new-category")],
        deployer
      );
      expect(after).toBeOk(Cl.uint(1));
    });
    
    it("should prevent duplicate template creation", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "create-template",
        [
          Cl.stringAscii("stx-transfer"),
          Cl.uint(180),
          Cl.uint(1000),
          Cl.stringAscii("Duplicate"),
          Cl.stringAscii("transfer"),
        ],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(203)); // ERR-TEMPLATE-EXISTS
    });
    
    it("should reject zero gas units", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "create-template",
        [
          Cl.stringAscii("invalid-template"),
          Cl.uint(100),
          Cl.uint(0),
          Cl.stringAscii("Invalid"),
          Cl.stringAscii("test"),
        ],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(202)); // ERR-INVALID-GAS
    });
    
    it("should reject zero size", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "create-template",
        [
          Cl.stringAscii("invalid-template"),
          Cl.uint(0),
          Cl.uint(1000),
          Cl.stringAscii("Invalid"),
          Cl.stringAscii("test"),
        ],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(202)); // ERR-INVALID-GAS
    });
    
    it("should prevent non-owner from creating template", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "create-template",
        [
          Cl.stringAscii("unauthorized"),
          Cl.uint(100),
          Cl.uint(1000),
          Cl.stringAscii("Unauthorized"),
          Cl.stringAscii("test"),
        ],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(200)); // ERR-UNAUTHORIZED
    });
  });
  
  describe("Batch Operations Tests", () => {
    beforeEach(() => {
      simnet.callPublicFn("tx-templates-v1", "initialize-templates", [], deployer);
    });
    
    it("should batch update multiple templates", () => {
      const updates = Cl.list([
        Cl.tuple({
          "template-id": Cl.stringAscii("stx-transfer"),
          "size-bytes": Cl.uint(185),
          "gas-units": Cl.uint(1050),
        }),
        Cl.tuple({
          "template-id": Cl.stringAscii("ft-transfer"),
          "size-bytes": Cl.uint(310),
          "gas-units": Cl.uint(2600),
        }),
      ]);
      
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "batch-update-templates",
        [updates],
        deployer
      );
      
      expect(result).toBeOk(Cl.list([Cl.bool(true), Cl.bool(true)]));
      
      // Verify updates
      const { result: stx } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template-size",
        [Cl.stringAscii("stx-transfer")],
        deployer
      );
      expect(stx).toBeOk(Cl.uint(182)); // (180 + 185) / 2
      
      const { result: ft } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template-gas",
        [Cl.stringAscii("ft-transfer")],
        deployer
      );
      expect(ft).toBeOk(Cl.uint(2550)); // (2500 + 2600) / 2
    });
    
    it("should prevent unauthorized batch updates", () => {
      const updates = Cl.list([
        Cl.tuple({
          "template-id": Cl.stringAscii("stx-transfer"),
          "size-bytes": Cl.uint(185),
          "gas-units": Cl.uint(1050),
        }),
      ]);
      
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "batch-update-templates",
        [updates],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(200)); // ERR-UNAUTHORIZED
    });
    
    it("should handle batch with invalid template gracefully", () => {
      const updates = Cl.list([
        Cl.tuple({
          "template-id": Cl.stringAscii("stx-transfer"),
          "size-bytes": Cl.uint(185),
          "gas-units": Cl.uint(1050),
        }),
        Cl.tuple({
          "template-id": Cl.stringAscii("non-existent"),
          "size-bytes": Cl.uint(100),
          "gas-units": Cl.uint(1000),
        }),
      ]);
      
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "batch-update-templates",
        [updates],
        deployer
      );
      
      // First succeeds, second fails
      expect(result).toBeOk(Cl.list([Cl.bool(true), Cl.bool(false)]));
    });
  });
  
  describe("Admin Function Tests", () => {
    beforeEach(() => {
      simnet.callPublicFn("tx-templates-v1", "initialize-templates", [], deployer);
    });
    
    it("should allow owner to set fee oracle address", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "set-fee-oracle",
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
    
    it("should prevent non-owner from setting fee oracle", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "set-fee-oracle",
        [Cl.principal(wallet2)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(200)); // ERR-UNAUTHORIZED
    });
    
    it("should allow owner to transfer ownership", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "transfer-ownership",
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
    
    it("should prevent non-owner from transferring ownership", () => {
      const { result } = simnet.callPublicFn(
        "tx-templates-v1",
        "transfer-ownership",
        [Cl.principal(wallet2)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(200)); // ERR-UNAUTHORIZED
    });
  });
  
  describe("Fee Estimation Tests", () => {
    beforeEach(() => {
      simnet.callPublicFn("tx-templates-v1", "initialize-templates", [], deployer);
    });
    
    it("should estimate fee for template with custom rate", () => {
      const feeRatePerByte = 3;
      
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "estimate-fee-for-template",
        [Cl.stringAscii("stx-transfer"), Cl.uint(feeRatePerByte)],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(540)); // 180 bytes * 3
    });
    
    it("should estimate fee for NFT mint", () => {
      const feeRatePerByte = 2;
      
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "estimate-fee-for-template",
        [Cl.stringAscii("nft-mint"), Cl.uint(feeRatePerByte)],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(900)); // 450 bytes * 2
    });
    
    it("should estimate fee for DEX swap", () => {
      const feeRatePerByte = 5;
      
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "estimate-fee-for-template",
        [Cl.stringAscii("dex-swap-alex"), Cl.uint(feeRatePerByte)],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(2500)); // 500 bytes * 5
    });
    
    it("should return error for non-existent template", () => {
      const { result } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "estimate-fee-for-template",
        [Cl.stringAscii("non-existent"), Cl.uint(2)],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(201)); // ERR-TEMPLATE-NOT-FOUND
    });
  });
  
  describe("Data Integrity Tests", () => {
    beforeEach(() => {
      simnet.callPublicFn("tx-templates-v1", "initialize-templates", [], deployer);
    });
    
    it("should have realistic values for common operations", () => {
      // STX transfer should be smallest
      const { result: stxSize } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template-size",
        [Cl.stringAscii("stx-transfer")],
        deployer
      );
      expect(stxSize).toBeOk(Cl.uint(180));
      
      // Contract deploy should be largest
      const { result: deploySize } = simnet.callReadOnlyFn(
        "tx-templates-v1",
        "get-template-size",
        [Cl.stringAscii("contract-deploy-medium")],
        deployer
      );
      expect(deploySize).toBeOk(Cl.uint(50000));
    });
    
    it("should have correct category assignments", () => {
      const templates = [
        { id: "stx-transfer", category: "transfer" },
        { id: "dex-swap-alex", category: "dex" },
        { id: "nft-mint", category: "nft" },
        { id: "defi-stake", category: "defi" },
        { id: "sbtc-peg-in", category: "sbtc" },
      ];
      
      templates.forEach(({ id, category }) => {
        const { result } = simnet.callReadOnlyFn(
          "tx-templates-v1",
          "get-template",
          [Cl.stringAscii(id)],
          deployer
        );
        
        const template = result as any;
        if (template.type === 9) { // some type
          expect(template.value.data.category).toStrictEqual(Cl.stringAscii(category));
        }
      });
    });
    
    it("should verify all expected templates exist", () => {
      const expectedTemplates = [
        "stx-transfer",
        "stx-transfer-memo",
        "ft-transfer",
        "ft-mint",
        "ft-burn",
        "nft-mint",
        "nft-transfer",
        "nft-mint-metadata",
        "nft-list-marketplace",
        "dex-swap-alex",
        "dex-swap-bitflow",
        "dex-swap-velar",
        "dex-add-liquidity",
        "dex-remove-liquidity",
        "sbtc-peg-in",
        "sbtc-peg-out",
        "sbtc-transfer",
        "defi-lend",
        "defi-borrow",
        "defi-repay",
        "defi-stake",
        "defi-unstake",
        "multisig-submit",
        "multisig-confirm",
        "multisig-revoke",
      ];
      
      expectedTemplates.forEach(templateId => {
        const { result } = simnet.callReadOnlyFn(
          "tx-templates-v1",
          "get-template",
          [Cl.stringAscii(templateId)],
          deployer
        );
        
        expect(result).not.toBeNone();
      });
    });
  });
});
