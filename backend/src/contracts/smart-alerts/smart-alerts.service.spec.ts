import { Test, TestingModule } from '@nestjs/testing';
import { SmartAlertsService } from './smart-alerts.service';
import { StacksService } from '../../stacks/stacks.service';
import { ConfigService } from '@nestjs/config';
import { STACKS_TESTNET } from '@stacks/network';

// Mock @stacks/transactions
jest.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: jest.fn(),
  cvToJSON: jest.fn(),
  standardPrincipalCV: jest.fn(),
  uintCV: jest.fn(),
}));

import { fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';

describe('SmartAlertsService', () => {
  let service: SmartAlertsService;

  const mockStacksService = {
    getNetwork: jest.fn().mockReturnValue(STACKS_TESTNET),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmartAlertsService,
        { provide: StacksService, useValue: mockStacksService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<SmartAlertsService>(SmartAlertsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAlertStats', () => {
    it('should return alert stats', async () => {
      (fetchCallReadOnlyFunction as jest.Mock).mockResolvedValue({});
      (cvToJSON as jest.Mock).mockReturnValue({ value: { 'total-created': 10 } });

      const stats = await service.getAlertStats();
      expect(stats).toEqual({ 'total-created': 10 });
    });
  });

  describe('checkAlertTrigger', () => {
      it('should return true if alert should trigger', async () => {
          (fetchCallReadOnlyFunction as jest.Mock).mockResolvedValue({});
          (cvToJSON as jest.Mock).mockReturnValue({ 
              success: true, 
              value: { value: true } 
          });

          const result = await service.checkAlertTrigger('ST123...', 1, 500);
          expect(result).toBe(true);
      });

      it('should return false if alert check fails/errors', async () => {
         (fetchCallReadOnlyFunction as jest.Mock).mockResolvedValue({});
         (cvToJSON as jest.Mock).mockReturnValue({ success: false }); // e.g. ERR_ALERT_NOT_FOUND

         const result = await service.checkAlertTrigger('ST123...', 99, 500);
         expect(result).toBe(false);
      });
  });
});
