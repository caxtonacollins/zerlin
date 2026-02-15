import { Test, TestingModule } from '@nestjs/testing';
import { SmartAlertsController } from './smart-alerts.controller';
import { SmartAlertsService } from './smart-alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { MarkTriggeredDto, InitializeSmartAlertsDto } from './dto/mark-triggered.dto';

describe('SmartAlertsController', () => {
  let controller: SmartAlertsController;
  let service: SmartAlertsService;

  const mockSmartAlertsService = {
    createAlert: jest.fn(),
    markTriggered: jest.fn(),
    initialize: jest.fn(),
    getAlertStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmartAlertsController],
      providers: [
        { provide: SmartAlertsService, useValue: mockSmartAlertsService },
      ],
    }).compile();

    controller = module.get<SmartAlertsController>(SmartAlertsController);
    service = module.get<SmartAlertsService>(SmartAlertsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAlert', () => {
    it('should call createAlert on service', async () => {
      const dto: CreateAlertDto = { 
        userAddress: 'ST123...', 
        targetFee: 1000, 
        condition: 'BELOW' 
      };
      await controller.createAlert(dto);
      expect(service.createAlert).toHaveBeenCalledWith(dto);
    });
  });

  describe('markTriggered', () => {
    it('should call markTriggered on service', async () => {
      const dto: MarkTriggeredDto = { 
        userAddress: 'ST123...', 
        alertId: 1, 
        currentFee: 100 
      };
      await controller.markTriggered(dto);
      expect(service.markTriggered).toHaveBeenCalledWith(dto.userAddress, dto.alertId, dto.currentFee);
    });
  });

  describe('initialize', () => {
    it('should call initialize on service', async () => {
      const dto: InitializeSmartAlertsDto = { oracleAddress: 'ST456...' };
      await controller.initialize(dto);
      expect(service.initialize).toHaveBeenCalledWith(dto.oracleAddress);
    });
  });

  describe('getAlertStats', () => {
    it('should call getAlertStats on service', async () => {
      await controller.getAlertStats();
      expect(service.getAlertStats).toHaveBeenCalled();
    });
  });
});
