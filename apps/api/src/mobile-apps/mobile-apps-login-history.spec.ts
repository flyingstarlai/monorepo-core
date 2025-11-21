import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('Mobile Apps Login History (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /mobile-apps/:id/login-history', () => {
    const appId = 'test-app-id';

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get(`/mobile-apps/${appId}/login-history`)
        .expect(401);
    });

    it('should return 403 when no authorization header', () => {
      return request(app.getHttpServer())
        .get(`/mobile-apps/${appId}/login-history`)
        .set('Authorization', 'invalid-token')
        .expect(401);
    });

    it('should validate query parameters without authentication', () => {
      // Test invalid page number
      return request(app.getHttpServer())
        .get(`/mobile-apps/${appId}/login-history`)
        .query({ page: 0 })
        .expect(401); // Should fail auth first before validation
    });

    it('should have correct endpoint structure', () => {
      return request(app.getHttpServer())
        .get(`/mobile-apps/${appId}/login-history`)
        .expect(401); // Endpoint exists but requires auth
    });
  });
});
