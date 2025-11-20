import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileApp } from '../mobile-apps/entities/tc-app-user.entity';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

describe('Mobile Apps API (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let mobileAppRepository: Repository<MobileApp>;
  let userRepository: Repository<User>;

  const mockUser = {
    id: '1',
    username: 'testuser',
    fullName: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMobileApp: MobileApp = {
    id: '1',
    app_id: 'tcsmart',
    app_name: 'Test App',
    app_version: '1.0.0',
    module: null,
    token: 'test-token',
    name: 'Test Device',
    company: 'Test Company',
    is_active: true,
    userid: 'user1',
    username: 'username1',
    useremail: 'user1@example.com',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(MobileApp))
      .useValue({
        find: jest.fn().mockResolvedValue([mockMobileApp]),
      })
      .overrideProvider(getRepositoryToken(User))
      .useValue({
        findOne: jest.fn().mockResolvedValue(mockUser),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    mobileAppRepository = moduleFixture.get<Repository<MobileApp>>(
      getRepositoryToken(MobileApp),
    );
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /mobile-apps', () => {
    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer()).get('/mobile-apps').expect(401);
    });

    it('should return 403 when user has insufficient role', async () => {
      const userWithUserRole = { ...mockUser, role: 'user' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userWithUserRole);

      const token = jwtService.sign({
        sub: userWithUserRole.id,
        username: userWithUserRole.username,
      });

      return request(app.getHttpServer())
        .get('/mobile-apps')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 200 when admin user accesses the endpoint', async () => {
      const token = jwtService.sign({
        sub: mockUser.id,
        username: mockUser.username,
      });

      return request(app.getHttpServer())
        .get('/mobile-apps')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toHaveProperty('appId');
          expect(res.body[0]).toHaveProperty('appName');
          expect(res.body[0]).toHaveProperty('latestVersion');
          expect(res.body[0]).toHaveProperty('versions');
          expect(res.body[0]).toHaveProperty('activeDevices');
          expect(res.body[0]).toHaveProperty('totalDevices');
          expect(res.body[0]).toHaveProperty('uniqueUsers');
          expect(res.body[0]).toHaveProperty('companies');
        });
    });

    it('should return 200 when manager user accesses the endpoint', async () => {
      const managerUser = { ...mockUser, role: 'manager' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(managerUser);

      const token = jwtService.sign({
        sub: managerUser.id,
        username: managerUser.username,
      });

      return request(app.getHttpServer())
        .get('/mobile-apps')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return aggregated data correctly', async () => {
      const mockMobileApps: MobileApp[] = [
        {
          id: '1',
          app_id: 'tcsmart',
          app_name: 'Test App',
          app_version: '1.0.0',
          module: null,
          token: 'token1',
          name: 'Device 1',
          company: 'Company A',
          is_active: true,
          userid: 'user1',
          username: '',
          useremail: 'user1@example.com',
        },
        {
          id: '2',
          app_id: 'tcsmart',
          app_name: 'Test App',
          app_version: '1.1.0',
          module: null,
          token: 'token2',
          name: 'Device 2',
          company: 'Company B',
          is_active: false,
          userid: 'user2',
          username: '',
          useremail: 'user2@example.com',
        },
      ];

      jest.spyOn(mobileAppRepository, 'find').mockResolvedValue(mockMobileApps);

      const token = jwtService.sign({
        sub: mockUser.id,
        username: mockUser.username,
      });

      return request(app.getHttpServer())
        .get('/mobile-apps')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          const app = res.body[0];
          expect(app.appId).toBe('tcsmart');
          expect(app.appName).toBe('Test App');
          expect(app.latestVersion).toBe('1.1.0');
          expect(app.versions).toEqual(
            expect.arrayContaining(['1.0.0', '1.1.0']),
          );
          expect(app.activeDevices).toBe(1);
          expect(app.totalDevices).toBe(2);
          expect(app.uniqueUsers).toBe(2);
          expect(app.companies).toBe(2);
        });
    });
  });
});
