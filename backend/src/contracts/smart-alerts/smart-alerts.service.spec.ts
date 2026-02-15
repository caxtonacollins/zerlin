import { Test, TestingModule } from '@nestjs/testing';
import { SmartAlertsService } from './smart-alerts.service';
import { StacksService } from '../../stacks/stacks.service';
import { ConfigService } from '@nestjs/config';
import { STACKS_TESTNET } from '@stacks/network';

// Mock @stacks/transactions
jest.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: jest.fn(),
  cvToJSON: jest.fn(),
  standardPrincipalCV: jest.fn().mockImplementation((val) => ({ type: 'principal', value: val })),
  uintCV: jest.fn().mockImplementation((val) => ({ type: 'uint', value: val })),
}));

import { fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Alert } from '../../entities/alert.entity';
import { User } from '../../entities/user.entity';

describe('SmartAlertsService', () => {
  let service: SmartAlertsService;
  let stacksService: StacksService;

  const mockStacksService = {
    getNetwork: jest.fn().mockReturnValue(STACKS_TESTNET),
    broadcastContractCall: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'),
  };

  const mockAlertRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmartAlertsService,
        { provide: StacksService, useValue: mockStacksService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(Alert), useValue: mockAlertRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<SmartAlertsService>(SmartAlertsService);
    stacksService = module.get<StacksService>(StacksService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('markTriggered', () => {
    it('should broadcast contract call to mark alert as triggered', async () => {
      const txid = '0xabc';
      (stacksService.broadcastContractCall as jest.Mock).mockResolvedValue(txid);

      const result = await service.markTriggered('ST123...', 1, 100);
      expect(result).toBe(txid);
      expect(stacksService.broadcastContractCall).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'mark-triggered',
        expect.arrayContaining([expect.anything(), expect.anything(), expect.anything()])
      );
    });
  });

  describe('setFeeOracle', () => {
    it('should broadcast contract call to set fee oracle', async () => {
      const txid = '0xdef';
      (stacksService.broadcastContractCall as jest.Mock).mockResolvedValue(txid);

      const result = await service.setFeeOracle('ST456...');
      expect(result).toBe(txid);
      expect(stacksService.broadcastContractCall).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'set-fee-oracle',
        expect.arrayContaining([expect.anything()])
      );
    });
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
