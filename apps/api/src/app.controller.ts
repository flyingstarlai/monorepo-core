import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(@Res() res: Response) {
    return res.redirect(302, '/api/health');
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
