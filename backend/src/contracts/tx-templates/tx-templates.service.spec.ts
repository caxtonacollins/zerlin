import { Test, TestingModule } from '@nestjs/testing';
import { TxTemplatesService } from './tx-templates.service';
import { StacksService } from '../../stacks/stacks.service';
import { ConfigService } from '@nestjs/config';
import { STACKS_TESTNET } from '@stacks/network';

// Mock @stacks/transactions
jest.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: jest.fn(),
  cvToJSON: jest.fn(),
  stringAsciiCV: jest.fn().mockImplementation((val) => ({ type: 'string-ascii', value: val })),
  uintCV: jest.fn().mockImplementation((val) => ({ type: 'uint', value: val })),
  standardPrincipalCV: jest.fn().mockImplementation((val) => ({ type: 'principal', value: val })),
}));

import { fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';

describe('TxTemplatesService', () => {
  let service: TxTemplatesService;
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
        TxTemplatesService,
        { provide: StacksService, useValue: mockStacksService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TxTemplatesService>(TxTemplatesService);
    stacksService = module.get<StacksService>(StacksService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeTemplates', () => {
    it('should broadcast contract call to initialize templates', async () => {
      const txid = '0x111';
      (stacksService.broadcastContractCall as jest.Mock).mockResolvedValue(txid);

      const result = await service.initializeTemplates();
      expect(result).toBe(txid);
      expect(stacksService.broadcastContractCall).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'initialize-templates',
        []
      );
    });
  });

  describe('createTemplate', () => {
    it('should broadcast contract call to create template', async () => {
      const txid = '0x222';
      (stacksService.broadcastContractCall as jest.Mock).mockResolvedValue(txid);

      const result = await service.createTemplate('test-id', 100, 1000, 'desc', 'cat');
      expect(result).toBe(txid);
      expect(stacksService.broadcastContractCall).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'create-template',
        expect.arrayContaining([expect.anything(), expect.anything(), expect.anything()])
      );
    });
  });

  describe('updateTemplate', () => {
    it('should broadcast contract call to update template', async () => {
      const txid = '0x333';
      (stacksService.broadcastContractCall as jest.Mock).mockResolvedValue(txid);

      const result = await service.updateTemplate('test-id', 200, 2000);
      expect(result).toBe(txid);
      expect(stacksService.broadcastContractCall).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'update-template',
        expect.arrayContaining([expect.anything(), expect.anything(), expect.anything()])
      );
    });
  });

  describe('setFeeOracle', () => {
    it('should broadcast contract call to set fee oracle', async () => {
      const txid = '0x444';
      (stacksService.broadcastContractCall as jest.Mock).mockResolvedValue(txid);

      const result = await service.setFeeOracle('ST123...');
      expect(result).toBe(txid);
      expect(stacksService.broadcastContractCall).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'set-fee-oracle',
        expect.arrayContaining([expect.anything()])
      );
    });
  });

  describe('getTemplate', () => {
    it('should return template data', async () => {
      (fetchCallReadOnlyFunction as jest.Mock).mockResolvedValue({});
      (cvToJSON as jest.Mock).mockReturnValue({ value: { 'avg-gas-units': 500 } });

      const template = await service.getTemplate('stx-transfer');
      expect(template).toEqual({ 'avg-gas-units': 500 });
      expect(fetchCallReadOnlyFunction).toHaveBeenCalledWith(expect.objectContaining({
          functionArgs: expect.any(Array) 
      }));
    });
  });

  describe('getFullEstimate', () => {
      it('should return full estimate', async () => {
          (fetchCallReadOnlyFunction as jest.Mock).mockResolvedValue({});
          (cvToJSON as jest.Mock).mockReturnValue({ 
              value: { 
                  template: 'sbtc-peg-in',
                  'estimated-fee-micro-stx': 1000 
              } 
          });

          const estimate = await service.getFullEstimate('sbtc-peg-in');
          expect(estimate['estimated-fee-micro-stx']).toBe(1000);
      });
  });
});
