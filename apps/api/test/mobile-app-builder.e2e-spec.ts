import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, beforeEach } from '@jest/globals';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  User,
  MobileAppDefinition,
  MobileAppBuild,
} from '../src/app-builder/entities';
import { JwtService } from '@nestjs/jwt';

describe('Mobile App Builder E2E', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let mobileAppDefinitionRepository: Repository<MobileAppDefinition>;
  let mobileAppBuildRepository: Repository<MobileAppBuild>;
  let jwtService: JwtService;

  let adminToken: string;
  let userToken: string;
  let testDefinition: MobileAppDefinition;
  let testBuild: MobileAppBuild;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    mobileAppDefinitionRepository = moduleFixture.get<
      Repository<MobileAppDefinition>
    >(getRepositoryToken(MobileAppDefinition));
    mobileAppBuildRepository = moduleFixture.get<Repository<MobileAppBuild>>(
      getRepositoryToken(MobileAppBuild),
    );
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  beforeEach(async () => {
    // Create test users
    const adminUser = await userRepository.save({
      id: 'admin_test',
      username: 'admin_test',
      password: 'password',
      role: 'admin',
      fullName: 'Test Admin',
      deptNo: 'DEPT001',
      deptName: 'Test Department',
      isActive: true,
    });

    const regularUser = await userRepository.save({
      id: 'user_test',
      username: 'user_test',
      password: 'password',
      role: 'user',
      fullName: 'Test User',
      deptNo: 'DEPT002',
      deptName: 'Test Department',
      isActive: true,
    });

    adminToken = jwtService.sign({
      sub: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
    });
    userToken = jwtService.sign({
      sub: regularUser.id,
      username: regularUser.username,
      role: regularUser.role,
    });

    // Create test definition
    testDefinition = await mobileAppDefinitionRepository.save({
      id: 'def_test',
      appName: 'Test App',
      appId: 'test-app-id',
      appModule: 'module1',
      serverIp: '192.168.1.1',
      createdBy: adminUser.id,
    });

    // Create test build
    testBuild = await mobileAppBuildRepository.save({
      id: 'build_test',
      appDefinitionId: testDefinition.id,
      status: BuildStatus.COMPLETED,
      artifactPath: 'test-app-id/module1/test-app-id-test-app.apk',
      startedBy: adminUser.id,
    });
  });

  afterEach(async () => {
    await mobileAppBuildRepository.delete({});
    await mobileAppDefinitionRepository.delete({});
    await userRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Permissions', () => {
    describe('Admin/Manager access', () => {
      it('should allow admin to create definition', async () => {
        const createDto = {
          appName: 'New App',
          appModule: 'module1',
          serverIp: '192.168.1.2',
        };

        const response = await request(app.getHttpServer())
          .post('/app-builder/definitions')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(createDto)
          .expect(201);

        expect(response.body.appName).toBe(createDto.appName);
      });

      it('should allow admin to download artifact', async () => {
        const response = await request(app.getHttpServer())
          .get(`/app-builder/builds/${testBuild.id}/download`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.downloadUrl).toBeDefined();
        expect(response.body.fileName).toBeDefined();
      });
    });

    describe('Regular user restrictions', () => {
      it('should deny regular user from creating definition', async () => {
        const createDto = {
          appName: 'New App',
          appModule: 'module1',
          serverIp: '192.168.1.2',
        };

        await request(app.getHttpServer())
          .post('/app-builder/definitions')
          .set('Authorization', `Bearer ${userToken}`)
          .send(createDto)
          .expect(403);
      });

      it('should deny regular user from downloading artifact', async () => {
        await request(app.getHttpServer())
          .get(`/app-builder/builds/${testBuild.id}/download`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should allow regular user to view definitions', async () => {
        const response = await request(app.getHttpServer())
          .get('/app-builder/definitions')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });

    describe('Unauthenticated access', () => {
      it('should deny unauthenticated access to protected endpoints', async () => {
        await request(app.getHttpServer())
          .post('/app-builder/definitions')
          .send({})
          .expect(401);

        await request(app.getHttpServer())
          .get(`/app-builder/builds/${testBuild.id}/download`)
          .expect(401);
      });
    });
  });

  describe('Presigned Download', () => {
    it('should return 404 for non-existent build', async () => {
      await request(app.getHttpServer())
        .get('/app-builder/builds/non-existent/download')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 403 for incomplete build', async () => {
      const incompleteBuild = await mobileAppBuildRepository.save({
        id: 'incomplete_build',
        appDefinitionId: testDefinition.id,
        status: BuildStatus.FAILED,
        startedBy: 'admin_test',
      });

      await request(app.getHttpServer())
        .get(`/app-builder/builds/${incompleteBuild.id}/download`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      await mobileAppBuildRepository.delete(incompleteBuild.id);
    });
  });

  describe('Webhook Integration', () => {
    it('should handle build completion webhook and set artifactPath', async () => {
      // Create a build record
      const testBuild = await mobileAppBuildRepository.save({
        id: 'webhook-test-build',
        appDefinitionId: testDefinition.id,
        status: 'building',
        startedBy: 'admin_test',
      });

      // Send webhook with artifactPath
      const webhookPayload = {
        status: 'completed',
        stage: 'Upload to MinIO',
        progress: 100,
        artifactPath: 'TWSBP/v1.0.0/app-release.apk',
        startTime: Date.now() - 60000, // 1 minute ago
        endTime: Date.now(),
        metrics: {
          jenkinsBuildNumber: 42,
          gitCommit: 'abc123',
        },
      };

      const response = await request(app.getHttpServer())
        .post(`/app-builder/builds/${testBuild.id}/webhook`)
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.build.id).toBe(testBuild.id);
      expect(response.body.build.artifactPath).toBe(
        'TWSBP/v1.0.0/app-release.apk',
      );
      expect(response.body.build.status).toBe('completed');

      // Verify download endpoint now works
      const downloadResponse = await request(app.getHttpServer())
        .get(`/app-builder/builds/${testBuild.id}/download`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Should return 200 with proper structure (even if MinIO is not available)
      expect(downloadResponse.status).toBe(200);
      expect(downloadResponse.body.url).toBeDefined();
      expect(downloadResponse.body.fileName).toBe('app-release.apk');
      expect(downloadResponse.body.expiresAt).toBeDefined();

      await mobileAppBuildRepository.delete(testBuild.id);
    });

    it('should not set artifactPath on failed builds', async () => {
      const testBuild = await mobileAppBuildRepository.save({
        id: 'webhook-failed-build',
        appDefinitionId: testDefinition.id,
        status: 'building',
        startedBy: 'admin_test',
      });

      const webhookPayload = {
        status: 'failed',
        artifactPath: 'TWSBP/v1.0.0/app-release.apk', // Should be ignored
        error: 'Build failed due to compilation error',
      };

      const response = await request(app.getHttpServer())
        .post(`/app-builder/builds/${testBuild.id}/webhook`)
        .send(webhookPayload)
        .expect(200);

      expect(response.body.build.status).toBe('failed');
      expect(response.body.build.artifactPath).toBeNull(); // Should not be set

      await mobileAppBuildRepository.delete(testBuild.id);
    });

    it('should return 404 for webhook with invalid build ID', async () => {
      const webhookPayload = {
        status: 'completed',
        artifactPath: 'TWSBP/v1.0.0/app-release.apk',
      };

      await request(app.getHttpServer())
        .post('/app-builder/builds/invalid-build-id/webhook')
        .send(webhookPayload)
        .expect(404);
    });
  });
});
