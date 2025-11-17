import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(@Res() res: Response) {
    // Redirect root to health endpoint
    return res.redirect(302, '/health');
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
