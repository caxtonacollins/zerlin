import { Test, TestingModule } from '@nestjs/testing';
import { TxTemplatesController } from './tx-templates.controller';
import { TxTemplatesService } from './tx-templates.service';
import { CreateTemplateDto, UpdateTemplateDto, InitializeTemplatesDto } from './dto/template.dto';

describe('TxTemplatesController', () => {
  let controller: TxTemplatesController;
  let service: TxTemplatesService;

  const mockTxTemplatesService = {
    initializeTemplates: jest.fn(),
    setFeeOracle: jest.fn(),
    createTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    getTemplate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TxTemplatesController],
      providers: [
        { provide: TxTemplatesService, useValue: mockTxTemplatesService },
      ],
    }).compile();

    controller = module.get<TxTemplatesController>(TxTemplatesController);
    service = module.get<TxTemplatesService>(TxTemplatesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('initialize', () => {
    it('should call initializeTemplates and setFeeOracle on service', async () => {
      const dto: InitializeTemplatesDto = { oracleAddress: 'ST123...' };
      await controller.initialize(dto);
      expect(service.initializeTemplates).toHaveBeenCalled();
      expect(service.setFeeOracle).toHaveBeenCalledWith(dto.oracleAddress);
    });
  });

  describe('createTemplate', () => {
    it('should call createTemplate on service', async () => {
      const dto: CreateTemplateDto = {
        templateId: 'test',
        sizeBytes: 100,
        gasUnits: 1000,
        description: 'desc',
        category: 'cat',
      };
      await controller.createTemplate(dto);
      expect(service.createTemplate).toHaveBeenCalledWith(
        dto.templateId,
        dto.sizeBytes,
        dto.gasUnits,
        dto.description,
        dto.category,
      );
    });
  });

  describe('updateTemplate', () => {
    it('should call updateTemplate on service', async () => {
      const dto: UpdateTemplateDto = { newSizeBytes: 200, newGasUnits: 2000 };
      await controller.updateTemplate('test-id', dto);
      expect(service.updateTemplate).toHaveBeenCalledWith('test-id', dto.newSizeBytes, dto.newGasUnits);
    });
  });

  describe('getTemplate', () => {
    it('should call getTemplate on service', async () => {
      await controller.getTemplate('test-id');
      expect(service.getTemplate).toHaveBeenCalledWith('test-id');
    });
  });
});
