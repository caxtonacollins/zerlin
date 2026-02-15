import { Test, TestingModule } from '@nestjs/testing';
import { FeeOracleService } from './fee-oracle.service';
import { StacksService } from '../../stacks/stacks.service';
import { ConfigService } from '@nestjs/config';
import { STACKS_TESTNET } from '@stacks/network';

// Mock @stacks/transactions
jest.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: jest.fn(),
  cvToJSON: jest.fn(),
  standardPrincipalCV: jest.fn(),
  uintCV: jest.fn(),
  stringAsciiCV: jest.fn(),
}));

import { fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';

describe('FeeOracleService', () => {
  let service: FeeOracleService;
  let stacksService: StacksService;

  const mockStacksService = {
    getNetwork: jest.fn().mockReturnValue(STACKS_TESTNET),
    broadcastContractCall: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeeOracleService,
        { provide: StacksService, useValue: mockStacksService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<FeeOracleService>(FeeOracleService);
    stacksService = module.get<StacksService>(StacksService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFeeRate', () => {
    it('should return the current fee rate', async () => {
      (fetchCallReadOnlyFunction as jest.Mock).mockResolvedValue({});
      (cvToJSON as jest.Mock).mockReturnValue({ value: '100' });

      const rate = await service.getFeeRate();
      expect(rate).toBe(100);
      expect(fetchCallReadOnlyFunction).toHaveBeenCalledWith(expect.objectContaining({
        functionName: 'get-current-fee-rate',
      }));
    });

    it('should handle errors', async () => {
      (fetchCallReadOnlyFunction as jest.Mock).mockRejectedValue(new Error('Network error'));
      await expect(service.getFeeRate()).rejects.toThrow('Network error');
    });
  });

  describe('estimateTransferFee', () => {
     it('should return estimated transfer fee', async () => {
         (fetchCallReadOnlyFunction as jest.Mock).mockResolvedValue({});
         (cvToJSON as jest.Mock).mockReturnValue({ value: '500' });

         const fee = await service.estimateTransferFee();
         expect(fee).toBe(500);
         expect(fetchCallReadOnlyFunction).toHaveBeenCalledWith(expect.objectContaining({
             functionName: 'estimate-transfer-fee'
         }));
     });
  });

  describe('estimateContractCallFee', () => {
    it('should return estimated contract call fee', async () => {
      (fetchCallReadOnlyFunction as jest.Mock).mockResolvedValue({});
      (cvToJSON as jest.Mock).mockReturnValue({ value: '1500' });

      const fee = await service.estimateContractCallFee(1);
      expect(fee).toBe(1500);
      expect(fetchCallReadOnlyFunction).toHaveBeenCalledWith(expect.objectContaining({
        functionName: 'estimate-contract-call-fee'
      }));
    });
  });

  describe('estimateNftMintFee', () => {
    it('should return estimated NFT mint fee', async () => {
      (fetchCallReadOnlyFunction as jest.Mock).mockResolvedValue({});
      (cvToJSON as jest.Mock).mockReturnValue({ value: '3000' });

      const fee = await service.estimateNftMintFee();
      expect(fee).toBe(3000);
      expect(fetchCallReadOnlyFunction).toHaveBeenCalledWith(expect.objectContaining({
        functionName: 'estimate-nft-mint-fee'
      }));
    });
  });

  describe('checkSufficientBalance', () => {
      it('should return true if balance is sufficient', async () => {
          (fetchCallReadOnlyFunction as jest.Mock).mockResolvedValue({});
          (cvToJSON as jest.Mock).mockReturnValue({ value: true });

          const result = await service.checkSufficientBalance('ST123...', 1000);
          expect(result).toBe(true);
          expect(fetchCallReadOnlyFunction).toHaveBeenCalledWith(expect.objectContaining({
              functionName: 'check-sufficient-balance'
          }));
      });
  });

  describe('updateFeeRate', () => {
    it('should broadcast contract call to update fee rate', async () => {
      const txid = '0x123';
      (stacksService.broadcastContractCall as jest.Mock).mockResolvedValue(txid);

      const result = await service.updateFeeRate(300, 'low');
      expect(result).toBe(txid);
      expect(stacksService.broadcastContractCall).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'update-fee-rate',
        expect.arrayContaining([expect.anything(), expect.anything()])
      );
    });
  });

  describe('initialize', () => {
    it('should broadcast contract call to initialize oracle', async () => {
      const txid = '0x456';
      (stacksService.broadcastContractCall as jest.Mock).mockResolvedValue(txid);

      const result = await service.initialize(250);
      expect(result).toBe(txid);
      expect(stacksService.broadcastContractCall).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'initialize',
        expect.arrayContaining([expect.anything()])
      );
    });
  });
});
