import { Test, TestingModule } from '@nestjs/testing';
import { TxTemplatesService } from './tx-templates.service';
import { StacksService } from '../../stacks/stacks.service';
import { ConfigService } from '@nestjs/config';
import { STACKS_TESTNET } from '@stacks/network';

// Mock @stacks/transactions
jest.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: jest.fn(),
  cvToJSON: jest.fn(),
  stringAsciiCV: jest.fn(),
  uintCV: jest.fn(),
}));

import { fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';

describe('TxTemplatesService', () => {
  let service: TxTemplatesService;

  const mockStacksService = {
    getNetwork: jest.fn().mockReturnValue(STACKS_TESTNET),
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
