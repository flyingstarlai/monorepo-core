import { ConfigService } from '@nestjs/config';

export const corsConfig = (configService: ConfigService) => ({
  origin: configService.get<string>('CORS_ORIGINS')?.split(',') || [],
  credentials: configService.get<string>('CORS_CREDENTIALS') === 'true',
});
