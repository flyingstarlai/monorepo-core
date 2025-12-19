import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MinioService } from '../minio.service';
import * as Minio from 'minio';

jest.mock('minio');

describe('MinioService', () => {
  let service: MinioService;
  let mockMinioClient: jest.Mocked<Minio.Client>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockMinioClient = {
      bucketExists: jest.fn(),
      makeBucket: jest.fn(),
      putObject: jest.fn(),
      getObject: jest.fn(),
      removeObject: jest.fn(),
      presignedGetObject: jest.fn(),
    } as any;

    mockConfigService = {
      get: jest.fn(),
    } as any;

    (Minio.Client as jest.Mock).mockImplementation(() => mockMinioClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MinioService>(MinioService);

    // Mock environment variables
    mockConfigService.get.mockImplementation((key: string) => {
      const envVars = {
        MINIO_ENDPOINT: 'localhost',
        MINIO_PORT: '9000',
        MINIO_USE_SSL: 'false',
        MINIO_ACCESS_KEY: 'minioadmin',
        MINIO_SECRET_KEY: 'minioadmin123',
        MINIO_GOOGLE_SERVICES_BUCKET: 'google-services',
      };
      return envVars[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload Google Services file successfully', async () => {
    mockMinioClient.bucketExists.mockResolvedValue(true);
    mockMinioClient.putObject.mockResolvedValue(undefined);

    const content = '{"test": "content"}';
    const result = await service.uploadGoogleServices(content);

    expect(result).toBe('latest/google-services.json');
    expect(mockMinioClient.putObject).toHaveBeenCalledTimes(2);
  });

  it('should download latest Google Services file', async () => {
    const mockContent = Buffer.from('{"test": "content"}');
    const mockStream = {
      on: jest.fn((event, callback) => {
        if (event === 'data') callback(mockContent);
        if (event === 'end') callback();
      }),
    } as any;

    mockMinioClient.getObject.mockResolvedValue(mockStream);

    const result = await service.downloadLatestGoogleServices();

    expect(result).toEqual(mockContent);
    expect(mockMinioClient.getObject).toHaveBeenCalledWith(
      'google-services',
      'latest/google-services.json',
    );
  });

  it('should create bucket if it does not exist', async () => {
    mockMinioClient.bucketExists.mockResolvedValue(false);
    mockMinioClient.makeBucket.mockResolvedValue(undefined);
    mockMinioClient.putObject.mockResolvedValue(undefined);

    await service.uploadGoogleServices('{"test": "content"}');

    expect(mockMinioClient.makeBucket).toHaveBeenCalledWith('google-services');
  });
});
