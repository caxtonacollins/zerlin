import { Test, TestingModule } from '@nestjs/testing';
import { FeeOracleController } from './fee-oracle.controller';
import { FeeOracleService } from './fee-oracle.service';
import { UpdateFeeRateDto, InitializeOracleDto } from './dto/update-fee.dto';

describe('FeeOracleController', () => {
  let controller: FeeOracleController;
  let service: FeeOracleService;

  const mockFeeOracleService = {
    getFeeRate: jest.fn(),
    estimateTransferFee: jest.fn(),
    updateFeeRate: jest.fn(),
    initialize: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeeOracleController],
      providers: [
        { provide: FeeOracleService, useValue: mockFeeOracleService },
      ],
    }).compile();

    controller = module.get<FeeOracleController>(FeeOracleController);
    service = module.get<FeeOracleService>(FeeOracleService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFeeRate', () => {
    it('should call getFeeRate on service', async () => {
      await controller.getFeeRate();
      expect(service.getFeeRate).toHaveBeenCalled();
    });
  });

  describe('estimateTransferFee', () => {
    it('should call estimateTransferFee on service', async () => {
      await controller.estimateTransferFee();
      expect(service.estimateTransferFee).toHaveBeenCalled();
    });
  });

  describe('updateFeeRate', () => {
    it('should call updateFeeRate on service with dto values', async () => {
      const dto: UpdateFeeRateDto = { feeRate: 300, congestion: 'low' };
      await controller.updateFeeRate(dto);
      expect(service.updateFeeRate).toHaveBeenCalledWith(dto.feeRate, dto.congestion);
    });
  });

  describe('initialize', () => {
    it('should call initialize on service with dto value', async () => {
      const dto: InitializeOracleDto = { initialFeeRate: 250 };
      await controller.initialize(dto);
      expect(service.initialize).toHaveBeenCalledWith(dto.initialFeeRate);
    });
  });
});
