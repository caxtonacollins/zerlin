import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Fee Controller (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/fee/estimate (POST)', () => {
    it('should estimate fee for transfer transaction', () => {
      const estimateDto = {
        type: 'transfer',
        payload: {
          amount: 1000000,
          recipient: 'SP2X0TZ59D5SZ8ACQ6VHFQ27H6M6A7M3C5K4E8K2J',
        },
      };

      return request(app.getHttpServer())
        .post('/fee/estimate')
        .send(estimateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('transactionType', 'transfer');
          expect(res.body).toHaveProperty('estimatedFee');
          expect(res.body).toHaveProperty('breakdown');
          expect(res.body).toHaveProperty('networkStatus');
          expect(res.body.estimatedFee).toHaveProperty('stx');
          expect(res.body.estimatedFee).toHaveProperty('microStx');
          expect(res.body.estimatedFee).toHaveProperty('usd');
          expect(typeof res.body.estimatedFee.microStx).toBe('number');
        });
    });

    it('should estimate fee for contract call transaction', () => {
      const estimateDto = {
        type: 'contract-call',
        payload: {
          contractAddress: 'SP2X0TZ59D5SZ8ACQ6VHFQ27H6M6A7M3C5K4E8K2J',
          contractName: 'example-contract',
          functionName: 'transfer',
          functionArgs: [],
        },
      };

      return request(app.getHttpServer())
        .post('/fee/estimate')
        .send(estimateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('transactionType', 'contract-call');
          expect(res.body).toHaveProperty('estimatedFee');
          expect(res.body).toHaveProperty('breakdown');
        });
    });

    it('should handle invalid transaction type', () => {
      const estimateDto = {
        type: 'invalid-type',
        payload: {},
      };

      return request(app.getHttpServer())
        .post('/fee/estimate')
        .send(estimateDto)
        .expect(400);
    });

    it('should handle missing required fields', () => {
      const estimateDto = {};

      return request(app.getHttpServer())
        .post('/fee/estimate')
        .send(estimateDto)
        .expect(400);
    });
  });

  describe('/fee/network-status (GET)', () => {
    it('should return current network status', () => {
      return request(app.getHttpServer())
        .get('/fee/network-status')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('congestionLevel');
          expect(res.body).toHaveProperty('averageFeeRate');
          expect(res.body).toHaveProperty('mempoolSize');
          expect(res.body).toHaveProperty('blockHeight');
          expect(['low', 'medium', 'high']).toContain(res.body.congestionLevel);
          expect(typeof res.body.averageFeeRate).toBe('number');
          expect(typeof res.body.mempoolSize).toBe('number');
          expect(typeof res.body.blockHeight).toBe('number');
        });
    });
  });

  describe('/fee/breakdown (POST)', () => {
    it('should provide fee breakdown for transaction', () => {
      const breakdownDto = {
        type: 'transfer',
        payload: {
          amount: 1000000,
          recipient: 'SP2X0TZ59D5SZ8ACQ6VHFQ27H6M6A7M3C5K4E8K2J',
        },
      };

      return request(app.getHttpServer())
        .post('/fee/breakdown')
        .send(breakdownDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('baseFee');
          expect(res.body).toHaveProperty('executionCost');
          expect(res.body).toHaveProperty('dataSize');
          expect(typeof res.body.baseFee).toBe('number');
          expect(typeof res.body.executionCost).toBe('number');
          expect(typeof res.body.dataSize).toBe('number');
        });
    });
  });
});
