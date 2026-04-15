import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { formatCurrentTimeUTC8 } from './utils/date-formatter';

@Injectable()
export class AppService {
  private version: string;

  constructor() {
    // Read version from package.json
    try {
      const packageJson = readFileSync(
        join(__dirname, '../../package.json'),
        'utf8',
      );
      this.version = JSON.parse(packageJson).version || '0.0.0';
    } catch {
      this.version = '0.0.0';
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: formatCurrentTimeUTC8(),
      uptime: process.uptime(),
      version: this.version,
      service: 'mono-core-api',
    };
  }
}
