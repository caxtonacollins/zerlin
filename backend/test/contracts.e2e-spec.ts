import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Contracts Controller (e2e)', () => {
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

  describe('/contracts/fee-oracle (GET)', () => {
    it('should return fee oracle information', () => {
      return request(app.getHttpServer())
        .get('/contracts/fee-oracle')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('currentFeeRate');
          expect(res.body).toHaveProperty('lastUpdated');
          expect(typeof res.body.currentFeeRate).toBe('number');
        });
    });
  });

  describe('/contracts/fee-oracle (POST)', () => {
    it('should update fee oracle rate', () => {
      const updateDto = {
        feeRate: 250,
        congestionLevel: 'medium',
      };

      return request(app.getHttpServer())
        .post('/contracts/fee-oracle')
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('newFeeRate', 250);
        });
    });

    it('should handle invalid fee rate', () => {
      const updateDto = {
        feeRate: -1,
        congestionLevel: 'medium',
      };

      return request(app.getHttpServer())
        .post('/contracts/fee-oracle')
        .send(updateDto)
        .expect(400);
    });
  });

  describe('/contracts/tx-templates (GET)', () => {
    it('should return available transaction templates', () => {
      return request(app.getHttpServer())
        .get('/contracts/tx-templates')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('description');
            expect(res.body[0]).toHaveProperty('type');
          }
        });
    });
  });

  describe('/contracts/tx-templates/:id (GET)', () => {
    it('should return specific transaction template', () => {
      return request(app.getHttpServer())
        .get('/contracts/tx-templates/stx-transfer')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', 'stx-transfer');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('description');
          expect(res.body).toHaveProperty('type');
          expect(res.body).toHaveProperty('payloadSchema');
        });
    });

    it('should handle non-existent template', () => {
      return request(app.getHttpServer())
        .get('/contracts/tx-templates/non-existent')
        .expect(404);
    });
  });

  describe('/contracts/tx-templates (POST)', () => {
    it('should create new transaction template', () => {
      const templateDto = {
        name: 'Custom Transfer',
        description: 'A custom transfer template',
        type: 'transfer',
        payloadSchema: {
          amount: 'number',
          recipient: 'string',
        },
        defaultPayload: {
          amount: 1000000,
          recipient: 'SP2X0TZ59D5SZ8ACQ6VHFQ27H6M6A7M3C5K4E8K2J',
        },
      };

      return request(app.getHttpServer())
        .post('/contracts/tx-templates')
        .send(templateDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Custom Transfer');
          expect(res.body).toHaveProperty('type', 'transfer');
        });
    });

    it('should handle invalid template data', () => {
      const templateDto = {
        name: '',
        description: '',
        type: 'invalid-type',
      };

      return request(app.getHttpServer())
        .post('/contracts/tx-templates')
        .send(templateDto)
        .expect(400);
    });
  });

  describe('/contracts/smart-alerts (GET)', () => {
    it('should return smart alerts', () => {
      return request(app.getHttpServer())
        .get('/contracts/smart-alerts')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/contracts/smart-alerts (POST)', () => {
    it('should create new smart alert', () => {
      const alertDto = {
        userId: 'test-user',
        condition: 'greater_than',
        targetFee: 500,
        stacksAddress: 'SP2X0TZ59D5SZ8ACQ6VHFQ27H6M6A7M3C5K4E8K2J',
        notificationMethod: 'email',
        notificationTarget: 'test@example.com',
      };

      return request(app.getHttpServer())
        .post('/contracts/smart-alerts')
        .send(alertDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('userId', 'test-user');
          expect(res.body).toHaveProperty('condition', 'greater_than');
          expect(res.body).toHaveProperty('targetFee', 500);
          expect(res.body).toHaveProperty('active', true);
        });
    });

    it('should handle invalid alert data', () => {
      const alertDto = {
        userId: '',
        condition: 'invalid-condition',
        targetFee: -1,
      };

      return request(app.getHttpServer())
        .post('/contracts/smart-alerts')
        .send(alertDto)
        .expect(400);
    });
  });

  describe('/contracts/smart-alerts/:id (PUT)', () => {
    it('should update smart alert', () => {
      // First create an alert
      const alertDto = {
        userId: 'test-user-update',
        condition: 'less_than',
        targetFee: 200,
        stacksAddress: 'SP2X0TZ59D5SZ8ACQ6VHFQ27H6M6A7M3C5K4E8K2J',
        notificationMethod: 'email',
        notificationTarget: 'test@example.com',
      };

      return request(app.getHttpServer())
        .post('/contracts/smart-alerts')
        .send(alertDto)
        .expect(201)
        .then((res) => {
          const alertId = res.body.id;

          // Update the alert
          const updateDto = {
            targetFee: 300,
            active: false,
          };

          return request(app.getHttpServer())
            .put(`/contracts/smart-alerts/${alertId}`)
            .send(updateDto)
            .expect(200)
            .expect((updateRes) => {
              expect(updateRes.body).toHaveProperty('targetFee', 300);
              expect(updateRes.body).toHaveProperty('active', false);
            });
        });
    });

    it('should handle non-existent alert update', () => {
      const updateDto = {
        targetFee: 300,
      };

      return request(app.getHttpServer())
        .put('/contracts/smart-alerts/non-existent-id')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/contracts/smart-alerts/:id (DELETE)', () => {
    it('should delete smart alert', () => {
      // First create an alert
      const alertDto = {
        userId: 'test-user-delete',
        condition: 'equal_to',
        targetFee: 400,
        stacksAddress: 'SP2X0TZ59D5SZ8ACQ6VHFQ27H6M6A7M3C5K4E8K2J',
        notificationMethod: 'email',
        notificationTarget: 'test@example.com',
      };

      return request(app.getHttpServer())
        .post('/contracts/smart-alerts')
        .send(alertDto)
        .expect(201)
        .then((res) => {
          const alertId = res.body.id;

          // Delete the alert
          return request(app.getHttpServer())
            .delete(`/contracts/smart-alerts/${alertId}`)
            .expect(200);
        });
    });

    it('should handle non-existent alert deletion', () => {
      return request(app.getHttpServer())
        .delete('/contracts/smart-alerts/non-existent-id')
        .expect(404);
    });
  });
});
